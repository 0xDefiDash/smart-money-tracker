// Test script for AsterDex API integration
import crypto from 'crypto';

// Hardcoded for testing
const API_KEY = 'e30671427db297250334b9b2b3e744130079c586b39f7b023784f97253342115';
const SECRET_KEY = '36f41496bd3bfaefbab38dafca6c5694c52b296c9f401c026cf271faa3a2f900';
const BASE_URL = 'https://fapi.asterdex.com';

console.log('🔧 Testing AsterDex API Integration');
console.log('=' .repeat(60));
console.log(`API Key: ${API_KEY?.substring(0, 10)}...${API_KEY?.substring(API_KEY.length - 10)}`);
console.log(`Secret Key: ${SECRET_KEY?.substring(0, 10)}...${SECRET_KEY?.substring(SECRET_KEY.length - 10)}`);
console.log('=' .repeat(60));

function generateSignature(queryString: string): string {
  if (!SECRET_KEY) throw new Error('SECRET_KEY not found');
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(queryString)
    .digest('hex');
}

async function testEndpoint(name: string, endpoint: string, params: Record<string, any> = {}, signed: boolean = false) {
  try {
    console.log(`\n📡 Testing: ${name}`);
    console.log(`Endpoint: ${endpoint}`);
    
    const timestamp = Date.now();
    let url = `${BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'X-MBX-APIKEY': API_KEY || '',
      'Content-Type': 'application/json'
    };

    if (signed) {
      params.timestamp = timestamp;
      const queryString = new URLSearchParams(params as Record<string, string>).toString();
      params.signature = generateSignature(queryString);
    }

    if (Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params as Record<string, string>).toString();
      url += `?${queryString}`;
    }

    console.log(`URL: ${url}`);
    console.log(`Signed: ${signed}`);

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success (${response.status})`);
      console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500));
    } else {
      console.log(`❌ Failed (${response.status})`);
      console.log('Error:', JSON.stringify(data, null, 2));
    }

    return { success: response.ok, data };
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n🚀 Starting API Tests...\n');

  // Test 1: Server time (public endpoint)
  await testEndpoint('Server Time', '/fapi/v1/time');

  // Test 2: Exchange Info (public endpoint)
  await testEndpoint('Exchange Info', '/fapi/v1/exchangeInfo');

  // Test 3: Ticker Price (public endpoint)
  await testEndpoint('Ticker Price', '/fapi/v1/ticker/price', { symbol: 'BTCUSDT' });

  // Test 4: Account Information (signed endpoint)
  await testEndpoint('Account Information', '/fapi/v2/account', {}, true);

  // Test 5: Position Information (signed endpoint)
  await testEndpoint('Position Information', '/fapi/v2/positionRisk', {}, true);

  // Test 6: Open Orders (signed endpoint)
  await testEndpoint('Open Orders', '/fapi/v1/openOrders', {}, true);

  console.log('\n' + '='.repeat(60));
  console.log('✨ Test Suite Complete');
  console.log('=' .repeat(60));
}

runTests().catch(console.error);
