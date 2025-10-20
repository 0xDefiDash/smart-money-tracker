
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Seed wallet addresses for tracked KOLs
const KOL_WALLETS = [
  {
    kolUsername: 'CryptoExpert101',
    ethAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    bnbAddress: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
    solAddress: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
    usdcEthAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    usdcBnbAddress: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
    preferredCurrency: 'ETH',
    isVerified: true
  },
  {
    kolUsername: 'JamesWynnReal',
    ethAddress: '0x1234567890123456789012345678901234567890',
    bnbAddress: '0x0987654321098765432109876543210987654321',
    solAddress: 'J4MESwyNN1234567890abcdefghijklmnopqrstuv',
    usdcEthAddress: '0x1234567890123456789012345678901234567890',
    preferredCurrency: 'ETH',
    isVerified: true
  },
  {
    kolUsername: 'BullRunGravano',
    ethAddress: '0xBbbbBBBbbBBBbbbBbbBBbbbbbBBbBBbbBbbbBbBB',
    bnbAddress: '0xAAAAaAaaAaaaAAaaAaAAAAaAAAAaAaaAaaAaAaAa',
    solAddress: 'BULLruN1GravaN01234567890abcdefghijklmno',
    usdcEthAddress: '0xBbbbBBBbbBBBbbbBbbBBbbbbbBBbBBbbBbbbBbBB',
    preferredCurrency: 'USDC_ETH',
    isVerified: true
  },
  {
    kolUsername: '100xDarren',
    ethAddress: '0x100x100x100x100x100x100x100x100x100x100x',
    bnbAddress: '0xDARRENDARRENDARRENDARRENDARRENDARRENDARR',
    solAddress: '100xDaRReN1234567890abcdefghijklmnopqrstuv',
    usdcEthAddress: '0x100x100x100x100x100x100x100x100x100x100x',
    preferredCurrency: 'ETH',
    isVerified: true
  },
  {
    kolUsername: 'elonmusk',
    ethAddress: '0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    bnbAddress: '0xELONELONELONELONELONELONELONELONELONELON',
    solAddress: 'ELonMuSk1234567890abcdefghijklmnopqrstuvw',
    usdcEthAddress: '0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    preferredCurrency: 'ETH',
    isVerified: true
  },
  {
    kolUsername: 'cz_binance',
    ethAddress: '0xCZCZCZCZCZCZCZCZCZCZCZCZCZCZCZCZCZCZCZCZ',
    bnbAddress: '0xBINANCEBINANCEBINANCEBINANCEBINANCEBINA',
    solAddress: 'CzBiNanCe1234567890abcdefghijklmnopqrstuv',
    usdcBnbAddress: '0xBINANCEBINANCEBINANCEBINANCEBINANCEBINA',
    preferredCurrency: 'BNB',
    isVerified: true
  },
  {
    kolUsername: 'four_meme_',
    ethAddress: '0x444444444444444444444444444444444444444',
    bnbAddress: '0xF0URF0URF0URF0URF0URF0URF0URF0URF0URF0UR',
    solAddress: 'F0uRmEmE1234567890abcdefghijklmnopqrstuvw',
    usdcEthAddress: '0x444444444444444444444444444444444444444',
    preferredCurrency: 'ETH',
    isVerified: true
  },
  {
    kolUsername: '0xPoet',
    ethAddress: '0xP0ETP0ETP0ETP0ETP0ETP0ETP0ETP0ETP0ETP0ET',
    bnbAddress: '0x0xP0ET0xP0ET0xP0ET0xP0ET0xP0ET0xP0ET0xP0',
    solAddress: '0xPoEt1234567890abcdefghijklmnopqrstuvwxyz',
    usdcEthAddress: '0xP0ETP0ETP0ETP0ETP0ETP0ETP0ETP0ETP0ETP0ET',
    preferredCurrency: 'ETH',
    isVerified: false
  }
];

export async function POST() {
  try {
    const results = [];

    for (const wallet of KOL_WALLETS) {
      const result = await db.kOLWallet.upsert({
        where: { kolUsername: wallet.kolUsername },
        update: {
          ...wallet,
          updatedAt: new Date()
        },
        create: wallet
      });
      results.push(result);
    }

    return NextResponse.json({
      message: 'KOL wallets seeded successfully',
      count: results.length,
      wallets: results
    });
  } catch (error) {
    console.error('Error seeding KOL wallets:', error);
    return NextResponse.json(
      { error: 'Failed to seed KOL wallets' },
      { status: 500 }
    );
  }
}
