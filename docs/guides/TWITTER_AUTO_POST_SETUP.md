
# Twitter Auto-Posting System Setup Guide

## 🎉 Successfully Configured!

The Twitter auto-posting system is now fully configured and ready to automatically share:
- 🐋 Whale movements ($5M+ transactions)
- 📊 Token calls from shot callers
- 📈 Daily market summaries
- 🚀 Trending token alerts

## ✅ Test Posts Completed

Three test tweets were successfully posted to @Defidash_Agent:

1. **Platform Launch Tweet** ✅
   - Tweet ID: 1989717441518416057
   - View: https://twitter.com/Defidash_Agent/status/1989717441518416057

2. **Whale Alert Example** ✅
   - Tweet ID: 1989717463370698787
   - $60.8M ETH purchase alert
   - View: https://twitter.com/Defidash_Agent/status/1989717463370698787

3. **Market Update Example** ✅
   - Tweet ID: 1989717485214732746
   - BTC market update with sentiment
   - View: https://twitter.com/Defidash_Agent/status/1989717485214732746

## 📋 How It Works

### Automated Posting Flow

```
Every 30 minutes:
  ↓
Check for whale movements ($5M+)
  ↓
Check for new token calls
  ↓
Post up to 3 tweets per run
  ↓
Wait for next interval
```

### Daily Schedule
- **9:00 AM UTC**: Daily market summary
- **Every 30 minutes**: Whale alerts & token calls
- **Rate limiting**: Max 3 posts per run

## 🚀 Setup Methods

### Method 1: Manual Cron Job (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line (runs every 30 minutes)
*/30 * * * * curl -X POST http://localhost:3000/api/cron/auto-post -H "Authorization: Bearer defidash-auto-post-2025" >> /var/log/twitter-autopost.log 2>&1
```

### Method 2: External Cron Service

Use services like:
- **cron-job.org** (Free, reliable)
- **EasyCron** (Free tier available)
- **Google Cloud Scheduler**
- **AWS EventBridge**

**Configuration:**
```
URL: https://defidashtracker.com/api/cron/auto-post
Method: POST
Interval: Every 30 minutes
Headers:
  Authorization: Bearer defidash-auto-post-2025
```

### Method 3: Vercel Cron (if deployed on Vercel)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/auto-post",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

### Method 4: Manual Execution (Testing)

```bash
# Test the auto-posting script directly
cd /home/ubuntu/smart_money_tracker/app
npx tsx scripts/auto-twitter-post.ts

# Or call the API endpoint
curl -X POST http://localhost:3000/api/cron/auto-post \
  -H "Authorization: Bearer defidash-auto-post-2025"
```

## 📁 Files Created

### 1. `/scripts/auto-twitter-post.ts`
Main automation script that:
- Fetches recent whale transactions
- Monitors token calls from shot callers
- Posts tweets based on significance
- Implements rate limiting
- Tracks posted content to avoid duplicates

**Configuration:**
```typescript
const CONFIG = {
  WHALE_THRESHOLD_USD: 5000000,     // $5M minimum
  TOKEN_CALL_MIN_ENGAGEMENT: 100,   // Engagement threshold
  POSTING_INTERVAL_MINUTES: 30,    // Post frequency
  MAX_POSTS_PER_RUN: 3,             // Rate limit
  DRY_RUN: false                    // Set true for testing
};
```

### 2. `/app/api/cron/auto-post/route.ts`
API endpoint for scheduled execution:
- Runs the auto-posting script
- Handles authentication
- Returns execution status
- Supports timeout protection

### 3. `/app/api/twitter/schedule/route.ts`
Alternative scheduling endpoint with different auth options.

### 4. `/test-twitter-now.ts`
Test script for immediate posting verification.

## 🎯 Tweet Types

### 1. Whale Alerts 🐋
Posted when transactions exceed $5M:
```
🐋 WHALE ALERT 🟢

15,234 $ETH bought
💰 Value: $60.8M
⛓️ Chain: Ethereum
📍 0x742d35Cc...

Track whale activity: https://defidashtracker.com/whale-tracker

#Crypto #WhaleAlert #ETH
```

### 2. Token Calls 📢
Posted when shot callers make significant calls:
```
🚀 TOKEN CALL ALERT

Shot Caller: @crypto_whale
Tokens: $BTC $ETH $SOL
Sentiment: VERY_BULLISH

Analysis shows strong accumulation...

Track shot callers: https://defidashtracker.com/shot-callers

#Crypto #TokenCall #SmartMoney
```

### 3. Market Updates 📊
Posted for significant price movements:
```
🚀 BTC Market Update

💵 Price: $111,888
📈 24h: +8.5%
📊 Sentiment: BULLISH

Get real-time market insights: https://defidashtracker.com

#Crypto #BTC #MarketUpdate
```

### 4. Daily Reports 📈
Posted daily at 9 AM UTC:
```
📊 Daily Crypto Report - Nov 15, 2025

🐋 Whale Transactions: 45
📈 Top Movers:
• $BTC: +8.5%
• $ETH: +6.2%
• $SOL: +12.3%

📌 Market Sentiment: BULLISH

Full report: https://defidashtracker.com

#Crypto #DailyReport #DeFi
```

## 🔧 Configuration

### Environment Variables

Add to `.env`:
```bash
# Cron authentication (change this!)
CRON_SECRET=your-secure-random-string-here

# Twitter credentials (already configured)
# Located in /home/ubuntu/.config/abacusai_auth_secrets.json
```

### Customize Posting Rules

Edit `/scripts/auto-twitter-post.ts`:

```typescript
// Adjust whale threshold
WHALE_THRESHOLD_USD: 10000000,  // Change to $10M

// Adjust posting frequency
POSTING_INTERVAL_MINUTES: 60,  // Post every hour

// Enable dry run for testing
DRY_RUN: true,  // Won't actually post tweets
```

## 🧪 Testing

### Test the full system:
```bash
cd /home/ubuntu/smart_money_tracker/app

# Run with dry run enabled (won't post)
npx tsx scripts/auto-twitter-post.ts

# Run actual posting
npx tsx test-twitter-now.ts
```

### Test the cron endpoint:
```bash
curl -X POST http://localhost:3000/api/cron/auto-post \
  -H "Authorization: Bearer defidash-auto-post-2025" \
  -v
```

### Check endpoint status:
```bash
curl http://localhost:3000/api/cron/auto-post
```

## 📊 Monitoring

### View Logs
```bash
# If using cron
tail -f /var/log/twitter-autopost.log

# If running manually
npx tsx scripts/auto-twitter-post.ts
```

### Check Recent Posts
Visit: https://twitter.com/Defidash_Agent

### Monitor API Health
```bash
curl http://localhost:3000/api/cron/auto-post
```

## 🛡️ Security

1. **Change the CRON_SECRET** in production:
   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   
   # Add to .env
   CRON_SECRET=your-generated-secret
   ```

2. **Restrict API Access**:
   - Only allow specific IP addresses if possible
   - Use HTTPS in production
   - Rotate secrets regularly

3. **Rate Limiting**:
   - Built-in: Max 3 posts per run
   - Twitter: Respects API rate limits
   - Cooldown: 30 minutes between runs

## 🚨 Troubleshooting

### Issue: No tweets being posted
**Solution:**
1. Check Twitter credentials in `/home/ubuntu/.config/abacusai_auth_secrets.json`
2. Verify API is receiving whale/token data
3. Check if threshold requirements are met ($5M for whales)
4. Review logs for errors

### Issue: Duplicate tweets
**Solution:**
- Script tracks last posted IDs to prevent duplicates
- Wait for new whale movements or token calls
- Check if data sources are providing new content

### Issue: Cron job not running
**Solution:**
```bash
# Verify cron service is running
sudo systemctl status cron

# Check cron logs
grep CRON /var/log/syslog

# Test endpoint manually
curl -X POST http://localhost:3000/api/cron/auto-post \
  -H "Authorization: Bearer defidash-auto-post-2025"
```

### Issue: Rate limit errors
**Solution:**
- Script automatically handles Twitter rate limits
- Reduces posting frequency if needed
- Implements 1-second delay between API calls

## 📈 Next Steps

1. **Set up monitoring**: Track posting success rate
2. **Customize thresholds**: Adjust what gets posted
3. **Add more tweet types**: Platform announcements, partnerships
4. **Analytics**: Track engagement on automated tweets
5. **A/B testing**: Test different tweet formats

## 🔗 Resources

- Twitter API Docs: https://developer.twitter.com/en/docs/twitter-api
- Cron Job.org: https://cron-job.org/
- Vercel Cron: https://vercel.com/docs/cron-jobs
- @Defidash_Agent: https://twitter.com/Defidash_Agent

## 📞 Support

If you need help:
1. Check logs for error messages
2. Verify API credentials
3. Test with dry run mode first
4. Review this documentation

---

**System Status: ✅ ACTIVE**
**Last Updated: November 15, 2025**
**Twitter Account: @Defidash_Agent**
