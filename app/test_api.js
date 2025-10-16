// Test the blockchain explorer API
const API_KEY = '9SQK86R3TF1V2FW6GTKWTK2KB1VA3R3USZ';

// Test with a known token address (USDT on Ethereum)
const TEST_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'; // USDT on Ethereum
const ETHERSCAN_URL = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${TEST_ADDRESS}&page=1&offset=10&sort=desc&apikey=${API_KEY}`;

console.log('Testing Etherscan API...');
console.log('URL:', ETHERSCAN_URL);

fetch(ETHERSCAN_URL)
  .then(res => res.json())
  .then(data => {
    console.log('\nAPI Response:');
    console.log('Status:', data.status);
    console.log('Message:', data.message);
    console.log('Result length:', data.result ? data.result.length : 0);
    if (data.status === '0') {
      console.log('\nERROR Details:');
      console.log('Full result:', data.result);
    } else {
      console.log('\nSUCCESS! API is working.');
    }
  })
  .catch(err => {
    console.error('Fetch error:', err);
  });
