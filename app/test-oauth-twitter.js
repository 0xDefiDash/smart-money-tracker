const fs = require('fs');

async function testTwitterOAuth() {
  try {
    // Read OAuth token
    const authSecretsPath = '/home/ubuntu/.config/abacusai_auth_secrets.json';
    const authSecrets = JSON.parse(fs.readFileSync(authSecretsPath, 'utf-8'));
    const accessToken = authSecrets.twitter.secrets.access_token.value;

    console.log('Testing Twitter OAuth with access token...');
    console.log('Token (first 20 chars):', accessToken.substring(0, 20) + '...');

    // Test fetching a user
    const userResponse = await fetch('https://api.twitter.com/2/users/by/username/elonmusk?user.fields=profile_image_url,public_metrics,verified', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('\nUser fetch status:', userResponse.status);
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ Successfully fetched user data:');
      console.log(JSON.stringify(userData, null, 2));

      // Test fetching tweets
      if (userData.data?.id) {
        console.log('\nFetching tweets...');
        const tweetsResponse = await fetch(`https://api.twitter.com/2/users/${userData.data.id}/tweets?max_results=5&tweet.fields=created_at,public_metrics,entities`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        console.log('Tweets fetch status:', tweetsResponse.status);
        
        if (tweetsResponse.ok) {
          const tweetsData = await tweetsResponse.json();
          console.log('✅ Successfully fetched tweets:');
          console.log(JSON.stringify(tweetsData, null, 2));
        } else {
          const errorData = await tweetsResponse.json();
          console.log('❌ Failed to fetch tweets:', errorData);
        }
      }
    } else {
      const errorData = await userResponse.json();
      console.log('❌ Failed to fetch user:', errorData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testTwitterOAuth();
