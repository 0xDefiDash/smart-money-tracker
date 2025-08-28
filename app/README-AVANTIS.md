
# Avantis SDK Integration

The Smart Money Tracker now includes integration with the Avantis SDK for decentralized trading on the Base network.

## Architecture

Since the Avantis SDK is Python-based and our main app is Next.js (TypeScript), we use a bridge architecture:

```
Next.js App (Port 3000) ←→ Python Service (Port 8001) ←→ Avantis SDK ←→ Base Network
```

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd services/avantis
pip install -r requirements.txt
```

### 2. Start the Avantis Service

**Option A: Using the convenience script**
```bash
chmod +x scripts/start-avantis.sh
./scripts/start-avantis.sh
```

**Option B: Manual start**
```bash
cd services/avantis
python run_service.py
```

The service will start on `http://localhost:8001`

### 3. Start the Next.js App

In a separate terminal:
```bash
yarn dev
```

The main app will be available at `http://localhost:3000`

## Features

### 🎯 Trading Interface
- **Location**: `/trading` page
- **Features**:
  - Live price feeds from Pyth Network
  - Trading pair selection (ETH/USD, BTC/USD, SOL/USD)
  - Buy/Sell order placement
  - Leverage and risk management options
  - Real-time service status monitoring

### 📊 API Endpoints

The Next.js app communicates with the Python service through these API routes:

- `GET /api/avantis/health` - Service health check
- `GET /api/avantis/prices` - Get all current prices
- `GET /api/avantis/price/[pair]` - Get price for specific pair
- `GET /api/avantis/pairs` - Get available trading pairs
- `POST /api/avantis/trade` - Place a trade order
- `POST /api/avantis/subscribe` - Subscribe to price feeds

### 🔧 Python Service Endpoints

Direct Python service endpoints (for development):

- `GET http://localhost:8001/` - Health check
- `GET http://localhost:8001/docs` - Interactive API documentation
- `GET http://localhost:8001/prices` - All current prices
- `POST http://localhost:8001/trade` - Place trade
- `POST http://localhost:8001/subscribe` - Subscribe to price feed

## Configuration

### Environment Variables

Add to your `.env` file:
```
AVANTIS_SERVICE_URL=http://localhost:8001
```

### Python Service Configuration

Edit `services/avantis/avantis_service.py` to configure:
- Provider URL (currently set to Base Mainnet)
- WebSocket URL for price feeds
- Trading pairs and feed IDs

## Development Notes

### 🚨 Important
- The trading functionality is currently in **simulation mode**
- Real trading requires additional configuration and testing
- Always test on testnet before using mainnet

### Service Status
The trading interface shows the service status:
- **Online** (Green): Python service is running and responsive
- **Offline** (Red): Python service is not accessible

### Price Feeds
- Uses Pyth Network for real-time price data
- Automatic subscription to major pairs (ETH/USD, BTC/USD, SOL/USD)
- 5-second refresh interval for price updates

## Troubleshooting

### Service Won't Start
1. Check Python installation: `python3 --version`
2. Check pip installation: `pip3 --version`
3. Install dependencies: `pip install -r requirements.txt`
4. Check port availability: `lsof -i :8001`

### Connection Errors
1. Ensure the Python service is running on port 8001
2. Check firewall settings
3. Verify the `AVANTIS_SERVICE_URL` environment variable

### Missing Dependencies
```bash
pip install avantis-trader-sdk fastapi uvicorn python-dotenv pydantic websockets
```

## Next Steps

1. **Production Setup**: Configure for production deployment
2. **Real Trading**: Implement actual trade execution (currently simulated)
3. **Portfolio Management**: Add position tracking and management
4. **Risk Management**: Implement advanced risk controls
5. **Analytics**: Add trading performance analytics

## Support

For Avantis SDK specific issues, refer to the official Avantis documentation.
For integration issues, check the Python service logs and Next.js console.
