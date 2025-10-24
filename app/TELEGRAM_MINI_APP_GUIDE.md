
# DeFiDash Tracker - Telegram Mini App Guide

## 🚀 Overview

The DeFiDash Tracker Telegram Mini App provides a mobile-optimized interface for accessing crypto market data, whale tracking, and trending tokens directly within Telegram.

## 📱 Features

### 1. **Market Overview**
- Real-time prices for top cryptocurrencies
- 24-hour price changes with visual indicators
- Trading volume information
- Market capitalization data

### 2. **Whale Tracking**
- Live whale transaction alerts
- Transaction values and blockchain info
- Timestamp tracking
- Quick access to top whale movements

### 3. **Trending Tokens**
- Hot and trending cryptocurrency tokens
- Price change percentages
- Volume metrics
- Visual trending indicators

## 🔧 Setup Instructions

### For Users

1. **Start the Bot**
   - Search for your bot on Telegram (use bot token: 7683320014:AAH6Ri-KczlVWXXBe1ynz_LZTOkQjtZIUxw)
   - Send `/start` to begin
   - The bot will automatically show a "Launch Mini App" button

2. **Launch Mini App**
   - Click the "🚀 Open Mini App" button in the welcome message
   - Or use the `/app` or `/miniapp` command
   - Or click the menu button (📱 Open App) at the bottom of the chat

3. **Navigate the App**
   - Use tabs to switch between Market, Whales, and Trending sections
   - Tap "Refresh Data" to get the latest information
   - Click "Full App" to open the complete web application

### For Developers

#### 1. **Bot Setup API**

Configure the bot's commands and menu button:

```bash
# Setup bot commands and menu button
curl -X POST https://defidashtracker.com/api/telegram/bot-setup

# Check bot status
curl https://defidashtracker.com/api/telegram/bot-setup
```

#### 2. **Update Webhook**

Set up the webhook to receive Telegram updates:

```bash
curl -X POST https://defidashtracker.com/api/telegram/setup \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://defidashtracker.com/api/telegram/webhook"
  }'
```

#### 3. **Mini App Data APIs**

The mini app uses the following endpoints:

```typescript
// Whale transactions feed
GET /api/telegram/whale-feed
Response: { success: boolean, transactions: Array }

// Market data feed
GET /api/telegram/market-feed
Response: { success: boolean, data: Array }

// Trending tokens feed
GET /api/telegram/trending-feed
Response: { success: boolean, tokens: Array }
```

## 🎨 UI/UX Features

### Mobile-Optimized Design
- Responsive layout for Telegram's mobile viewport
- Touch-friendly buttons and interactions
- Compact card-based design
- Smooth scrolling and animations

### Telegram Integration
- Uses Telegram WebApp SDK
- Respects Telegram's theme colors
- Integrates with Telegram's UI paradigms
- Expandable to full screen

### Real-Time Updates
- Live status indicator
- Pull-to-refresh functionality
- Auto-refresh capability
- Visual loading states

## 🔗 Bot Commands

Users can interact with the bot using these commands:

| Command | Description |
|---------|-------------|
| `/start` | Start the bot and show welcome message |
| `/app` or `/miniapp` | Launch the Telegram Mini App |
| `/help` | Show all available commands |
| `/market` | Get current market overview |
| `/whale` | View latest whale transactions |
| `/alpha` | Get alpha feeds from KOLs |
| `/blockwars` | View Block Wars game stats |
| `/settings` | Configure notification preferences |
| `/connect` | Link Telegram to DeFiDash account |

## 📊 Data Flow

```
User Interaction
    ↓
Telegram Mini App (Client-Side)
    ↓
API Endpoints (/api/telegram/*)
    ↓
Database (PostgreSQL + Prisma)
    ↓
Data Response
    ↓
UI Update
```

## 🔐 Security

- Bot token stored securely in auth secrets
- User authentication via Telegram's initData
- HTTPS-only connections
- Rate limiting on API endpoints

## 🚦 Testing

### Local Testing

1. Use ngrok or similar tunneling service:
```bash
ngrok http 3000
```

2. Update webhook URL with ngrok URL:
```bash
curl -X POST https://your-ngrok-url.ngrok.io/api/telegram/setup \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://your-ngrok-url.ngrok.io/api/telegram/webhook"
  }'
```

3. Test the mini app:
   - Open Telegram
   - Send `/app` to your bot
   - Click the "Open Mini App" button

### Production Testing

1. Deploy your app to production
2. Configure webhook with production URL
3. Test all features:
   - Mini app launch
   - Market data display
   - Whale tracking
   - Trending tokens
   - Refresh functionality

## 📝 Customization

### Styling

The mini app uses Tailwind CSS with shadcn/ui components. Customize in:
- `/app/telegram-mini/page.tsx` - Main UI
- `/app/globals.css` - Global styles
- Telegram theme colors are automatically applied

### Features

Add new features by:
1. Creating new API endpoints in `/app/api/telegram/`
2. Adding UI components in the mini app page
3. Updating the tabs or creating new sections

## 🐛 Troubleshooting

### Mini App Not Loading
- Check if bot token is configured correctly
- Verify webhook is set up
- Ensure HTTPS is enabled on production

### Data Not Updating
- Check API endpoint responses
- Verify database connectivity
- Check browser console for errors

### Telegram WebApp SDK Issues
- Ensure script is loaded: `https://telegram.org/js/telegram-web-app.js`
- Check Telegram version (mini apps require recent versions)
- Test on both iOS and Android

## 📚 Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram WebApp Documentation](https://core.telegram.org/bots/webapps)
- [DeFiDash Tracker Main Docs](./TELEGRAM_INTEGRATION.md)

## 🎯 Future Enhancements

- [ ] User-specific portfolio tracking
- [ ] Price alerts configuration
- [ ] Block Wars game integration
- [ ] Social features (sharing, comments)
- [ ] Push notifications via Telegram
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Advanced charting

## 📞 Support

For issues or questions:
- Check the documentation
- Review console logs
- Test with `/help` command
- Verify bot setup with `/api/telegram/bot-setup`

---

**Bot Token:** `7683320014:AAH6Ri-KczlVWXXBe1ynz_LZTOkQjtZIUxw`  
**Mini App URL:** `https://defidashtracker.com/telegram-mini`  
**Webhook URL:** `https://defidashtracker.com/api/telegram/webhook`
