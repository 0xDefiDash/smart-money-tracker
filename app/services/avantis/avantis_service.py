
"""
Avantis Trading Service
Provides a REST API interface for the Avantis Python SDK
"""

import os
import asyncio
import logging
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# Import Avantis SDK components
try:
    from avantis_trader_sdk import TraderClient, FeedClient
    from avantis_trader_sdk.types import TradeInput
    import avantis_trader_sdk
except ImportError:
    print("Warning: avantis_trader_sdk not installed. Install with: pip install avantis-trader-sdk")
    # Mock classes for development
    class TraderClient:
        def __init__(self, provider_url): 
            self.provider_url = provider_url
    class FeedClient:
        def __init__(self, ws_url, **kwargs): 
            self.ws_url = ws_url
        def register_price_feed_callback(self, feed_id, callback): pass
        async def listen_for_price_updates(self): pass
    class TradeInput: pass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="Avantis Trading Service", version="1.0.0")

# Global clients
trader_client: Optional[TraderClient] = None
feed_client: Optional[FeedClient] = None

# Configuration
PROVIDER_URL = "https://mainnet.base.org"
WS_URL = "wss://hermes.pyth.network/ws"  # Pyth Network WebSocket for price feeds

# Price feed data storage
price_feeds: Dict[str, Any] = {}

class TradeRequest(BaseModel):
    """Request model for trade operations"""
    pair: str
    side: str  # "buy" or "sell"
    size: float
    leverage: Optional[float] = 1.0
    take_profit: Optional[float] = None
    stop_loss: Optional[float] = None

class PriceFeedRequest(BaseModel):
    """Request model for price feed subscription"""
    pair: str
    feed_id: Optional[str] = None

def ws_error_handler(e):
    """Handle WebSocket errors"""
    logger.error(f"WebSocket error: {e}")

def price_update_handler(pair: str):
    """Create price update handler for a specific pair"""
    def handler(data):
        logger.info(f"Price update for {pair}: {data}")
        price_feeds[pair] = data
    return handler

@app.on_event("startup")
async def startup_event():
    """Initialize the Avantis clients on startup"""
    global trader_client, feed_client
    
    try:
        # Initialize trader client
        trader_client = TraderClient(PROVIDER_URL)
        logger.info(f"TraderClient initialized with provider: {PROVIDER_URL}")
        
        # Initialize feed client
        feed_client = FeedClient(
            WS_URL, 
            on_error=ws_error_handler, 
            on_close=ws_error_handler
        )
        logger.info(f"FeedClient initialized with WebSocket: {WS_URL}")
        
        # Register some default price feeds
        default_feeds = {
            "ETH/USD": "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
            "BTC/USD": "0xe62df6c8b4c85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
        }
        
        for pair, feed_id in default_feeds.items():
            feed_client.register_price_feed_callback(feed_id, price_update_handler(pair))
            feed_client.register_price_feed_callback(pair, price_update_handler(pair))
        
        # Start listening for price updates in background
        asyncio.create_task(start_price_feeds())
        
    except Exception as e:
        logger.error(f"Error initializing clients: {e}")

async def start_price_feeds():
    """Start listening for price updates"""
    try:
        if feed_client:
            await feed_client.listen_for_price_updates()
    except Exception as e:
        logger.error(f"Error starting price feeds: {e}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Avantis Trading Service is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "trader_client": trader_client is not None,
        "feed_client": feed_client is not None,
        "provider_url": PROVIDER_URL
    }

@app.get("/price/{pair}")
async def get_price(pair: str):
    """Get current price for a trading pair"""
    if pair in price_feeds:
        return {"pair": pair, "data": price_feeds[pair]}
    else:
        raise HTTPException(status_code=404, detail=f"Price data not found for {pair}")

@app.get("/prices")
async def get_all_prices():
    """Get all current prices"""
    return {"prices": price_feeds}

@app.post("/subscribe")
async def subscribe_to_feed(request: PriceFeedRequest):
    """Subscribe to a price feed"""
    try:
        if not feed_client:
            raise HTTPException(status_code=503, detail="Feed client not initialized")
        
        if request.feed_id:
            feed_client.register_price_feed_callback(
                request.feed_id, 
                price_update_handler(request.pair)
            )
        
        feed_client.register_price_feed_callback(
            request.pair, 
            price_update_handler(request.pair)
        )
        
        return {"message": f"Subscribed to {request.pair}", "pair": request.pair}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error subscribing to feed: {str(e)}")

@app.post("/trade")
async def create_trade(request: TradeRequest):
    """Create a new trade (placeholder - implement actual trading logic)"""
    try:
        if not trader_client:
            raise HTTPException(status_code=503, detail="Trader client not initialized")
        
        # This is a placeholder - implement actual trading logic with TradeInput
        trade_data = {
            "pair": request.pair,
            "side": request.side,
            "size": request.size,
            "leverage": request.leverage,
            "take_profit": request.take_profit,
            "stop_loss": request.stop_loss,
            "status": "simulated"  # Remove this when implementing real trades
        }
        
        logger.info(f"Trade request: {trade_data}")
        
        # TODO: Implement actual trade execution using trader_client and TradeInput
        # trade_input = TradeInput(...)
        # result = await trader_client.execute_trade(trade_input)
        
        return {"message": "Trade simulated successfully", "trade": trade_data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating trade: {str(e)}")

@app.get("/pairs")
async def get_trading_pairs():
    """Get available trading pairs"""
    # This should be fetched from the actual Avantis platform
    pairs = [
        {"pair": "ETH/USD", "feed_id": "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"},
        {"pair": "BTC/USD", "feed_id": "0xe62df6c8b4c85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"},
        {"pair": "SOL/USD", "feed_id": "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"},
    ]
    return {"pairs": pairs}

if __name__ == "__main__":
    # Run the service
    uvicorn.run(
        "avantis_service:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
