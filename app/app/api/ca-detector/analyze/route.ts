
import { NextResponse } from 'next/server'
import { ContractAnalysisResult, SecurityCheck, TopHolder, LiquidityPool, TransactionAnomaly, WalletPatternAlert, KnownScammerWallet } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Known scammer wallet database (expandable)
// This is a curated list of wallets known for pump and dump schemes, rug pulls, and scams
const KNOWN_SCAMMER_WALLETS: Record<string, { scamCount: number; totalLoss: string; lastScam: string; scamTypes: string[] }> = {
  // Example entries - in production, this would be fetched from a database
  '0x0000000000000000000000000000000000000000': {
    scamCount: 0,
    totalLoss: '$0',
    lastScam: 'N/A',
    scamTypes: []
  },
  // Add more known scammer wallets here
  // Format: 'wallet_address': { scamCount, totalLoss, lastScam, scamTypes }
}

// Suspicious wallet patterns to detect
const SUSPICIOUS_PATTERNS = {
  // Wallet created very recently (within 7 days)
  NEW_WALLET_THRESHOLD: 7 * 24 * 60 * 60 * 1000,
  // High concentration threshold (single wallet holding >20%)
  HIGH_CONCENTRATION: 20,
  // Coordinated trading threshold (multiple wallets with similar patterns)
  COORDINATED_THRESHOLD: 0.85, // 85% similarity
  // Bot-like behavior threshold (very fast transactions)
  BOT_SPEED_THRESHOLD: 5000, // milliseconds
}

// Get the appropriate explorer API URL and key based on blockchain
function getExplorerConfig(blockchain: string) {
  const configs: Record<string, { apiUrl: string; key: string; name: string }> = {
    ethereum: {
      apiUrl: 'https://api.etherscan.io/api',
      key: process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken',
      name: 'Etherscan'
    },
    bsc: {
      apiUrl: 'https://api.bscscan.com/api',
      key: process.env.BSCSCAN_API_KEY || 'YourApiKeyToken',
      name: 'BscScan'
    },
    polygon: {
      apiUrl: 'https://api.polygonscan.com/api',
      key: process.env.POLYGONSCAN_API_KEY || 'YourApiKeyToken',
      name: 'PolygonScan'
    },
    arbitrum: {
      apiUrl: 'https://api.arbiscan.io/api',
      key: process.env.ARBISCAN_API_KEY || 'YourApiKeyToken',
      name: 'Arbiscan'
    },
    base: {
      apiUrl: 'https://api.basescan.org/api',
      key: process.env.BASESCAN_API_KEY || 'YourApiKeyToken',
      name: 'BaseScan'
    }
  }
  return configs[blockchain] || configs.ethereum
}

// Fetch contract source code and ABI
async function getContractInfo(contractAddress: string, blockchain: string) {
  try {
    const config = getExplorerConfig(blockchain)
    const url = `${config.apiUrl}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${config.key}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status === '1' && data.result && data.result[0]) {
      const result = data.result[0]
      return {
        name: result.ContractName || 'Unknown',
        isVerified: result.SourceCode !== '',
        compiler: result.CompilerVersion || 'Unknown',
        sourceCode: result.SourceCode || '',
        abi: result.ABI || '[]'
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching contract info:', error)
    return null
  }
}

// Fetch token information
async function getTokenInfo(contractAddress: string, blockchain: string) {
  try {
    const config = getExplorerConfig(blockchain)
    const url = `${config.apiUrl}?module=stats&action=tokensupply&contractaddress=${contractAddress}&apikey=${config.key}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    return data
  } catch (error) {
    console.error('Error fetching token info:', error)
    return null
  }
}

// Fetch holder information using DexScreener
async function getDexScreenerData(contractAddress: string, blockchain: string) {
  try {
    // Map blockchain names to DexScreener chain IDs
    const chainMap: Record<string, string> = {
      ethereum: 'ethereum',
      bsc: 'bsc',
      polygon: 'polygon',
      arbitrum: 'arbitrum',
      base: 'base',
      solana: 'solana'
    }
    
    const chainId = chainMap[blockchain] || 'ethereum'
    const url = `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    return data
  } catch (error) {
    console.error('Error fetching DexScreener data:', error)
    return null
  }
}

// Check for honeypot using Honeypot.is API
async function checkHoneypot(contractAddress: string, blockchain: string) {
  try {
    // Map blockchain to chain ID
    const chainMap: Record<string, number> = {
      ethereum: 1,
      bsc: 56,
      polygon: 137,
      arbitrum: 42161,
      base: 8453
    }
    
    const chainId = chainMap[blockchain] || 1
    const url = `https://api.honeypot.is/v2/IsHoneypot?address=${contractAddress}&chainID=${chainId}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    return data
  } catch (error) {
    console.error('Error checking honeypot:', error)
    return null
  }
}

// Fetch top holders
async function getTopHolders(contractAddress: string, blockchain: string) {
  try {
    const config = getExplorerConfig(blockchain)
    const url = `${config.apiUrl}?module=token&action=tokenholderlist&contractaddress=${contractAddress}&page=1&offset=10&apikey=${config.key}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status === '1' && data.result) {
      return data.result
    }
    return []
  } catch (error) {
    console.error('Error fetching top holders:', error)
    return []
  }
}

// Fetch wallet transactions to analyze patterns
async function getWalletTransactions(walletAddress: string, contractAddress: string, blockchain: string) {
  try {
    const config = getExplorerConfig(blockchain)
    // Fetch ERC20 token transfers for the wallet
    const url = `${config.apiUrl}?module=account&action=tokentx&contractaddress=${contractAddress}&address=${walletAddress}&page=1&offset=100&sort=desc&apikey=${config.key}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status === '1' && data.result) {
      return data.result
    }
    return []
  } catch (error) {
    console.error('Error fetching wallet transactions:', error)
    return []
  }
}

// Analyze wallet for pump and dump patterns
async function analyzeWalletForPumpDump(walletAddress: string, contractAddress: string, blockchain: string, holdingPercentage: number) {
  const riskFlags: string[] = []
  let riskLevel: 'high' | 'medium' | 'low' | 'clean' = 'clean'
  let previousScams = 0
  let walletAge = 'Unknown'
  
  try {
    // 1. Check if wallet is in known scammer database
    const fullAddress = walletAddress.length < 42 ? walletAddress : walletAddress // Use as-is
    
    // For display purposes, we'll use the shortened address
    let checkAddress = walletAddress
    // Try to find in database (in production, this would check against a real database)
    Object.keys(KNOWN_SCAMMER_WALLETS).forEach(knownAddress => {
      if (checkAddress.toLowerCase().includes(knownAddress.toLowerCase().slice(0, 10)) || 
          knownAddress.toLowerCase().includes(checkAddress.toLowerCase().slice(0, 10))) {
        const scammerData = KNOWN_SCAMMER_WALLETS[knownAddress]
        previousScams = scammerData.scamCount
        riskFlags.push(`⚠️ Known scammer: ${scammerData.scamCount} previous scams`)
        riskLevel = 'high'
      }
    })
    
    // 2. Analyze wallet concentration
    if (holdingPercentage > SUSPICIOUS_PATTERNS.HIGH_CONCENTRATION) {
      riskFlags.push(`🔴 High concentration: Controls ${holdingPercentage.toFixed(1)}% of supply`)
      if (riskLevel === 'clean') riskLevel = 'high'
    } else if (holdingPercentage > 10) {
      riskFlags.push(`🟡 Significant holder: ${holdingPercentage.toFixed(1)}% of supply`)
      if (riskLevel === 'clean') riskLevel = 'medium'
    }
    
    // 3. Fetch and analyze wallet transaction history
    const transactions = await getWalletTransactions(fullAddress, contractAddress, blockchain)
    
    if (transactions && transactions.length > 0) {
      // Analyze transaction patterns
      const buys = transactions.filter((tx: any) => tx.to?.toLowerCase() === fullAddress.toLowerCase())
      const sells = transactions.filter((tx: any) => tx.from?.toLowerCase() === fullAddress.toLowerCase())
      
      // Check for pump and dump pattern (quick buy and sell)
      if (buys.length > 0 && sells.length > 0) {
        const firstBuy = buys[buys.length - 1]
        const latestSell = sells[0]
        const timeDiff = parseInt(latestSell.timeStamp) - parseInt(firstBuy.timeStamp)
        
        // If bought and sold within 24 hours
        if (timeDiff > 0 && timeDiff < 86400) {
          riskFlags.push('📊 Quick flip pattern: Bought and sold within 24h')
          if (riskLevel !== 'high' && riskLevel !== 'medium') riskLevel = 'medium'
        }
      }
      
      // Check for bot-like behavior (very fast sequential transactions)
      let consecutiveFastTxs = 0
      for (let i = 1; i < transactions.length; i++) {
        const timeDiff = Math.abs(parseInt(transactions[i-1].timeStamp) - parseInt(transactions[i].timeStamp)) * 1000
        if (timeDiff < SUSPICIOUS_PATTERNS.BOT_SPEED_THRESHOLD) {
          consecutiveFastTxs++
        }
      }
      
      if (consecutiveFastTxs > 3) {
        riskFlags.push('🤖 Bot-like trading: Multiple rapid transactions detected')
        if (riskLevel === 'clean') riskLevel = 'medium'
      }
      
      // Calculate wallet age from first transaction
      if (transactions.length > 0) {
        const oldestTx = transactions[transactions.length - 1]
        const ageInDays = Math.floor((Date.now() / 1000 - parseInt(oldestTx.timeStamp)) / 86400)
        walletAge = ageInDays === 0 ? 'Today' : `${ageInDays} day${ageInDays === 1 ? '' : 's'}`
        
        // Flag very new wallets with large holdings
        if (ageInDays < 7 && holdingPercentage > 5) {
          riskFlags.push(`🆕 New wallet with large holdings: Created ${walletAge} ago`)
          if (riskLevel === 'clean') riskLevel = 'medium'
        }
      }
      
      // Check for unusual buy/sell pattern
      const buyValue = buys.reduce((sum: number, tx: any) => sum + parseFloat(tx.value || '0'), 0)
      const sellValue = sells.reduce((sum: number, tx: any) => sum + parseFloat(tx.value || '0'), 0)
      
      if (sellValue > buyValue * 2) {
        riskFlags.push('💰 Unusual profit pattern: Sold more than 2x initial buy')
        if (riskLevel !== 'high' && riskLevel !== 'medium') riskLevel = 'medium'
      }
    } else {
      // No transaction history available
      if (holdingPercentage > 5) {
        riskFlags.push('❓ No transaction history found (may be initial distribution)')
        if (riskLevel === 'clean') riskLevel = 'low'
      }
    }
    
    // If no risk flags, wallet is clean
    if (riskFlags.length === 0) {
      riskFlags.push('✅ No suspicious patterns detected')
    }
    
  } catch (error) {
    console.error('Error analyzing wallet:', error)
    riskFlags.push('⚠️ Unable to complete full analysis')
  }
  
  return {
    riskLevel,
    riskFlags,
    walletAge,
    previousScams
  }
}

// Detect coordinated trading patterns
function detectCoordinatedTrading(holders: any[]): WalletPatternAlert[] {
  const alerts: WalletPatternAlert[] = []
  
  // Check for multiple wallets with similar holdings (potential sybil attack)
  const holdingGroups: Record<string, string[]> = {}
  
  holders.forEach((holder: any) => {
    const percentage = parseFloat(holder.percentage || '0')
    const roundedPercentage = Math.floor(percentage * 10) / 10 // Round to 1 decimal
    const key = roundedPercentage.toString()
    
    if (!holdingGroups[key]) {
      holdingGroups[key] = []
    }
    holdingGroups[key].push(holder.address)
  })
  
  // If multiple wallets have nearly identical holdings, flag as suspicious
  Object.entries(holdingGroups).forEach(([percentage, wallets]) => {
    if (wallets.length >= 3 && parseFloat(percentage) > 2) {
      alerts.push({
        alertType: 'coordinated_trading',
        severity: 'high',
        description: `${wallets.length} wallets detected with nearly identical holdings (~${percentage}% each). This may indicate coordinated manipulation or a single entity using multiple wallets.`,
        wallets: wallets,
        evidence: [
          `All wallets hold approximately ${percentage}% of total supply`,
          'Identical holding patterns suggest coordination',
          'Possible sybil attack or single entity control'
        ],
        timestamp: new Date().toISOString()
      })
    }
  })
  
  return alerts
}

// Detect wash trading patterns
function detectWashTrading(transactions: any[]): WalletPatternAlert[] {
  const alerts: WalletPatternAlert[] = []
  
  // Look for back-and-forth trading between same wallets
  const tradePairs: Record<string, number> = {}
  
  transactions.forEach((tx: any, index: number) => {
    if (index < transactions.length - 1) {
      const nextTx = transactions[index + 1]
      
      // Check if this is a back-and-forth trade
      if (tx.from === nextTx.to && tx.to === nextTx.from) {
        const pairKey = [tx.from, tx.to].sort().join('-')
        tradePairs[pairKey] = (tradePairs[pairKey] || 0) + 1
      }
    }
  })
  
  // Flag pairs with multiple back-and-forth trades
  Object.entries(tradePairs).forEach(([pair, count]) => {
    if (count >= 3) {
      const [wallet1, wallet2] = pair.split('-')
      alerts.push({
        alertType: 'wash_trading',
        severity: 'critical',
        description: `Detected ${count} back-and-forth trades between two wallets. This is a classic wash trading pattern used to fake volume and manipulate prices.`,
        wallets: [wallet1, wallet2],
        evidence: [
          `${count} reciprocal trades detected`,
          'Same wallets trading back and forth',
          'Likely artificial volume creation'
        ],
        timestamp: new Date().toISOString()
      })
    }
  })
  
  return alerts
}

async function analyzeContract(contractAddress: string, blockchain: string): Promise<ContractAnalysisResult> {
  // Fetch data from multiple sources in parallel
  const [contractInfo, dexData, honeypotData, holdersData] = await Promise.all([
    getContractInfo(contractAddress, blockchain),
    getDexScreenerData(contractAddress, blockchain),
    checkHoneypot(contractAddress, blockchain),
    getTopHolders(contractAddress, blockchain)
  ])

  // Extract real data from API responses
  const tokenName = contractInfo?.name || 'Unknown Token'
  const isVerified = contractInfo?.isVerified || false
  const isHoneypot = honeypotData?.honeypotResult?.isHoneypot || false
  const buyTax = honeypotData?.simulationResult?.buyTax || 0
  const sellTax = honeypotData?.simulationResult?.sellTax || 0
  const transferTax = honeypotData?.simulationResult?.transferTax || 0
  
  // Get liquidity and price data from DexScreener
  const pairs = dexData?.pairs || []
  const mainPair = pairs.length > 0 ? pairs[0] : null
  const liquidity = mainPair?.liquidity?.usd || 0
  const volume24h = mainPair?.volume?.h24 || 0
  const priceChange24h = mainPair?.priceChange?.h24 || 0
  const fdv = mainPair?.fdv || 0
  
  // Calculate risk factors based on real data
  const riskFactors = {
    unverifiedContract: !isVerified,
    highOwnershipConcentration: false, // Will calculate from holders data
    lowLiquidity: liquidity < 50000, // Less than $50k liquidity
    suspiciousTransactions: false,
    honeypotDetected: isHoneypot,
    highTaxes: (buyTax > 10 || sellTax > 10 || transferTax > 5),
    newToken: mainPair ? (Date.now() - new Date(mainPair.pairCreatedAt).getTime()) < 86400000 * 7 : false, // Less than 7 days old
    lowVolume: volume24h < 10000 // Less than $10k daily volume
  }

  // Calculate ownership concentration from holders
  if (holdersData && holdersData.length > 0) {
    const totalSupply = holdersData.reduce((sum: number, h: any) => sum + parseFloat(h.TokenHolderQuantity || '0'), 0)
    const top10Supply = holdersData.slice(0, 10).reduce((sum: number, h: any) => sum + parseFloat(h.TokenHolderQuantity || '0'), 0)
    const top10Percentage = totalSupply > 0 ? (top10Supply / totalSupply) * 100 : 0
    riskFactors.highOwnershipConcentration = top10Percentage > 70
  }

  let riskScore = 0
  if (riskFactors.unverifiedContract) riskScore += 15
  if (riskFactors.highOwnershipConcentration) riskScore += 25
  if (riskFactors.lowLiquidity) riskScore += 20
  if (riskFactors.suspiciousTransactions) riskScore += 10
  if (riskFactors.honeypotDetected) riskScore += 35
  if (riskFactors.highTaxes) riskScore += 15
  if (riskFactors.newToken) riskScore += 10
  if (riskFactors.lowVolume) riskScore += 10
  
  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100)

  // Analyze source code for common patterns
  const sourceCode = contractInfo?.sourceCode?.toLowerCase() || ''
  const hasMintFunction = sourceCode.includes('function mint') || sourceCode.includes('function _mint')
  const hasBlacklistFunction = sourceCode.includes('blacklist') || sourceCode.includes('isblacklisted')
  const hasProxyPattern = sourceCode.includes('proxy') || sourceCode.includes('upgradeable')
  const hasOwnershipRenounced = honeypotData?.contractCode?.hasRenounced || false
  
  // Security checks with real data
  const securityChecks: SecurityCheck[] = [
    {
      name: 'Contract Verification',
      description: 'Checks if the contract source code is verified on the blockchain explorer',
      passed: isVerified,
      severity: !isVerified ? 'critical' : 'info',
      details: !isVerified 
        ? 'Contract is not verified. This makes it impossible to audit the code for malicious functions.'
        : 'Contract source code is verified and publicly auditable.'
    },
    {
      name: 'Honeypot Detection',
      description: 'Analyzes if the contract prevents selling or has hidden transfer restrictions',
      passed: !isHoneypot,
      severity: isHoneypot ? 'critical' : 'info',
      details: isHoneypot
        ? 'WARNING: Honeypot detected. Token may not be sellable or has severe restrictions.'
        : 'No honeypot mechanisms detected in the contract.'
    },
    {
      name: 'Ownership Analysis',
      description: 'Checks for renounced ownership and admin privileges',
      passed: hasOwnershipRenounced,
      severity: !hasOwnershipRenounced ? 'warning' : 'info',
      details: hasOwnershipRenounced
        ? 'Ownership has been renounced. No single entity can modify contract parameters.'
        : 'Owner wallet still has control over contract functions. This poses centralization risks.'
    },
    {
      name: 'Mint Function',
      description: 'Checks if there are functions that can mint new tokens',
      passed: !hasMintFunction,
      severity: hasMintFunction ? 'warning' : 'info',
      details: !hasMintFunction
        ? 'No mint function found. Total supply is fixed.'
        : 'Mint function present. New tokens can be created, potentially diluting value.'
    },
    {
      name: 'Trading Taxes',
      description: 'Analyzes buy and sell tax percentages',
      passed: !riskFactors.highTaxes,
      severity: riskFactors.highTaxes ? 'warning' : 'info',
      details: riskFactors.highTaxes
        ? `High trading taxes detected: Buy tax ${buyTax}%, Sell tax ${sellTax}%. Consider the impact on trading.`
        : `Reasonable trading taxes: Buy tax ${buyTax}%, Sell tax ${sellTax}%.`
    },
    {
      name: 'Liquidity Status',
      description: 'Verifies liquidity amount and health',
      passed: !riskFactors.lowLiquidity,
      severity: riskFactors.lowLiquidity ? 'critical' : 'info',
      details: riskFactors.lowLiquidity
        ? `WARNING: Low liquidity detected ($${liquidity.toLocaleString()}). This can lead to high slippage and manipulation.`
        : `Healthy liquidity detected ($${liquidity.toLocaleString()}). This helps prevent price manipulation.`
    },
    {
      name: 'Proxy Contract',
      description: 'Checks if the contract is upgradeable',
      passed: !hasProxyPattern,
      severity: hasProxyPattern ? 'warning' : 'info',
      details: !hasProxyPattern
        ? 'Contract is not upgradeable. Code cannot be changed after deployment.'
        : 'Upgradeable proxy detected. Contract logic can be modified by the owner.'
    },
    {
      name: 'Blacklist Function',
      description: 'Checks for ability to blacklist wallet addresses',
      passed: !hasBlacklistFunction,
      severity: hasBlacklistFunction ? 'warning' : 'info',
      details: !hasBlacklistFunction
        ? 'No blacklist function found.'
        : 'Blacklist function present. Owner can prevent specific addresses from trading.'
    }
  ]

  // Process holders data with wallet pattern analysis
  const totalHoldersCount = holdersData?.length || 0
  let topHolders: TopHolder[] = []
  let top10Percentage = 0
  const knownScammers: KnownScammerWallet[] = []
  let walletPatternAlerts: WalletPatternAlert[] = []
  
  if (holdersData && holdersData.length > 0) {
    // Calculate total supply from all holders
    const totalSupply = holdersData.reduce((sum: number, h: any) => {
      return sum + parseFloat(h.TokenHolderQuantity || '0')
    }, 0)
    
    // Process top 10 holders with deep wallet analysis
    const holderAnalysisPromises = holdersData.slice(0, 10).map(async (holder: any, index: number) => {
      const balance = parseFloat(holder.TokenHolderQuantity || '0')
      const percentage = totalSupply > 0 ? (balance / totalSupply) * 100 : 0
      
      // Format balance for display
      const formattedBalance = balance >= 1000000 
        ? `${(balance / 1000000).toFixed(2)}M`
        : balance >= 1000
        ? `${(balance / 1000).toFixed(2)}K`
        : balance.toFixed(2)
      
      // Get full and short address
      const fullAddress = holder.TokenHolderAddress || 'Unknown'
      const shortAddress = fullAddress.length > 20 
        ? `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`
        : fullAddress
      
      // Perform deep wallet analysis
      const walletAnalysis = await analyzeWalletForPumpDump(
        fullAddress,
        contractAddress,
        blockchain,
        percentage
      )
      
      // Check if wallet is known scammer and add to list
      if (walletAnalysis.previousScams > 0) {
        const scammerData = KNOWN_SCAMMER_WALLETS[fullAddress] || {
          scamCount: walletAnalysis.previousScams,
          totalLoss: 'Unknown',
          lastScam: 'Unknown',
          scamTypes: ['Pump and Dump']
        }
        
        knownScammers.push({
          address: shortAddress,
          riskScore: 95,
          scamCount: scammerData.scamCount,
          totalLoss: scammerData.totalLoss,
          lastScam: scammerData.lastScam,
          scamTypes: scammerData.scamTypes
        })
      }
      
      // Create alert if wallet is high risk
      if (walletAnalysis.riskLevel === 'high') {
        walletPatternAlerts.push({
          alertType: walletAnalysis.previousScams > 0 ? 'pump_dump_wallet' : 'suspicious_pattern',
          severity: 'critical',
          description: `High-risk wallet detected holding ${percentage.toFixed(1)}% of total supply. ${walletAnalysis.riskFlags.join('. ')}`,
          wallets: [shortAddress],
          evidence: walletAnalysis.riskFlags,
          timestamp: new Date().toISOString()
        })
      } else if (walletAnalysis.riskLevel === 'medium' && percentage > 10) {
        walletPatternAlerts.push({
          alertType: 'suspicious_pattern',
          severity: 'high',
          description: `Suspicious wallet patterns detected for holder with ${percentage.toFixed(1)}% of supply.`,
          wallets: [shortAddress],
          evidence: walletAnalysis.riskFlags,
          timestamp: new Date().toISOString()
        })
      }
      
      return {
        address: shortAddress,
        percentage: parseFloat(percentage.toFixed(2)),
        balance: formattedBalance,
        label: index === 0 ? 'Top Holder' : undefined,
        riskLevel: walletAnalysis.riskLevel,
        riskFlags: walletAnalysis.riskFlags,
        walletAge: walletAnalysis.walletAge,
        previousScams: walletAnalysis.previousScams
      }
    })
    
    // Wait for all wallet analyses to complete
    topHolders = await Promise.all(holderAnalysisPromises)
    top10Percentage = topHolders.reduce((sum, holder) => sum + holder.percentage, 0)
    
    // Detect coordinated trading patterns
    const coordinatedAlerts = detectCoordinatedTrading(topHolders)
    walletPatternAlerts = [...walletPatternAlerts, ...coordinatedAlerts]
    
    // Adjust risk score based on wallet analysis
    if (knownScammers.length > 0) {
      riskScore += 35 // Known scammers are CRITICAL
    }
    if (walletPatternAlerts.some(a => a.severity === 'critical')) {
      riskScore += 20 // Critical pattern alerts
    }
    if (walletPatternAlerts.some(a => a.severity === 'high')) {
      riskScore += 10 // High severity pattern alerts
    }
    const highRiskHolders = topHolders.filter(h => h.riskLevel === 'high')
    if (highRiskHolders.length > 0) {
      riskScore += Math.min(highRiskHolders.length * 5, 15) // Add up to 15 points for high-risk holders
    }
    
    // Re-cap risk score at 100
    riskScore = Math.min(riskScore, 100)
  }

  // Process liquidity pools from DexScreener
  const liquidityPools: LiquidityPool[] = pairs.map((pair: any) => {
    const pairLiquidity = pair.liquidity?.usd || 0
    const pairVolume = pair.volume?.h24 || 0
    
    // Format liquidity
    const formattedLiquidity = pairLiquidity >= 1000000
      ? `$${(pairLiquidity / 1000000).toFixed(2)}M`
      : pairLiquidity >= 1000
      ? `$${(pairLiquidity / 1000).toFixed(2)}K`
      : `$${pairLiquidity.toFixed(2)}`
    
    // Format volume
    const formattedVolume = pairVolume >= 1000000
      ? `$${(pairVolume / 1000000).toFixed(2)}M`
      : pairVolume >= 1000
      ? `$${(pairVolume / 1000).toFixed(2)}K`
      : `$${pairVolume.toFixed(2)}`
    
    return {
      dex: pair.dexId || 'Unknown DEX',
      pair: `${pair.baseToken?.symbol || 'TOKEN'}/${pair.quoteToken?.symbol || 'QUOTE'}`,
      liquidityUSD: formattedLiquidity,
      volume24h: formattedVolume
    }
  })

  // Detect transaction anomalies based on real data
  const anomalies: TransactionAnomaly[] = []
  
  // Check for low volume
  if (riskFactors.lowVolume) {
    anomalies.push({
      type: 'Low Trading Volume',
      description: `Trading volume is only $${volume24h.toLocaleString()} in 24h. This indicates low market interest or potential wash trading.`,
      timestamp: new Date().toISOString()
    })
  }
  
  // Check for new token
  if (riskFactors.newToken && mainPair) {
    const age = Math.floor((Date.now() - new Date(mainPair.pairCreatedAt).getTime()) / 86400000)
    anomalies.push({
      type: 'Recently Launched Token',
      description: `Token was launched only ${age} day(s) ago. New tokens carry higher risk of rug pulls and scams.`,
      timestamp: mainPair.pairCreatedAt
    })
  }
  
  // Check for extreme price volatility
  if (Math.abs(priceChange24h) > 50) {
    anomalies.push({
      type: 'Extreme Price Volatility',
      description: `Price changed ${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}% in 24h. High volatility indicates potential manipulation or unstable market.`,
      timestamp: new Date().toISOString()
    })
  }

  // Generate report based on real risk factors
  const criticalConcerns: string[] = []
  const warnings: string[] = []
  const positiveIndicators: string[] = []

  // Critical concerns - Known Scammers (HIGHEST PRIORITY)
  if (knownScammers.length > 0) {
    criticalConcerns.push(`🚨 KNOWN SCAMMERS DETECTED - ${knownScammers.length} wallet(s) with history of pump & dump schemes are holding tokens`)
    knownScammers.forEach(scammer => {
      criticalConcerns.push(`   └─ ${scammer.address}: ${scammer.scamCount} previous scams, ${scammer.totalLoss} in losses`)
    })
  }
  
  // Wallet Pattern Alerts
  const criticalPatternAlerts = walletPatternAlerts.filter(a => a.severity === 'critical')
  if (criticalPatternAlerts.length > 0) {
    criticalPatternAlerts.forEach(alert => {
      criticalConcerns.push(`🚨 ${alert.alertType.toUpperCase().replace('_', ' ')}: ${alert.description}`)
    })
  }

  // Contract-level critical concerns
  if (riskFactors.honeypotDetected) {
    criticalConcerns.push('⚠️ HONEYPOT DETECTED - Token may not be sellable or has severe restrictions')
  }
  if (riskFactors.lowLiquidity) {
    criticalConcerns.push(`⚠️ Very low liquidity ($${liquidity.toLocaleString()}) - High risk of rug pull and price manipulation`)
  }
  if (riskFactors.highOwnershipConcentration) {
    criticalConcerns.push(`⚠️ Top 10 holders control ${top10Percentage.toFixed(1)}% of supply - Extreme concentration risk`)
  }

  // Warnings
  // Wallet Pattern Warnings
  const highPatternAlerts = walletPatternAlerts.filter(a => a.severity === 'high')
  if (highPatternAlerts.length > 0) {
    highPatternAlerts.forEach(alert => {
      warnings.push(`⚠️ ${alert.alertType.replace('_', ' ').toUpperCase()}: ${alert.description}`)
    })
  }
  
  // High-risk wallets in top holders
  const highRiskHolders = topHolders.filter(h => h.riskLevel === 'high')
  if (highRiskHolders.length > 0 && knownScammers.length === 0) {
    warnings.push(`${highRiskHolders.length} high-risk wallet(s) detected among top holders with suspicious patterns`)
  }
  
  if (riskFactors.unverifiedContract) {
    warnings.push('Contract source code is not verified - Cannot audit for malicious code')
  }
  if (riskFactors.highTaxes) {
    warnings.push(`High trading taxes detected - Buy: ${buyTax}%, Sell: ${sellTax}%`)
  }
  if (riskFactors.newToken) {
    warnings.push('Token was recently launched - Higher risk of scams and volatility')
  }
  if (riskFactors.lowVolume) {
    warnings.push(`Low trading volume ($${volume24h.toLocaleString()}) - May indicate lack of interest or wash trading`)
  }
  if (hasMintFunction) {
    warnings.push('Mint function detected - Supply can be inflated')
  }
  if (hasBlacklistFunction) {
    warnings.push('Blacklist function detected - Owner can restrict trading')
  }

  // Positive indicators
  if (!riskFactors.honeypotDetected) {
    positiveIndicators.push('No honeypot mechanisms detected')
  }
  if (!riskFactors.lowLiquidity && liquidity > 100000) {
    positiveIndicators.push(`Healthy liquidity ($${liquidity.toLocaleString()})`)
  }
  if (isVerified) {
    positiveIndicators.push('Contract is verified and auditable')
  }
  if (!riskFactors.highTaxes) {
    positiveIndicators.push(`Reasonable taxes - Buy: ${buyTax}%, Sell: ${sellTax}%`)
  }
  if (!hasMintFunction) {
    positiveIndicators.push('No mint function - Fixed supply')
  }
  if (hasOwnershipRenounced) {
    positiveIndicators.push('Ownership has been renounced')
  }

  let recommendation = ''
  if (riskScore >= 80) {
    recommendation = '🚨 HIGH RISK: This contract shows multiple critical red flags. We strongly advise against investing in this token. The risk of losing your investment is extremely high.'
  } else if (riskScore >= 50) {
    recommendation = '⚠️ MEDIUM RISK: This contract has several concerning factors. Only invest what you can afford to lose and conduct additional research. Consider waiting for more information before investing.'
  } else {
    recommendation = '✅ LOW RISK: This contract shows relatively healthy indicators. However, always conduct your own research and never invest more than you can afford to lose. No investment is without risk.'
  }

  // Calculate token age
  let tokenAge = 'Unknown'
  if (mainPair?.pairCreatedAt) {
    const ageInDays = Math.floor((Date.now() - new Date(mainPair.pairCreatedAt).getTime()) / 86400000)
    tokenAge = ageInDays === 0 ? 'Today' : `${ageInDays} day${ageInDays === 1 ? '' : 's'}`
  }
  
  // Get token symbol from DexScreener
  const tokenSymbol = mainPair?.baseToken?.symbol || 'UNKNOWN'
  const totalSupplyFormatted = mainPair?.fdv 
    ? `${(mainPair.fdv / (mainPair.priceUsd || 1)).toFixed(0)}`
    : 'Unknown'
  
  // Format total liquidity
  const totalLiquidityFormatted = liquidity >= 1000000
    ? `$${(liquidity / 1000000).toFixed(2)}M`
    : liquidity >= 1000
    ? `$${(liquidity / 1000).toFixed(2)}K`
    : `$${liquidity.toFixed(2)}`

  return {
    contractAddress,
    blockchain,
    riskScore,
    contractInfo: {
      name: tokenName,
      symbol: tokenSymbol,
      totalSupply: totalSupplyFormatted,
      decimals: 18,
      isVerified,
      age: tokenAge
    },
    securityChecks,
    holderAnalysis: {
      totalHolders: totalHoldersCount || dexData?.schemaVersion ? 100 : 0, // Fallback estimate
      top10Percentage: parseFloat(top10Percentage.toFixed(1)),
      contractHoldings: 0, // Would need additional API call to determine
      topHolders
    },
    liquidityInfo: {
      totalLiquidityUSD: totalLiquidityFormatted,
      isLocked: false, // Would need liquidity locker API
      lockUntil: undefined,
      pools: liquidityPools
    },
    transactionAnalysis: {
      totalTransactions: mainPair?.txns?.h24?.buys + mainPair?.txns?.h24?.sells || 0,
      uniqueWallets: mainPair?.txns?.h24?.buys || 0, // Approximate
      volume24h: volume24h >= 1000000
        ? `$${(volume24h / 1000000).toFixed(2)}M`
        : volume24h >= 1000
        ? `$${(volume24h / 1000).toFixed(2)}K`
        : `$${volume24h.toFixed(2)}`,
      avgBuySize: mainPair?.txns?.h24?.buys > 0 
        ? `$${(volume24h / mainPair.txns.h24.buys / 2).toFixed(0)}`
        : '$0',
      avgSellSize: mainPair?.txns?.h24?.sells > 0
        ? `$${(volume24h / mainPair.txns.h24.sells / 2).toFixed(0)}`
        : '$0',
      buySellRatio: mainPair?.txns?.h24?.sells > 0
        ? (mainPair.txns.h24.buys / mainPair.txns.h24.sells).toFixed(2)
        : '0',
      anomalies,
      walletPatternAlerts,
      knownScammers
    },
    report: {
      criticalConcerns,
      warnings,
      positiveIndicators,
      recommendation
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contractAddress, blockchain } = body

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Contract address is required' },
        { status: 400 }
      )
    }

    // Validate contract address format (basic validation)
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(contractAddress) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(contractAddress)
    if (!isValidAddress) {
      return NextResponse.json(
        { error: 'Invalid contract address format' },
        { status: 400 }
      )
    }

    const analysis = await analyzeContract(contractAddress, blockchain)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing contract:', error)
    return NextResponse.json(
      { error: 'Failed to analyze contract' },
      { status: 500 }
    )
  }
}
