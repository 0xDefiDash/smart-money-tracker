import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive tweets data with proper categorization
const seedTweets = [
  // ALPHA TWEETS
  {
    username: '100xDarren',
    displayName: '100x Darren',
    tweets: [
      {
        content: '🔥 ALPHA THREAD: Found a hidden gem before Binance listing. Project has:\n\n✅ Audited smart contracts\n✅ 100M+ TVL\n✅ Major VC backing (a16z, Paradigm)\n✅ Working product with 50K+ users\n\nCA: 0x... (1/5) #CryptoAlpha #100x',
        category: 'alpha',
        coins: ['ETH', 'BTC'],
        likes: 3400,
        retweets: 1200,
        replies: 340
      },
      {
        content: 'Early intel: New L2 solution launching next week. Team from Ethereum Foundation. Backed by Vitalik personally. This is the next Arbitrum/Optimism play. Whitelist still open. #Alpha #Layer2',
        category: 'alpha',
        coins: ['ETH', 'ARB'],
        likes: 2800,
        retweets: 980,
        replies: 256
      }
    ]
  },
  {
    username: 'BullRunGravano',
    displayName: 'Bull Run Gravano',
    tweets: [
      {
        content: '💎 ALPHA: My top 5 lowcap gems under $50M mcap:\n\n1. $PRIME - Gaming revolution\n2. $DESO - Decentralized social\n3. $METIS - Optimistic rollup\n4. $RADIX - DeFi platform\n5. $NOIA - Web3 infra\n\nEach has 100x potential. DYOR! 🚀',
        category: 'alpha',
        coins: ['PRIME', 'DESO', 'METIS', 'RADIX', 'NOIA'],
        likes: 5600,
        retweets: 1890,
        replies: 445
      },
      {
        content: 'Insider info: Major GameFi project dropping tomorrow. Backed by Animoca Brands and Immutable. Play-to-earn mechanics like Axie but 10x better. Get ready for the mint 🎮💰',
        category: 'alpha',
        coins: ['IMX', 'AXS'],
        likes: 4100,
        retweets: 1400,
        replies: 567
      }
    ]
  },
  // ALERT TWEETS
  {
    username: 'JamesWynnReal',
    displayName: 'James Wynn',
    tweets: [
      {
        content: '🚨 CRITICAL ALERT: Major exchange listing announcement in 2 hours for a TOP 50 coin. Volume spiking 300% already. Smart money is positioning NOW. This is not a drill. #CryptoAlert',
        category: 'alert',
        coins: ['BTC', 'ETH'],
        likes: 6700,
        retweets: 2100,
        replies: 890
      },
      {
        content: '⚠️ URGENT: Whale alert! 500M USDT just moved from cold storage to Binance. Historic data shows this precedes major price action. Be ready for volatility in next 24h. #WhaleAlert #Trading',
        category: 'alert',
        coins: ['USDT', 'BTC'],
        likes: 4200,
        retweets: 1560,
        replies: 456
      },
      {
        content: '🔴 BREAKING: SEC announces clarity on crypto regulations TODAY. This could be the catalyst we\'ve been waiting for. Standby for official announcement at 2PM EST. Markets will react fast. #CryptoNews',
        category: 'alert',
        coins: ['BTC', 'ETH', 'SOL'],
        likes: 8900,
        retweets: 3400,
        replies: 1200
      }
    ]
  },
  {
    username: 'elonmusk',
    displayName: 'Elon Musk',
    tweets: [
      {
        content: '🚨 Major announcement coming. Time to pay attention. 👀',
        category: 'alert',
        coins: ['DOGE', 'BTC'],
        likes: 125000,
        retweets: 45000,
        replies: 12000
      }
    ]
  },
  // ANALYSIS TWEETS
  {
    username: 'CryptoExpert101',
    displayName: 'Crypto Expert',
    tweets: [
      {
        content: '📊 BTC Technical Analysis - November 24, 2025\n\n4H Chart:\n• Bullish pennant forming\n• RSI: 62 (neutral-bullish)\n• MACD: Bullish crossover\n• Support: $68,500\n• Resistance: $72,000\n\nTarget: $75K by month end\nStop loss: $67K\n\n#Bitcoin #TA',
        category: 'analysis',
        coins: ['BTC'],
        likes: 7800,
        retweets: 2340,
        replies: 678
      },
      {
        content: '🔍 ETH/BTC Ratio Analysis:\n\nCurrently at 0.052, near historical support\n\nKey levels:\n• Fibonacci 0.618: 0.055\n• Major resistance: 0.060\n• Critical support: 0.048\n\nAlt season begins if we break above 0.060 with volume.\n\n#Ethereum #TechnicalAnalysis',
        category: 'analysis',
        coins: ['ETH', 'BTC'],
        likes: 5600,
        retweets: 1890,
        replies: 445
      },
      {
        content: '📈 Market Structure Update:\n\nWeekly Close Analysis:\n✅ BTC: Higher high confirmed\n✅ ETH: Consolidating above $3.2K\n✅ Total3: Breaking out of 6-month range\n\nConclusion: Bullish market structure intact. Dips are buying opportunities.\n\n#CryptoAnalysis',
        category: 'analysis',
        coins: ['BTC', 'ETH'],
        likes: 6200,
        retweets: 1950,
        replies: 523
      }
    ]
  },
  {
    username: 'four_meme_',
    displayName: 'Four',
    tweets: [
      {
        content: '🎯 SOLANA Technical Breakdown:\n\nDaily Timeframe:\n• Ascending triangle pattern\n• Volume declining (concerning)\n• RSI divergence forming\n• Key support: $195\n• Breakout target: $245\n\nWaiting for volume confirmation before entry.\n\n#SOL #Analysis',
        category: 'analysis',
        coins: ['SOL'],
        likes: 4500,
        retweets: 1340,
        replies: 389
      }
    ]
  },
  // BULLISH TWEETS
  {
    username: '0xPoet',
    displayName: '0xPoet',
    tweets: [
      {
        content: '🚀 BULLISH AF on $SOL right now!\n\n• Visa partnership confirmed\n• PayPal integration live\n• Network fees down 90%\n• TPS hitting ATH\n• Institutions accumulating\n\nThis is going to $500 minimum. Load up before it\'s too late! 🔥\n\n#Solana #Bullish',
        category: 'bullish',
        coins: ['SOL'],
        likes: 12400,
        retweets: 3890,
        replies: 1156
      },
      {
        content: 'The setup is PERFECT:\n\n✅ Whale accumulation\n✅ Exchange outflows\n✅ Funding rates positive\n✅ Social sentiment turning\n✅ Technical breakout\n\nAlt season is HERE. Time to print money! 💰💰💰\n\n#Crypto #AltSeason #Bullish',
        category: 'bullish',
        coins: ['BTC', 'ETH', 'SOL'],
        likes: 9800,
        retweets: 2980,
        replies: 890
      }
    ]
  },
  {
    username: '0xSweep',
    displayName: '0xSweep',
    tweets: [
      {
        content: '🌟 Most bullish I\'ve been since 2020:\n\n📈 BTC: Breaking all-time highs\n📈 ETH: ETF inflows at ATH\n📈 SOL: Ecosystem exploding\n📈 AVAX: Subnet adoption\n📈 MATIC: Enterprise deals\n\nThis is the beginning of a MASSIVE bull run. Don\'t fade this! 🚀\n\n#BullMarket',
        category: 'bullish',
        coins: ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC'],
        likes: 15600,
        retweets: 4200,
        replies: 1340
      },
      {
        content: 'Sentiment check:\n\n✅ Fear & Greed Index: 72 (Greed)\n✅ BTC Dominance: Declining\n✅ Alt Volume: Increasing 200%\n✅ Whale Activity: ATH\n✅ Google Trends: Rising\n\nTextbook alt season setup. This is generational wealth opportunity! 🌙\n\n#Crypto #Bullish',
        category: 'bullish',
        coins: ['BTC'],
        likes: 11200,
        retweets: 3450,
        replies: 987
      }
    ]
  },
  {
    username: 'cz_binance',
    displayName: 'CZ Binance',
    tweets: [
      {
        content: 'Building. Shipping. Growing. The future of finance is being built right now. Super bullish on crypto innovation. 🚀 #BUIDL',
        category: 'bullish',
        coins: ['BTC', 'BNB'],
        likes: 89000,
        retweets: 23000,
        replies: 5600
      }
    ]
  },
  // BEARISH TWEETS
  {
    username: 'pepecoineth',
    displayName: 'Pepe Coin',
    tweets: [
      {
        content: '📉 Turning BEARISH here. Multiple red flags:\n\n⚠️ Volume declining 60%\n⚠️ RSI extremely overbought (85+)\n⚠️ Whale wallets moving to stables\n⚠️ Funding rates turning negative\n⚠️ CME gap at $62K unfilled\n\nTaking profits. Risk management > FOMO\n\n#Trading',
        category: 'bearish',
        coins: ['BTC', 'ETH'],
        likes: 6700,
        retweets: 1890,
        replies: 756
      },
      {
        content: '⚠️ WARNING: Classic distribution pattern forming on daily.\n\n• Smart money exiting\n• Retail FOMO\'ing in\n• Divergence on all timeframes\n• Liquidity grab setup\n\nNot getting caught in this bull trap. 70% cash until confirmation.\n\n#RiskManagement',
        category: 'bearish',
        coins: ['BTC'],
        likes: 4900,
        retweets: 1230,
        replies: 445
      }
    ]
  },
  {
    username: 'Wendyy',
    displayName: 'Wendy O',
    tweets: [
      {
        content: 'Unpopular opinion: This rally looks exhausted.\n\n• Open interest at ATH (danger zone)\n• Leverage ratio critical levels\n• No new money entering\n• Old hands distributing\n\nExpecting 20-30% correction before continuation. Protect your gains! 🛡️',
        category: 'bearish',
        coins: ['BTC', 'ETH'],
        likes: 5600,
        retweets: 1560,
        replies: 890
      }
    ]
  }
];

async function main() {
  console.log('Starting Shot Callers database seed...');

  // Clear existing data
  console.log('Clearing existing tweets...');
  await prisma.kOLTweet.deleteMany({});
  
  console.log('Clearing existing KOL profiles...');
  await prisma.kOLProfile.deleteMany({});

  let totalTweets = 0;
  let totalKOLs = 0;

  // Seed each KOL and their tweets
  for (const kolData of seedTweets) {
    console.log(`\nSeeding KOL: @${kolData.username}`);

    // Create KOL profile
    const kol = await prisma.kOLProfile.create({
      data: {
        username: kolData.username,
        displayName: kolData.displayName,
        twitterUserId: `mock_${kolData.username}`,
        profileImageUrl: getAvatarPath(kolData.username),
        followersCount: getFollowerCount(kolData.username),
        followingCount: Math.floor(Math.random() * 1000) + 100,
        tweetCount: Math.floor(Math.random() * 10000) + 1000,
        isVerified: ['elonmusk', 'cz_binance'].includes(kolData.username),
        isTracked: true,
        lastFetchedAt: new Date(),
      }
    });

    totalKOLs++;
    console.log(`✓ Created KOL profile for @${kolData.username}`);

    // Create tweets for this KOL
    for (let i = 0; i < kolData.tweets.length; i++) {
      const tweetData = kolData.tweets[i];
      const hoursAgo = i * 2 + Math.floor(Math.random() * 3);
      const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

      // Generate metadata based on category
      const metadata = generateMetadata(tweetData.content, tweetData.category);

      const tweet = await prisma.kOLTweet.create({
        data: {
          kolId: kol.id,
          tweetId: `mock_${kolData.username}_${Date.now()}_${i}`,
          content: tweetData.content,
          createdAt,
          likeCount: tweetData.likes,
          retweetCount: tweetData.retweets,
          replyCount: tweetData.replies,
          quoteCount: Math.floor(tweetData.retweets * 0.2),
          category: tweetData.category,
          coins: tweetData.coins,
          hashtags: extractHashtags(tweetData.content),
          mentions: extractMentions(tweetData.content),
          isAlert: tweetData.category === 'alert',
          metadata: metadata as any,
        }
      });

      totalTweets++;
      console.log(`  ✓ Created ${tweetData.category} tweet (${tweetData.coins.join(', ')})`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Seed completed successfully!');
  console.log(`📊 Created ${totalKOLs} KOL profiles`);
  console.log(`📝 Created ${totalTweets} tweets`);
  console.log('='.repeat(50) + '\n');
}

function getAvatarPath(username: string): string {
  const avatarMap: Record<string, string> = {
    'CryptoExpert101': '/Uploads/cryptoExpert101.jpg',
    'JamesWynnReal': '/Uploads/James wynn.jpg',
    '100xDarren': '/Uploads/100xdarren.jpg',
    'BullRunGravano': '/Uploads/bullrun Gravano.jpg',
    'elonmusk': '/Uploads/Trump.jpg',
    'cz_binance': '/Uploads/QngrqCSC_400x400.jpg',
    'four_meme_': '/Uploads/UPaVddbm_400x400.jpg',
    '0xPoet': '/Uploads/oxpoet.jpg',
    '0xSweep': '/Uploads/0xsweep.jpg',
    'Wendyy': '/Uploads/wendy.jpg',
    'pepecoineth': '/Uploads/pepe.jpg',
  };
  return avatarMap[username] || '/Uploads/cryptoExpert101.jpg';
}

function getFollowerCount(username: string): number {
  const followerMap: Record<string, number> = {
    'elonmusk': 170000000,
    'cz_binance': 10000000,
    '100xDarren': 500000,
    'BullRunGravano': 300000,
    'JamesWynnReal': 250000,
    'CryptoExpert101': 400000,
    'four_meme_': 350000,
    '0xPoet': 180000,
    '0xSweep': 220000,
    'Wendyy': 350000,
    'pepecoineth': 280000,
  };
  return followerMap[username] || 100000;
}

function extractHashtags(text: string): string[] {
  const hashtags = text.match(/#[A-Za-z0-9_]+/g);
  return hashtags ? hashtags.map(tag => tag.substring(1)) : [];
}

function extractMentions(text: string): string[] {
  const mentions = text.match(/@[A-Za-z0-9_]+/g);
  return mentions ? mentions.map(mention => mention.substring(1)) : [];
}

function generateMetadata(content: string, category: string) {
  const lowerContent = content.toLowerCase();
  
  const metadata: any = {
    tradingSignals: {},
    sentiment: {},
    technicalData: {},
  };

  // Trading signals
  if (lowerContent.includes('buy') || lowerContent.includes('long') || lowerContent.includes('accumulate')) {
    metadata.tradingSignals.action = 'buy';
  } else if (lowerContent.includes('sell') || lowerContent.includes('exit') || lowerContent.includes('take profit')) {
    metadata.tradingSignals.action = 'sell';
  } else if (lowerContent.includes('hold') || lowerContent.includes('hodl')) {
    metadata.tradingSignals.action = 'hold';
  }

  // Price targets
  const priceMatch = content.match(/\$(\d+[,.]?\d*[kKmM]?)/);
  if (priceMatch) {
    metadata.tradingSignals.priceTarget = priceMatch[0];
  }

  // Timeframe
  if (lowerContent.includes('today') || lowerContent.includes('24h') || lowerContent.includes('hours')) {
    metadata.tradingSignals.timeframe = 'short';
  } else if (lowerContent.includes('week') || lowerContent.includes('month')) {
    metadata.tradingSignals.timeframe = 'medium';
  } else if (lowerContent.includes('long term') || lowerContent.includes('hodl')) {
    metadata.tradingSignals.timeframe = 'long';
  }

  // Conviction
  if (lowerContent.includes('100%') || lowerContent.includes('extremely') || lowerContent.includes('very bullish')) {
    metadata.tradingSignals.conviction = 'high';
  } else if (lowerContent.includes('might') || lowerContent.includes('maybe') || lowerContent.includes('possibly')) {
    metadata.tradingSignals.conviction = 'low';
  } else {
    metadata.tradingSignals.conviction = 'medium';
  }

  // Risk level
  if (lowerContent.includes('high risk') || lowerContent.includes('degen') || lowerContent.includes('gamble')) {
    metadata.tradingSignals.riskLevel = 'high';
  } else if (lowerContent.includes('low risk') || lowerContent.includes('safe') || lowerContent.includes('blue chip')) {
    metadata.tradingSignals.riskLevel = 'low';
  } else {
    metadata.tradingSignals.riskLevel = 'medium';
  }

  // Sentiment
  const bullishWords = ['bullish', 'moon', 'pump', 'rocket', 'gains', 'up', 'green', 'ath', 'breakout'];
  const bearishWords = ['bearish', 'dump', 'crash', 'down', 'red', 'loss', 'warning', 'caution'];
  
  const bullishCount = bullishWords.filter(word => lowerContent.includes(word)).length;
  const bearishCount = bearishWords.filter(word => lowerContent.includes(word)).length;
  
  if (bullishCount > bearishCount) {
    metadata.sentiment.sentiment = bullishCount >= 3 ? 'very_bullish' : 'bullish';
    metadata.sentiment.confidence = Math.min(bullishCount * 25, 95);
  } else if (bearishCount > bullishCount) {
    metadata.sentiment.sentiment = bearishCount >= 3 ? 'very_bearish' : 'bearish';
    metadata.sentiment.confidence = Math.min(bearishCount * 25, 95);
  } else {
    metadata.sentiment.sentiment = 'neutral';
    metadata.sentiment.confidence = 50;
  }

  metadata.sentiment.keywords = [...bullishWords, ...bearishWords].filter(word => 
    lowerContent.includes(word)
  );

  // Technical indicators
  metadata.technicalData.indicators = [];
  metadata.technicalData.levels = [];

  const indicators = ['RSI', 'MACD', 'EMA', 'SMA', 'Fibonacci', 'Support', 'Resistance'];
  indicators.forEach(indicator => {
    if (content.includes(indicator) || content.includes(indicator.toLowerCase())) {
      metadata.technicalData.indicators.push(indicator);
    }
  });

  // Extract support/resistance levels
  const supportMatch = content.match(/support[:\s]+\$?(\d+[,.]?\d*[kKmM]?)/i);
  if (supportMatch) {
    metadata.technicalData.levels.push({ type: 'support', value: supportMatch[1] });
  }

  const resistanceMatch = content.match(/resistance[:\s]+\$?(\d+[,.]?\d*[kKmM]?)/i);
  if (resistanceMatch) {
    metadata.technicalData.levels.push({ type: 'resistance', value: resistanceMatch[1] });
  }

  // Alert metadata
  if (category === 'alert') {
    metadata.alertMetadata = {
      alertType: 'general',
      urgency: 'high',
      actionable: true
    };

    if (lowerContent.includes('listing') || lowerContent.includes('exchange')) {
      metadata.alertMetadata.alertType = 'listing';
    } else if (lowerContent.includes('whale')) {
      metadata.alertMetadata.alertType = 'whale';
    } else if (lowerContent.includes('price') || lowerContent.includes('ath')) {
      metadata.alertMetadata.alertType = 'price';
    } else if (lowerContent.includes('technical') || lowerContent.includes('breakout')) {
      metadata.alertMetadata.alertType = 'technical';
    } else if (lowerContent.includes('news') || lowerContent.includes('announcement')) {
      metadata.alertMetadata.alertType = 'news';
    }

    if (lowerContent.includes('urgent') || lowerContent.includes('critical') || lowerContent.includes('breaking')) {
      metadata.alertMetadata.urgency = 'high';
    } else if (lowerContent.includes('soon') || lowerContent.includes('upcoming')) {
      metadata.alertMetadata.urgency = 'medium';
    } else {
      metadata.alertMetadata.urgency = 'low';
    }
  }

  return metadata;
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
