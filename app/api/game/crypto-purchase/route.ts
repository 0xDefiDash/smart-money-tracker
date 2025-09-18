

import { NextRequest, NextResponse } from 'next/server'

// Interface for the request body
interface CryptoPurchaseRequest {
  itemId: string
  playerId: string
  playerWalletAddress: string
  amount: number
  token: string
  treasuryAddress: string
}

// Interface for Base Chain transaction (simulation)
interface BlockchainTransaction {
  hash: string
  from: string
  to: string
  amount: number
  token: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
  gasUsed?: number
  blockNumber?: number
}

// Function to simulate Base Chain transaction
const simulateBaseChainTransfer = async (
  fromAddress: string,
  toAddress: string,
  amount: number,
  token: string
): Promise<BlockchainTransaction> => {
  // In a real implementation, this would:
  // 1. Connect to Base Chain RPC
  // 2. Create and sign transaction
  // 3. Send transaction to network
  // 4. Return transaction hash and details
  
  // For simulation, we generate a realistic transaction hash
  const transactionHash = `0x${Math.random().toString(16).substring(2).padStart(64, '0')}`
  const blockNumber = Math.floor(Math.random() * 1000000) + 15000000 // Realistic Base Chain block number
  const gasUsed = 21000 + Math.floor(Math.random() * 30000) // Realistic gas usage
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000))
  
  // Simulate 95% success rate (realistic for blockchain transactions)
  const success = Math.random() > 0.05
  
  return {
    hash: transactionHash,
    from: fromAddress,
    to: toAddress,
    amount,
    token,
    timestamp: Date.now(),
    status: success ? 'confirmed' : 'failed',
    gasUsed,
    blockNumber: success ? blockNumber : undefined
  }
}

// Function to validate Ethereum address format
const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export async function POST(request: NextRequest) {
  try {
    const body: CryptoPurchaseRequest = await request.json()
    const { 
      itemId, 
      playerId, 
      playerWalletAddress, 
      amount, 
      token, 
      treasuryAddress 
    } = body

    // Validate required fields
    if (!itemId || !playerId || !playerWalletAddress || !amount || !token || !treasuryAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate wallet addresses
    if (!isValidEthereumAddress(playerWalletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid player wallet address format' },
        { status: 400 }
      )
    }

    if (!isValidEthereumAddress(treasuryAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid treasury wallet address format' },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount <= 0 || amount > 10000) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction amount' },
        { status: 400 }
      )
    }

    // Validate supported token
    if (token !== 'DEFIDASH') {
      return NextResponse.json(
        { success: false, error: 'Unsupported token. Only DEFIDASH is accepted.' },
        { status: 400 }
      )
    }

    // Log the transaction attempt for security/monitoring
    console.log(`[CRYPTO-PURCHASE] Player ${playerId} attempting to purchase ${itemId} for ${amount} ${token}`)
    console.log(`[CRYPTO-PURCHASE] Transfer: ${playerWalletAddress} -> ${treasuryAddress}`)

    // Execute the blockchain transaction
    const transaction = await simulateBaseChainTransfer(
      playerWalletAddress,
      treasuryAddress,
      amount,
      token
    )

    if (transaction.status === 'failed') {
      return NextResponse.json(
        { success: false, error: 'Blockchain transaction failed. Please check your wallet balance and try again.' },
        { status: 400 }
      )
    }

    // Log successful transaction
    console.log(`[CRYPTO-PURCHASE] SUCCESS - TX Hash: ${transaction.hash}`)
    console.log(`[CRYPTO-PURCHASE] Block: ${transaction.blockNumber}, Gas: ${transaction.gasUsed}`)

    // Return success response with transaction details
    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${amount} ${token} to treasury`,
      transactionHash: transaction.hash,
      blockNumber: transaction.blockNumber,
      gasUsed: transaction.gasUsed,
      treasuryAddress,
      amount,
      token,
      itemId,
      timestamp: transaction.timestamp
    })

  } catch (error) {
    console.error('[CRYPTO-PURCHASE] API error:', error)
    
    // Return generic error to avoid exposing internal details
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during crypto purchase. Please try again.' 
      },
      { status: 500 }
    )
  }
}

// GET method for transaction status checking (optional)
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const txHash = url.searchParams.get('txHash')
  
  if (!txHash) {
    return NextResponse.json(
      { success: false, error: 'Transaction hash required' },
      { status: 400 }
    )
  }
  
  // In a real implementation, this would query the blockchain for transaction status
  // For simulation, return mock status
  return NextResponse.json({
    success: true,
    transactionHash: txHash,
    status: 'confirmed',
    confirmations: Math.floor(Math.random() * 50) + 1,
    blockNumber: Math.floor(Math.random() * 1000000) + 15000000
  })
}
