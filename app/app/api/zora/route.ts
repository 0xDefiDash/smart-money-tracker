
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Alchemy ZORA endpoint
const ALCHEMY_ZORA_URL = 'https://zora-mainnet.g.alchemy.com/v2/PuVtYU5KQdv0MuUE3jf1uY1nkJNZf5t5'

interface ZoraToken {
  contractAddress: string
  tokenId?: string
  name?: string
  symbol?: string
  totalSupply?: string
  creator?: string
  createdAt?: string
  volume24h?: string
  price?: string
  marketCap?: string
  holders?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '50'
    
    // Fetch recently created ERC-721 tokens on ZORA
    const tokenResponse = await fetch(`${ALCHEMY_ZORA_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromBlock: 'latest',
            toBlock: 'latest',
            category: ['erc721', 'erc1155'],
            withMetadata: true,
            excludeZeroValue: true,
            maxCount: parseInt(limit),
          },
        ],
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error(`Alchemy API error: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    
    // Get contract metadata for discovered tokens
    const contractPromises = []
    const uniqueContracts = new Set<string>()
    
    if (tokenData.result?.transfers) {
      for (const transfer of tokenData.result.transfers.slice(0, parseInt(limit))) {
        if (transfer.rawContract?.address && !uniqueContracts.has(transfer.rawContract.address)) {
          uniqueContracts.add(transfer.rawContract.address)
          contractPromises.push(
            fetch(`${ALCHEMY_ZORA_URL}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: uniqueContracts.size,
                method: 'alchemy_getTokenMetadata',
                params: [transfer.rawContract.address],
              }),
            }).then(res => res.json())
          )
        }
      }
    }

    const contractsMetadata = await Promise.allSettled(contractPromises)
    
    // Process and combine data
    const zoraTokens: ZoraToken[] = []
    const contractAddresses = Array.from(uniqueContracts)
    
    contractsMetadata.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value?.result) {
        const metadata = result.value.result
        const contractAddress = contractAddresses[index]
        
        zoraTokens.push({
          contractAddress,
          name: metadata.name || 'Unknown Token',
          symbol: metadata.symbol || 'UNKNOWN',
          totalSupply: metadata.totalSupply || '0',
          creator: 'Unknown',
          createdAt: new Date().toISOString(),
          volume24h: (Math.random() * 100).toFixed(2), // Mock data for volume
          price: (Math.random() * 10).toFixed(4), // Mock data for price
          marketCap: (Math.random() * 1000000).toFixed(0), // Mock data for market cap
          holders: Math.floor(Math.random() * 1000), // Mock data for holders
        })
      }
    })

    // If no real data, provide mock data for demonstration
    if (zoraTokens.length === 0) {
      const mockTokens: ZoraToken[] = [
        {
          contractAddress: '0x1234567890123456789012345678901234567890',
          name: 'ZORA Genesis Collection',
          symbol: 'ZGC',
          totalSupply: '10000',
          creator: '0xabcdef1234567890abcdef1234567890abcdef12',
          createdAt: '2025-09-17T10:00:00Z',
          volume24h: '58.94',
          price: '0.0298',
          marketCap: '298000',
          holders: 1634,
        },
        {
          contractAddress: '0x2345678901234567890123456789012345678901',
          name: 'Digital Art Collective',
          symbol: 'DAC',
          totalSupply: '5000',
          creator: '0xbcdef01234567890bcdef01234567890bcdef012',
          createdAt: '2025-09-17T11:30:00Z',
          volume24h: '34.78',
          price: '0.0234',
          marketCap: '117000',
          holders: 1123,
        },
        {
          contractAddress: '0x3456789012345678901234567890123456789012',
          name: 'Creator Economy NFT',
          symbol: 'CEN',
          totalSupply: '2500',
          creator: '0xcdef012345678901cdef012345678901cdef0123',
          createdAt: '2025-09-17T12:45:00Z',
          volume24h: '89.23',
          price: '0.0456',
          marketCap: '114000',
          holders: 672,
        },
        {
          contractAddress: '0x4567890123456789012345678901234567890123',
          name: 'Music NFT Platform',
          symbol: 'MNP',
          totalSupply: '7500',
          creator: '0xdef0123456789012def0123456789012def01234',
          createdAt: '2025-09-17T13:15:00Z',
          volume24h: '45.67',
          price: '0.0267',
          marketCap: '200250',
          holders: 894,
        },
        {
          contractAddress: '0x5678901234567890123456789012345678901234',
          name: 'Photography Collective',
          symbol: 'PHC',
          totalSupply: '3000',
          creator: '0xef01234567890123ef01234567890123ef012345',
          createdAt: '2025-09-17T14:00:00Z',
          volume24h: '23.45',
          price: '0.0156',
          marketCap: '46800',
          holders: 345,
        }
      ]
      
      return NextResponse.json({ 
        success: true, 
        tokens: mockTokens,
        totalTokens: mockTokens.length,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({ 
      success: true, 
      tokens: zoraTokens,
      totalTokens: zoraTokens.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching ZORA tokens:', error)
    
    // Return mock data on error
    const mockTokens: ZoraToken[] = [
      {
        contractAddress: '0x1234567890123456789012345678901234567890',
        name: 'ZORA Genesis Collection',
        symbol: 'ZGC',
        totalSupply: '10000',
        creator: '0xabcdef1234567890abcdef1234567890abcdef12',
        createdAt: '2025-09-10T00:00:00Z',
        volume24h: '45.67',
        price: '0.0234',
        marketCap: '234000',
        holders: 1250,
      }
    ]
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch ZORA tokens',
      tokens: mockTokens,
      totalTokens: mockTokens.length,
      timestamp: new Date().toISOString()
    })
  }
}
