
// Updated DeFi Yield Pools data for September 6, 2025
export const currentYieldPools = [
  // Lending Protocols - High Demand & Rates
  {
    pool: 'aave-v3-weth-lending',
    chain: 'Ethereum',
    project: 'Aave V3',
    symbol: 'WETH',
    tvlUsd: 2450000000,
    apy: 4.85,
    apyBase: 2.15,
    apyReward: 2.70,
    rewardTokens: ['AAVE'],
    poolMeta: 'Lending pool',
    category: 'lending'
  },
  {
    pool: 'compound-v3-usdc',
    chain: 'Ethereum',
    project: 'Compound V3',
    symbol: 'USDC',
    tvlUsd: 1890000000,
    apy: 5.92,
    apyBase: 5.92,
    apyReward: 0,
    poolMeta: 'Lending pool',
    category: 'lending'
  },
  {
    pool: 'aave-polygon-usdt',
    chain: 'Polygon',
    project: 'Aave',
    symbol: 'USDT',
    tvlUsd: 892000000,
    apy: 7.45,
    apyBase: 4.85,
    apyReward: 2.60,
    rewardTokens: ['MATIC', 'AAVE'],
    poolMeta: 'Lending pool',
    category: 'lending'
  },

  // DEX Liquidity Pools - High Volume Pairs
  {
    pool: 'uniswap-v3-eth-usdc-005',
    chain: 'Ethereum', 
    project: 'Uniswap V3',
    symbol: 'ETH-USDC',
    tvlUsd: 1650000000,
    apy: 12.85,
    apyBase: 8.45,
    apyReward: 4.40,
    rewardTokens: ['UNI'],
    poolMeta: '0.05% fee tier LP',
    category: 'dex'
  },
  {
    pool: 'curve-3pool-ethereum',
    chain: 'Ethereum',
    project: 'Curve',
    symbol: '3CRV',
    tvlUsd: 1420000000,
    apy: 9.65,
    apyBase: 6.25,
    apyReward: 3.40,
    rewardTokens: ['CRV', 'CVX'],
    poolMeta: 'Stableswap LP',
    category: 'dex'
  },
  {
    pool: 'pancakeswap-v3-bnb-usdt',
    chain: 'BSC',
    project: 'PancakeSwap V3',
    symbol: 'BNB-USDT',
    tvlUsd: 785000000,
    apy: 15.75,
    apyBase: 9.85,
    apyReward: 5.90,
    rewardTokens: ['CAKE'],
    poolMeta: 'V3 LP pool',
    category: 'dex'
  },

  // Liquid Staking - Growing Category
  {
    pool: 'lido-steth',
    chain: 'Ethereum',
    project: 'Lido',
    symbol: 'stETH',
    tvlUsd: 3450000000,
    apy: 3.85,
    apyBase: 3.85,
    apyReward: 0,
    poolMeta: 'Liquid staking',
    category: 'staking'
  },
  {
    pool: 'rocket-pool-reth',
    chain: 'Ethereum', 
    project: 'Rocket Pool',
    symbol: 'rETH',
    tvlUsd: 1890000000,
    apy: 4.12,
    apyBase: 4.12,
    apyReward: 0,
    poolMeta: 'Liquid staking',
    category: 'staking'
  },
  {
    pool: 'marinade-msol',
    chain: 'Solana',
    project: 'Marinade',
    symbol: 'mSOL',
    tvlUsd: 967000000,
    apy: 7.28,
    apyBase: 7.28,
    apyReward: 0,
    poolMeta: 'Liquid staking',
    category: 'staking'
  },

  // Layer 2 High Yields
  {
    pool: 'arbitrum-gmx-glp',
    chain: 'Arbitrum',
    project: 'GMX',
    symbol: 'GLP',
    tvlUsd: 645000000,
    apy: 18.95,
    apyBase: 12.45,
    apyReward: 6.50,
    rewardTokens: ['GMX', 'ETH'],
    poolMeta: 'Liquidity provider token',
    category: 'derivatives'
  },
  {
    pool: 'optimism-velodrome-velo-op',
    chain: 'Optimism',
    project: 'Velodrome',
    symbol: 'VELO-OP',
    tvlUsd: 234000000,
    apy: 24.75,
    apyBase: 16.25,
    apyReward: 8.50,
    rewardTokens: ['VELO', 'OP'],
    poolMeta: 'Volatile LP',
    category: 'dex'
  },

  // Avalanche Ecosystem  
  {
    pool: 'trader-joe-avax-usdc',
    chain: 'Avalanche',
    project: 'Trader Joe',
    symbol: 'AVAX-USDC',
    tvlUsd: 189000000,
    apy: 19.85,
    apyBase: 13.25,
    apyReward: 6.60,
    rewardTokens: ['JOE'],
    poolMeta: 'Liquidity Book LP',
    category: 'dex'
  },

  // Real Yield Protocols
  {
    pool: 'radiant-dlp-arbitrum',
    chain: 'Arbitrum',
    project: 'Radiant',
    symbol: 'dLP',
    tvlUsd: 156000000,
    apy: 16.45,
    apyBase: 8.95,
    apyReward: 7.50,
    rewardTokens: ['RDNT'],
    poolMeta: 'Dynamic LP token',
    category: 'lending'
  }
];

export const topProtocols = [
  {
    name: 'Lido',
    tvl: 32500000000,
    category: 'Liquid Staking',
    change_1d: 2.45,
    chains: ['Ethereum', 'Solana', 'Polygon']
  },
  {
    name: 'Aave',
    tvl: 12890000000,
    category: 'Lending', 
    change_1d: 1.85,
    chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche']
  },
  {
    name: 'Uniswap',
    tvl: 8750000000,
    category: 'Dexes',
    change_1d: 3.25,
    chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base']
  },
  {
    name: 'Curve',
    tvl: 4250000000,
    category: 'Dexes',
    change_1d: -1.25,
    chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism']
  },
  {
    name: 'Compound',
    tvl: 3890000000,
    category: 'Lending',
    change_1d: 0.85,
    chains: ['Ethereum', 'Polygon', 'Arbitrum']
  },
  {
    name: 'MakerDAO',
    tvl: 6780000000,
    category: 'Lending',
    change_1d: 1.45,
    chains: ['Ethereum']
  },
  {
    name: 'Rocket Pool',
    tvl: 2450000000,
    category: 'Liquid Staking',
    change_1d: 3.85,
    chains: ['Ethereum']
  },
  {
    name: 'PancakeSwap',
    tvl: 2890000000,
    category: 'Dexes',
    change_1d: 4.25,
    chains: ['BSC', 'Ethereum', 'Arbitrum']
  },
  {
    name: 'GMX',
    tvl: 1250000000,
    category: 'Derivatives',
    change_1d: 8.45,
    chains: ['Arbitrum', 'Avalanche']
  },
  {
    name: 'Convex',
    tvl: 1890000000,
    category: 'Yield',
    change_1d: -2.15,
    chains: ['Ethereum']
  }
];
