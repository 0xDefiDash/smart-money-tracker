
import { PrismaClient } from '@prisma/client'
import { TOP_CRYPTOCURRENCIES, EXCHANGES } from '../lib/constants'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // Seed cryptocurrencies
    console.log('📈 Seeding cryptocurrencies...')
    const cryptos = []
    
    for (const crypto of TOP_CRYPTOCURRENCIES) {
      const created = await prisma.cryptocurrency.upsert({
        where: { symbol: crypto.symbol },
        update: {
          name: crypto.name,
          coinGeckoId: crypto.id,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          symbol: crypto.symbol,
          name: crypto.name,
          coinGeckoId: crypto.id,
          isActive: true,
          price: getRandomPrice(crypto.symbol),
          marketCap: BigInt(Math.floor(Math.random() * 100000000000)),
          volume24h: Math.random() * 10000000000,
          priceChange24h: (Math.random() - 0.5) * 20,
          rank: TOP_CRYPTOCURRENCIES.indexOf(crypto) + 1,
        }
      })
      cryptos.push(created)
      console.log(`✅ Created/Updated ${crypto.symbol}`)
    }

    // Seed whale transactions
    console.log('🐋 Seeding whale transactions...')
    for (let i = 0; i < 50; i++) {
      const crypto = cryptos[Math.floor(Math.random() * cryptos.length)]
      const valueUsd = Math.random() * 10000000 + 1000000 // $1M to $10M
      
      await prisma.whaleTransaction.create({
        data: {
          txHash: generateTxHash(),
          cryptoId: crypto.id,
          fromAddress: generateAddress(),
          toAddress: generateAddress(),
          value: (valueUsd / (crypto.price || 40000)).toString(),
          valueUsd: valueUsd,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          blockchain: getBlockchainForCrypto(crypto.symbol),
          isAlert: valueUsd > 5000000,
          alertThreshold: valueUsd > 5000000 ? 5000000 : undefined,
          blockNumber: BigInt(Math.floor(Math.random() * 1000000)),
          gasUsed: ['BTC', 'LTC'].includes(crypto.symbol) ? null : BigInt(Math.floor(Math.random() * 100000)),
          gasPrice: ['BTC', 'LTC'].includes(crypto.symbol) ? null : BigInt(Math.floor(Math.random() * 50)),
        }
      })
      
      if (i % 10 === 0) console.log(`✅ Created ${i + 1} whale transactions`)
    }

    // Seed exchange flows
    console.log('🏦 Seeding exchange flows...')
    for (let i = 0; i < 30; i++) {
      const exchange = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)]
      const crypto = cryptos[Math.floor(Math.random() * cryptos.length)]
      const amount = Math.random() * 100000000 + 10000000 // $10M to $100M
      
      await prisma.exchangeFlow.create({
        data: {
          exchangeName: exchange,
          cryptocurrency: crypto.symbol,
          flowType: Math.random() > 0.5 ? 'inflow' : 'outflow',
          amount: (amount / (crypto.price || 40000)).toString(),
          amountUsd: amount,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        }
      })
      
      if (i % 10 === 0) console.log(`✅ Created ${i + 1} exchange flows`)
    }

    // Seed wallet watches
    console.log('👀 Seeding wallet watches...')
    for (let i = 0; i < 20; i++) {
      const crypto = cryptos[Math.floor(Math.random() * cryptos.length)]
      const balance = Math.random() * 10000 + 100
      
      await prisma.walletWatch.create({
        data: {
          address: generateAddress(),
          label: Math.random() > 0.5 ? getWalletLabel() : null,
          blockchain: getBlockchainForCrypto(crypto.symbol),
          isWhale: Math.random() > 0.7,
          balance: balance.toString(),
          balanceUsd: balance * (crypto.price || 40000),
          lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
        }
      })
      
      if (i % 5 === 0) console.log(`✅ Created ${i + 1} wallet watches`)
    }

    // Seed price history
    console.log('📊 Seeding price history...')
    for (const crypto of cryptos) {
      for (let i = 0; i < 24; i++) { // 24 hours of hourly data
        await prisma.priceHistory.create({
          data: {
            cryptoId: crypto.id,
            price: (crypto.price || 40000) * (1 + (Math.random() - 0.5) * 0.1),
            marketCap: crypto.marketCap,
            volume: (crypto.volume24h || 1000000) * (1 + (Math.random() - 0.5) * 0.2),
            timestamp: new Date(Date.now() - i * 60 * 60 * 1000)
          }
        })
      }
      console.log(`✅ Created price history for ${crypto.symbol}`)
    }

    // Seed alert subscriptions
    console.log('🔔 Seeding alert subscriptions...')
    await prisma.alertSubscription.create({
      data: {
        email: 'alerts@smartmoney.com',
        alertType: 'whale_transaction',
        thresholdUsd: 5000000,
        cryptocurrencies: ['BTC', 'ETH', 'BNB'],
        isActive: true
      }
    })

    await prisma.alertSubscription.create({
      data: {
        email: 'flows@smartmoney.com',
        alertType: 'exchange_flow',
        thresholdUsd: 50000000,
        cryptocurrencies: ['BTC', 'ETH'],
        isActive: true
      }
    })

    console.log('✅ Created alert subscriptions')

    console.log('🎉 Database seeded successfully!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Helper functions
function getRandomPrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    BTC: 42000,
    ETH: 2500,
    BNB: 300,
    SOL: 100,
    ADA: 0.5,
    AVAX: 35,
    LINK: 15,
    MATIC: 0.8,
    UNI: 6,
    LTC: 70
  }
  
  const basePrice = basePrices[symbol] || 10
  return basePrice * (1 + (Math.random() - 0.5) * 0.2)
}

function generateTxHash(): string {
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

function generateAddress(): string {
  return '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

function getBlockchainForCrypto(symbol: string): string {
  const blockchains: Record<string, string> = {
    BTC: 'bitcoin',
    LTC: 'litecoin',
    ETH: 'ethereum',
    BNB: 'bsc',
    SOL: 'solana',
    ADA: 'cardano',
    AVAX: 'avalanche',
    LINK: 'ethereum',
    MATIC: 'polygon',
    UNI: 'ethereum'
  }
  
  return blockchains[symbol] || 'ethereum'
}

function getWalletLabel(): string {
  const labels = [
    'Binance Hot Wallet',
    'Coinbase Pro',
    'Kraken Exchange',
    'Whale Wallet #47',
    'Institutional Wallet',
    'DeFi Protocol',
    'MEV Bot',
    'Uniswap V3',
    'Unknown Whale',
    'OTC Desk'
  ]
  
  return labels[Math.floor(Math.random() * labels.length)]
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
