// Test Twitter API authentication
const TWITTER_API_KEY = process.env.TWITTER_API_KEY || '051ajNGODt9pKRVKEaBnS1qIZ';
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET || 'GNu8RhMC1cYVS1qfWjjCBAyniAe0mMNbji2gKhSOeq90XKtAtd';

async function testAuth() {
  const credentials = Buffer.from(
    `${encodeURIComponent(TWITTER_API_KEY)}:${encodeURIComponent(TWITTER_API_SECRET)}`
  ).toString('base64');

  try {
    console.log('Testing Twitter API authentication...');
    const response = await fetch('https://api.twitter.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: 'grant_type=client_credentials',
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Twitter API authentication successful!');
      
      // Test fetching a user
      const userResponse = await fetch('https://api.twitter.com/2/users/by/username/elonmusk', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });
      
      console.log('\nUser fetch status:', userResponse.status);
      const userData = await userResponse.json();
      console.log('User data:', JSON.stringify(userData, null, 2));
    } else {
      console.log('\n❌ Twitter API authentication failed!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuth();
