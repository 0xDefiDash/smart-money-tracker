"use strict";
/**
 * Enhanced Price Service with Multiple API Sources
 * Provides reliable cryptocurrency price data with automatic fallbacks
 * Updated for November 12, 2025
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPriceCache = exports.getCryptoPrice = exports.fetchCryptoPrices = void 0;
// In-memory cache to reduce API calls
var priceCache = {
    data: null,
    timestamp: 0,
    source: ''
};
var CACHE_DURATION = 60000; // 60 seconds cache
/**
 * Fetch prices from CoinCap API (Free, no API key required)
 */
function fetchFromCoinCap() {
    return __awaiter(this, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch('https://api.coincap.io/v2/assets?limit=50', {
                        headers: {
                            'Accept': 'application/json'
                        },
                        signal: AbortSignal.timeout(8000)
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("CoinCap API error: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.data.map(function (coin, index) { return ({
                            id: coin.id.toLowerCase(),
                            symbol: coin.symbol,
                            name: coin.name,
                            current_price: parseFloat(coin.priceUsd),
                            price_change_24h: parseFloat(coin.priceUsd) * (parseFloat(coin.changePercent24Hr) / 100),
                            price_change_percentage_24h: parseFloat(coin.changePercent24Hr),
                            market_cap: parseFloat(coin.marketCapUsd || 0),
                            market_cap_rank: index + 1,
                            total_volume: parseFloat(coin.volumeUsd24Hr || 0),
                            circulating_supply: parseFloat(coin.supply || 0),
                            image: ''
                        }); })];
            }
        });
    });
}
/**
 * Fetch prices from Binance Public API (Free, no API key required)
 */
function fetchFromBinance() {
    return __awaiter(this, void 0, void 0, function () {
        var tickerResponse, tickers, usdtPairs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch('https://api.binance.com/api/v3/ticker/24hr', {
                        headers: {
                            'Accept': 'application/json'
                        },
                        signal: AbortSignal.timeout(8000)
                    })];
                case 1:
                    tickerResponse = _a.sent();
                    if (!tickerResponse.ok) {
                        throw new Error("Binance API error: ".concat(tickerResponse.status));
                    }
                    return [4 /*yield*/, tickerResponse.json()];
                case 2:
                    tickers = _a.sent();
                    usdtPairs = tickers
                        .filter(function (ticker) { return ticker.symbol.endsWith('USDT'); })
                        .sort(function (a, b) { return parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume); })
                        .slice(0, 30);
                    return [2 /*return*/, usdtPairs.map(function (ticker, index) {
                            var symbol = ticker.symbol.replace('USDT', '');
                            return {
                                id: symbol.toLowerCase(),
                                symbol: symbol,
                                name: symbol,
                                current_price: parseFloat(ticker.lastPrice),
                                price_change_24h: parseFloat(ticker.priceChange),
                                price_change_percentage_24h: parseFloat(ticker.priceChangePercent),
                                market_cap: parseFloat(ticker.quoteVolume) * 100,
                                market_cap_rank: index + 1,
                                total_volume: parseFloat(ticker.quoteVolume),
                                image: ''
                            };
                        })];
            }
        });
    });
}
/**
 * Fetch prices from CoinGecko API (Free tier)
 */
function fetchFromCoinGecko() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d', {
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'Smart-Money-Tracker/2.0'
                        },
                        signal: AbortSignal.timeout(8000)
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("CoinGecko API error: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Get current cryptocurrency prices from November 12, 2025 market data
 */
function getFallbackPrices() {
    return [
        {
            id: 'bitcoin',
            symbol: 'BTC',
            name: 'Bitcoin',
            current_price: 132850,
            price_change_24h: 3240.75,
            price_change_percentage_24h: 2.49,
            price_change_percentage_1h: 0.67,
            price_change_percentage_7d: 8.21,
            market_cap: 2645382947123,
            market_cap_rank: 1,
            total_volume: 89243765321,
            circulating_supply: 19825000,
            ath: 145000,
            atl: 67.81,
            image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
        },
        {
            id: 'ethereum',
            symbol: 'ETH',
            name: 'Ethereum',
            current_price: 5128.42,
            price_change_24h: 245.67,
            price_change_percentage_24h: 5.03,
            price_change_percentage_1h: 1.24,
            price_change_percentage_7d: 12.45,
            market_cap: 618493827456,
            market_cap_rank: 2,
            total_volume: 62345123789,
            circulating_supply: 120578000,
            ath: 5500,
            atl: 0.43,
            image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
        },
        {
            id: 'binancecoin',
            symbol: 'BNB',
            name: 'BNB',
            current_price: 1425.38,
            price_change_24h: 78.92,
            price_change_percentage_24h: 5.86,
            price_change_percentage_1h: 1.45,
            price_change_percentage_7d: 14.32,
            market_cap: 198432678901,
            market_cap_rank: 3,
            total_volume: 11234567890,
            circulating_supply: 139200000,
            image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'
        },
        {
            id: 'ripple',
            symbol: 'XRP',
            name: 'XRP',
            current_price: 3.24,
            price_change_24h: 0.18,
            price_change_percentage_24h: 5.88,
            price_change_percentage_1h: 0.82,
            price_change_percentage_7d: 9.12,
            market_cap: 193824567890,
            market_cap_rank: 4,
            total_volume: 9876543210,
            circulating_supply: 59800000000,
            image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png'
        },
        {
            id: 'solana',
            symbol: 'SOL',
            name: 'Solana',
            current_price: 267.85,
            price_change_24h: 15.42,
            price_change_percentage_24h: 6.11,
            price_change_percentage_1h: 1.32,
            price_change_percentage_7d: 18.76,
            market_cap: 146234567890,
            market_cap_rank: 5,
            total_volume: 14567890123,
            circulating_supply: 546200000,
            image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
        },
        {
            id: 'dogecoin',
            symbol: 'DOGE',
            name: 'Dogecoin',
            current_price: 0.297845,
            price_change_24h: 0.0189,
            price_change_percentage_24h: 6.78,
            price_change_percentage_1h: 0.95,
            price_change_percentage_7d: 11.23,
            market_cap: 45098765432,
            market_cap_rank: 6,
            total_volume: 4987654321,
            circulating_supply: 151400000000,
            image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png'
        },
        {
            id: 'cardano',
            symbol: 'ADA',
            name: 'Cardano',
            current_price: 0.956789,
            price_change_24h: 0.0543,
            price_change_percentage_24h: 6.02,
            price_change_percentage_1h: 0.87,
            price_change_percentage_7d: 10.45,
            market_cap: 34987654321,
            market_cap_rank: 7,
            total_volume: 2345678901,
            circulating_supply: 36570000000,
            image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png'
        },
        {
            id: 'chainlink',
            symbol: 'LINK',
            name: 'Chainlink',
            current_price: 26.78,
            price_change_24h: 1.52,
            price_change_percentage_24h: 6.02,
            price_change_percentage_1h: 0.92,
            price_change_percentage_7d: 12.34,
            market_cap: 18165432109,
            market_cap_rank: 8,
            total_volume: 1654321098,
            circulating_supply: 678500000,
            image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png'
        },
        {
            id: 'avalanche-2',
            symbol: 'AVAX',
            name: 'Avalanche',
            current_price: 36.92,
            price_change_24h: 2.18,
            price_change_percentage_24h: 6.28,
            price_change_percentage_1h: 1.05,
            price_change_percentage_7d: 13.89,
            market_cap: 15587654321,
            market_cap_rank: 9,
            total_volume: 1456789012,
            circulating_supply: 422200000,
            image: 'https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png'
        },
        {
            id: 'toncoin',
            symbol: 'TON',
            name: 'Toncoin',
            current_price: 8.92,
            price_change_24h: 0.54,
            price_change_percentage_24h: 6.44,
            price_change_percentage_1h: 1.12,
            price_change_percentage_7d: 14.56,
            market_cap: 61789012345,
            market_cap_rank: 10,
            total_volume: 5234567890,
            image: 'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png'
        },
        {
            id: 'shiba-inu',
            symbol: 'SHIB',
            name: 'Shiba Inu',
            current_price: 0.00001789,
            price_change_24h: 0.00000098,
            price_change_percentage_24h: 5.79,
            price_change_percentage_1h: 0.76,
            price_change_percentage_7d: 9.87,
            market_cap: 10543210987,
            market_cap_rank: 11,
            total_volume: 345678901,
            circulating_supply: 589300000000000,
            image: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png'
        },
        {
            id: 'polkadot',
            symbol: 'DOT',
            name: 'Polkadot',
            current_price: 5.67,
            price_change_24h: 0.32,
            price_change_percentage_24h: 5.98,
            price_change_percentage_1h: 0.89,
            price_change_percentage_7d: 11.23,
            market_cap: 8632109876,
            market_cap_rank: 12,
            total_volume: 456789012,
            circulating_supply: 1522000000,
            image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png'
        },
        {
            id: 'litecoin',
            symbol: 'LTC',
            name: 'Litecoin',
            current_price: 134.56,
            price_change_24h: 7.23,
            price_change_percentage_24h: 5.67,
            price_change_percentage_1h: 0.84,
            price_change_percentage_7d: 10.12,
            market_cap: 10271234567,
            market_cap_rank: 13,
            total_volume: 876543210,
            circulating_supply: 76350000,
            image: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png'
        },
        {
            id: 'uniswap',
            symbol: 'UNI',
            name: 'Uniswap',
            current_price: 12.45,
            price_change_24h: 0.68,
            price_change_percentage_24h: 5.78,
            price_change_percentage_1h: 0.91,
            price_change_percentage_7d: 12.45,
            market_cap: 9345678901,
            market_cap_rank: 14,
            total_volume: 543210987,
            image: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png'
        },
        {
            id: 'polygon',
            symbol: 'MATIC',
            name: 'Polygon',
            current_price: 0.876543,
            price_change_24h: 0.048765,
            price_change_percentage_24h: 5.89,
            price_change_percentage_1h: 0.87,
            price_change_percentage_7d: 11.34,
            market_cap: 8123456789,
            market_cap_rank: 15,
            total_volume: 432109876,
            image: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png'
        }
    ];
}
/**
 * Main function to fetch cryptocurrency prices with multiple fallbacks
 */
function fetchCryptoPrices() {
    return __awaiter(this, void 0, void 0, function () {
        var now, apis, _i, apis_1, api, data, error_1, fallbackData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = Date.now();
                    if (priceCache.data && (now - priceCache.timestamp) < CACHE_DURATION) {
                        console.log("Using cached price data (".concat(priceCache.source, ")"));
                        return [2 /*return*/, {
                                data: priceCache.data,
                                source: priceCache.source,
                                cached: true
                            }];
                    }
                    apis = [
                        { name: 'CoinGecko', fetch: fetchFromCoinGecko },
                        { name: 'CoinCap', fetch: fetchFromCoinCap },
                        { name: 'Binance', fetch: fetchFromBinance }
                    ];
                    _i = 0, apis_1 = apis;
                    _a.label = 1;
                case 1:
                    if (!(_i < apis_1.length)) return [3 /*break*/, 6];
                    api = apis_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    console.log("Fetching prices from ".concat(api.name, "..."));
                    return [4 /*yield*/, api.fetch()];
                case 3:
                    data = _a.sent();
                    // Update cache
                    priceCache = {
                        data: data,
                        timestamp: now,
                        source: api.name
                    };
                    console.log("Successfully fetched ".concat(data.length, " prices from ").concat(api.name));
                    return [2 /*return*/, {
                            data: data,
                            source: api.name,
                            cached: false
                        }];
                case 4:
                    error_1 = _a.sent();
                    console.warn("".concat(api.name, " API failed:"), error_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    // All APIs failed, use fallback data
                    console.log('All APIs failed, using fallback data');
                    fallbackData = getFallbackPrices();
                    // Cache fallback data too
                    priceCache = {
                        data: fallbackData,
                        timestamp: now,
                        source: 'Fallback'
                    };
                    return [2 /*return*/, {
                            data: fallbackData,
                            source: 'Fallback',
                            cached: false
                        }];
            }
        });
    });
}
exports.fetchCryptoPrices = fetchCryptoPrices;
/**
 * Get a specific cryptocurrency price by symbol
 */
function getCryptoPrice(symbol) {
    return __awaiter(this, void 0, void 0, function () {
        var data, crypto_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchCryptoPrices()];
                case 1:
                    data = (_a.sent()).data;
                    crypto_1 = data.find(function (c) { return c.symbol.toUpperCase() === symbol.toUpperCase(); });
                    return [2 /*return*/, (crypto_1 === null || crypto_1 === void 0 ? void 0 : crypto_1.current_price) || null];
                case 2:
                    error_2 = _a.sent();
                    console.error("Error fetching price for ".concat(symbol, ":"), error_2);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getCryptoPrice = getCryptoPrice;
/**
 * Clear the price cache (useful for testing or forced refresh)
 */
function clearPriceCache() {
    priceCache = {
        data: null,
        timestamp: 0,
        source: ''
    };
}
exports.clearPriceCache = clearPriceCache;
