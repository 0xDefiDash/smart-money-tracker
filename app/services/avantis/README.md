
# Avantis Trading Service

This service provides a REST API interface for the Avantis Python SDK, allowing the Next.js application to interact with Avantis trading functionality.

## Setup

1. Install Python dependencies:
```bash
cd services/avantis
python -m pip install -r requirements.txt
```

2. Run the service:
```bash
python run_service.py
```

The service will be available at `http://localhost:8001`

## API Documentation

Once running, visit `http://localhost:8001/docs` for interactive API documentation.

## Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status
- `GET /price/{pair}` - Get current price for a trading pair
- `GET /prices` - Get all current prices
- `GET /pairs` - Get available trading pairs
- `POST /subscribe` - Subscribe to a price feed
- `POST /trade` - Create a new trade

## Integration with Next.js

The Next.js application communicates with this service through API routes located in `/app/api/avantis/`.
