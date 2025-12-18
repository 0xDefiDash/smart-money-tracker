"use strict";
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
exports.moralisClient = exports.MoralisClient = void 0;
var moralis_1 = require("moralis");
var MoralisClient = /** @class */ (function () {
    function MoralisClient() {
        this.isInitialized = false;
    }
    MoralisClient.getInstance = function () {
        if (!MoralisClient.instance) {
            MoralisClient.instance = new MoralisClient();
        }
        return MoralisClient.instance;
    };
    MoralisClient.prototype.initialize = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.isInitialized) {
                            return [2 /*return*/];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, moralis_1.default.start({
                                apiKey: process.env.MORALIS_API_KEY || "F817rvYr65CreUWHQzIcjcE6fDbmZxnEjYENXmhxLjmLVq1y5wrTdTe7xtmRIl9M"
                            })];
                    case 2:
                        _c.sent();
                        this.isInitialized = true;
                        console.log('Moralis initialized successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _c.sent();
                        // If already initialized, ignore the error
                        if (((_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.message) === null || _a === void 0 ? void 0 : _a.includes('already started')) || ((_b = error_1 === null || error_1 === void 0 ? void 0 : error_1.message) === null || _b === void 0 ? void 0 : _b.includes('already been started'))) {
                            this.isInitialized = true;
                            console.log('Moralis was already initialized');
                            return [2 /*return*/];
                        }
                        console.error('Error initializing Moralis:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MoralisClient.prototype.getWalletTokenBalances = function (address, chain) {
        if (chain === void 0) { chain = '0x1'; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, moralis_1.default.EvmApi.wallets.getWalletTokenBalancesPrice({
                                chain: chain,
                                address: address
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MoralisClient.prototype.getWalletTransactions = function (address, chain, limit) {
        if (chain === void 0) { chain = '0x1'; }
        if (limit === void 0) { limit = 20; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, moralis_1.default.EvmApi.transaction.getWalletTransactions({
                                chain: chain,
                                address: address,
                                limit: limit
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MoralisClient.prototype.getNativeBalance = function (address, chain) {
        if (chain === void 0) { chain = '0x1'; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, moralis_1.default.EvmApi.balance.getNativeBalance({
                                chain: chain,
                                address: address
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MoralisClient.prototype.getWalletNFTs = function (address, chain, limit) {
        if (chain === void 0) { chain = '0x1'; }
        if (limit === void 0) { limit = 20; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, moralis_1.default.EvmApi.nft.getWalletNFTs({
                                chain: chain,
                                address: address,
                                limit: limit
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MoralisClient.prototype.getTokenPrice = function (address, chain) {
        if (chain === void 0) { chain = '0x1'; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, moralis_1.default.EvmApi.token.getTokenPrice({
                                chain: chain,
                                address: address
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MoralisClient.prototype.formatWei = function (value, decimals) {
        if (decimals === void 0) { decimals = 18; }
        try {
            // Manual calculation for Wei conversion
            var num = parseFloat(value) / Math.pow(10, decimals);
            return num.toFixed(6); // Return with 6 decimal places
        }
        catch (error) {
            console.error('Error formatting Wei:', error);
            return '0';
        }
    };
    MoralisClient.prototype.getChainInfo = function (chainId) {
        var chains = {
            '0x1': { name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io' },
            '0x38': { name: 'BSC', symbol: 'BNB', explorer: 'https://bscscan.com' },
            '0x89': { name: 'Polygon', symbol: 'MATIC', explorer: 'https://polygonscan.com' },
            '0xa86a': { name: 'Avalanche', symbol: 'AVAX', explorer: 'https://snowtrace.io' },
            '0xfa': { name: 'Fantom', symbol: 'FTM', explorer: 'https://ftmscan.com' },
            '0x2105': { name: 'Base', symbol: 'ETH', explorer: 'https://basescan.org' }
        };
        return chains[chainId] || { name: 'Unknown', symbol: 'ETH', explorer: 'https://etherscan.io' };
    };
    // Helper to convert common chain names to chain IDs
    MoralisClient.prototype.getChainId = function (chainName) {
        var chainMap = {
            'ethereum': '0x1',
            'eth': '0x1',
            'bsc': '0x38',
            'bnb': '0x38',
            'binance': '0x38',
            'polygon': '0x89',
            'matic': '0x89',
            'avalanche': '0xa86a',
            'avax': '0xa86a',
            'fantom': '0xfa',
            'ftm': '0xfa',
            'base': '0x2105',
            'basechain': '0x2105'
        };
        return chainMap[chainName.toLowerCase()] || '0x1';
    };
    return MoralisClient;
}());
exports.MoralisClient = MoralisClient;
// Export singleton instance
exports.moralisClient = MoralisClient.getInstance();
