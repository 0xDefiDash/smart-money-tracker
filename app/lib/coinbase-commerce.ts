
import fs from 'fs';
import path from 'path';

const AUTH_SECRETS_PATH = '/home/ubuntu/.config/abacusai_auth_secrets.json';

interface CoinbaseChargeRequest {
  name: string;
  description: string;
  pricing_type: 'fixed_price';
  local_price: {
    amount: string;
    currency: string;
  };
  metadata?: Record<string, any>;
  redirect_url?: string;
  cancel_url?: string;
}

interface CoinbaseChargeResponse {
  data: {
    id: string;
    code: string;
    hosted_url: string;
    pricing: {
      local: {
        amount: string;
        currency: string;
      };
    };
    addresses: Record<string, string>;
    timeline: Array<{
      status: string;
      time: string;
    }>;
    metadata: Record<string, any>;
  };
}

function getCoinbaseCommerceApiKey(): string {
  try {
    const secrets = JSON.parse(fs.readFileSync(AUTH_SECRETS_PATH, 'utf-8'));
    const apiKey = secrets['coinbase commerce']?.secrets?.api_key?.value;
    
    if (!apiKey) {
      throw new Error('Coinbase Commerce API key not found in auth secrets');
    }
    
    return apiKey;
  } catch (error) {
    console.error('Error reading Coinbase Commerce API key:', error);
    throw new Error('Coinbase Commerce API key not configured');
  }
}

export async function createCoinbaseCharge(
  params: CoinbaseChargeRequest
): Promise<CoinbaseChargeResponse> {
  const apiKey = getCoinbaseCommerceApiKey();
  
  const response = await fetch('https://api.commerce.coinbase.com/charges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CC-Api-Key': apiKey,
      'X-CC-Version': '2018-03-22'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Coinbase Commerce API error:', error);
    throw new Error(`Failed to create charge: ${response.status} ${error}`);
  }

  return response.json();
}

export async function getCoinbaseCharge(chargeId: string): Promise<CoinbaseChargeResponse> {
  const apiKey = getCoinbaseCommerceApiKey();
  
  const response = await fetch(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
    headers: {
      'X-CC-Api-Key': apiKey,
      'X-CC-Version': '2018-03-22'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch charge: ${response.status}`);
  }

  return response.json();
}

export function verifyCoinbaseWebhook(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  // Coinbase Commerce uses HMAC SHA-256 for webhook verification
  const crypto = require('crypto');
  const computedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
  
  return computedSignature === signature;
}
