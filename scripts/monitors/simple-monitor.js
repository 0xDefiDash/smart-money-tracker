const { Client } = require('pg');
const https = require('https');

// Database connection
const DATABASE_URL = 'postgresql://role_163a6bf9dc:Nu4LCA6Yui9i9pZt5r68z0EOkvlSUZU0@db-163a6bf9dc.db001.hosteddb.reai.io:5432/163a6bf9dc?connect_timeout=15';

// API Keys
const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImIyZDg5YjIwLWFhYjEtNGFjOC04YmZlLTk4OTM5OWZlZDliNSIsIm9yZ0lkIjoiNDgwNjExIiwidXNlcklkIjoiNDk0NDUyIiwidHlwZUlkIjoiZjdmMzZmYTYtMjdiNC00ZWVhLWIwNDUtMWFjOWFiNzk3NmQ4IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NjI4MDY4OTUsImV4cCI6NDkxODU2Njg5NX0.0K5hGPNPM96Ozx3LTDa1pvKlWmwGcZcQvKOjhbsnMIM';
const ETHERSCAN_API_KEY = 'QBK1KG5ENJCZS17MHHJ7PG1TRJYR2N8IRV';

const results = {
  timestamp: new Date().toISOString(),
  walletsChecked: 0,
  newAlerts: 0,
  errors: [],
  walletDetails: []
};

async function fetchMoralisTransactions(address, chain) {
  return new Promise((resolve, reject) => {
    const chainMap = {
      'ethereum': 'eth',
      'bnb': 'bsc',
      'polygon': 'polygon',
      'arbitrum': 'arbitrum',
      'optimism': 'optimism',
      'base': 'base'
    };
    
    const moralisChain = chainMap[chain.toLowerCase()] || 'eth';
    const url = `https://deep-index.moralis.io/api/v2.2/${address}?chain=${moralisChain}&limit=10`;
    
    const options = {
      headers: {
        'X-API-Key': MORALIS_API_KEY,
        'accept': 'application/json'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.result || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchEtherscanTransactions(address) {
  return new Promise((resolve, reject) => {
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.result || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function monitorWatchlist() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Fetch active watchlist items
    const watchlistQuery = `
      SELECT id, address, chain, "tokenAddress", "tokenSymbol", "lastChecked", "userId"
      FROM watchlist_items
      ORDER BY "lastChecked" ASC
      LIMIT 20
    `;
    
    const watchlistResult = await client.query(watchlistQuery);
    const watchlistItems = watchlistResult.rows;
    
    console.log(`Found ${watchlistItems.length} watchlist items`);
    results.walletsChecked = watchlistItems.length;
    
    for (const item of watchlistItems) {
      const walletDetail = {
        address: item.address,
        chain: item.chain,
        transactionCount: 0,
        newTransactions: 0,
        error: null
      };
      
      try {
        let transactions = [];
        
        // Try Moralis first
        try {
          transactions = await fetchMoralisTransactions(item.address, item.chain);
          console.log(`Fetched ${transactions.length} transactions for ${item.address} on ${item.chain} via Moralis`);
        } catch (moralisError) {
          console.log(`Moralis failed for ${item.address}, trying Etherscan...`);
          
          // Fallback to Etherscan for Ethereum
          if (item.chain.toLowerCase() === 'ethereum') {
            transactions = await fetchEtherscanTransactions(item.address);
            console.log(`Fetched ${transactions.length} transactions for ${item.address} via Etherscan`);
          } else {
            throw new Error(`No API available for chain ${item.chain}`);
          }
        }
        
        walletDetail.transactionCount = transactions.length;
        
        // Filter for new transactions since lastChecked
        const lastChecked = item.lastChecked ? new Date(item.lastChecked) : new Date(0);
        const newTransactions = transactions.filter(tx => {
          const txTime = tx.block_timestamp ? new Date(tx.block_timestamp) : 
                        tx.timeStamp ? new Date(parseInt(tx.timeStamp) * 1000) : 
                        new Date();
          return txTime > lastChecked;
        });
        
        walletDetail.newTransactions = newTransactions.length;
        
        // Create alerts for new transactions
        for (const tx of newTransactions) {
          const alertQuery = `
            INSERT INTO transaction_alerts (
              id, "userId", "walletAddress", chain, "transactionHash",
              "fromAddress", "toAddress", value, "tokenAddress", "tokenSymbol",
              type, "isRead", "notifiedAt", "createdAt"
            ) VALUES (
              gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, NOW(), NOW()
            )
            ON CONFLICT DO NOTHING
          `;
          
          try {
            await client.query(alertQuery, [
              item.userId,
              item.address,
              item.chain,
              tx.hash || tx.transactionHash || '',
              tx.from_address || tx.from || '',
              tx.to_address || tx.to || '',
              tx.value || '0',
              tx.token_address || item.tokenAddress || null,
              tx.token_symbol || item.tokenSymbol || null,
              'transaction'
            ]);
            results.newAlerts++;
          } catch (insertError) {
            console.error(`Error inserting alert: ${insertError.message}`);
          }
        }
        
        // Update lastChecked timestamp
        await client.query(
          'UPDATE watchlist_items SET "lastChecked" = NOW() WHERE id = $1',
          [item.id]
        );
        
      } catch (error) {
        walletDetail.error = error.message;
        results.errors.push({
          wallet: item.address,
          chain: item.chain,
          error: error.message
        });
        console.error(`Error checking wallet ${item.address}:`, error.message);
      }
      
      results.walletDetails.push(walletDetail);
      
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
    results.errors.push({ fatal: error.message });
  } finally {
    await client.end();
  }
  
  return results;
}

// Run the monitoring
monitorWatchlist()
  .then(results => {
    console.log('\n=== MONITORING RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('Monitoring failed:', error);
    process.exit(1);
  });
