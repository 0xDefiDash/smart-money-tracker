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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletTransactions = exports.getTokenBalances = exports.getWalletBalance = exports.getAlchemy = exports.CHAIN_CONFIGS = void 0;
var alchemy_sdk_1 = require("alchemy-sdk");
var price_service_1 = require("./price-service");
// Chain configurations
exports.CHAIN_CONFIGS = {
    ethereum: {
        network: alchemy_sdk_1.Network.ETH_MAINNET,
        nativeCurrency: 'ETH',
        explorer: 'https://etherscan.io'
    },
    bnb: {
        network: alchemy_sdk_1.Network.BNB_MAINNET,
        nativeCurrency: 'BNB',
        explorer: 'https://bscscan.com'
    },
    polygon: {
        network: alchemy_sdk_1.Network.MATIC_MAINNET,
        nativeCurrency: 'MATIC',
        explorer: 'https://polygonscan.com'
    },
    base: {
        network: alchemy_sdk_1.Network.BASE_MAINNET,
        nativeCurrency: 'ETH',
        explorer: 'https://basescan.org'
    },
    optimism: {
        network: alchemy_sdk_1.Network.OPT_MAINNET,
        nativeCurrency: 'ETH',
        explorer: 'https://optimistic.etherscan.io'
    },
    arbitrum: {
        network: alchemy_sdk_1.Network.ARB_MAINNET,
        nativeCurrency: 'ETH',
        explorer: 'https://arbiscan.io'
    }
};
// Get Alchemy instance for specific chain
function getAlchemy(chain) {
    if (chain === void 0) { chain = 'ethereum'; }
    var config = exports.CHAIN_CONFIGS[chain];
    if (!config) {
        throw new Error("Unsupported chain: ".concat(chain));
    }
    var apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
        throw new Error('ALCHEMY_API_KEY not configured');
    }
    return new alchemy_sdk_1.Alchemy({
        apiKey: apiKey,
        network: config.network
    });
}
exports.getAlchemy = getAlchemy;
// Fetch wallet balance
function getWalletBalance(address, chain) {
    if (chain === void 0) { chain = 'ethereum'; }
    return __awaiter(this, void 0, void 0, function () {
        var alchemy, config, balance, balanceInEther, priceUSD, priceData, _a, balanceUSD, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    alchemy = getAlchemy(chain);
                    config = exports.CHAIN_CONFIGS[chain];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, alchemy.core.getBalance(address, 'latest')];
                case 2:
                    balance = _b.sent();
                    balanceInEther = parseFloat(balance.toString()) / 1e18;
                    priceUSD = 0;
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, price_service_1.getCryptoPrice)(config.nativeCurrency)];
                case 4:
                    priceData = _b.sent();
                    priceUSD = priceData || 0;
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    priceUSD = 0;
                    return [3 /*break*/, 6];
                case 6:
                    balanceUSD = balanceInEther * priceUSD;
                    return [2 /*return*/, {
                            address: address,
                            chain: chain,
                            balance: balanceInEther.toFixed(8),
                            balanceUSD: balanceUSD.toFixed(2),
                            currency: config.nativeCurrency
                        }];
                case 7:
                    error_1 = _b.sent();
                    console.error("Error fetching balance for ".concat(chain, ":"), error_1);
                    throw new Error("Failed to fetch balance: ".concat(error_1.message));
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.getWalletBalance = getWalletBalance;
// Fetch token balances
function getTokenBalances(address, chain) {
    if (chain === void 0) { chain = 'ethereum'; }
    return __awaiter(this, void 0, void 0, function () {
        var alchemy, balances, tokens, _i, _a, token, metadata, balance, decimals, formattedBalance, priceUSD, priceData, _b, error_2, error_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    alchemy = getAlchemy(chain);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 13, , 14]);
                    return [4 /*yield*/, alchemy.core.getTokenBalances(address)];
                case 2:
                    balances = _c.sent();
                    tokens = [];
                    _i = 0, _a = balances.tokenBalances;
                    _c.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 12];
                    token = _a[_i];
                    if (token.tokenBalance === '0x0')
                        return [3 /*break*/, 11];
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 10, , 11]);
                    return [4 /*yield*/, alchemy.core.getTokenMetadata(token.contractAddress)];
                case 5:
                    metadata = _c.sent();
                    balance = parseInt(token.tokenBalance || '0', 16);
                    decimals = metadata.decimals || 18;
                    formattedBalance = balance / Math.pow(10, decimals);
                    // Skip if balance is essentially zero
                    if (formattedBalance < 0.0001)
                        return [3 /*break*/, 11];
                    priceUSD = 0;
                    _c.label = 6;
                case 6:
                    _c.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, (0, price_service_1.getCryptoPrice)(metadata.symbol || '')];
                case 7:
                    priceData = _c.sent();
                    priceUSD = priceData || 0;
                    return [3 /*break*/, 9];
                case 8:
                    _b = _c.sent();
                    priceUSD = 0;
                    return [3 /*break*/, 9];
                case 9:
                    tokens.push({
                        address: token.contractAddress,
                        symbol: metadata.symbol || 'Unknown',
                        name: metadata.name || 'Unknown Token',
                        balance: formattedBalance.toFixed(4),
                        decimals: decimals,
                        price: priceUSD,
                        valueUSD: (formattedBalance * priceUSD).toFixed(2)
                    });
                    return [3 /*break*/, 11];
                case 10:
                    error_2 = _c.sent();
                    console.error("Error processing token ".concat(token.contractAddress, ":"), error_2);
                    return [3 /*break*/, 11];
                case 11:
                    _i++;
                    return [3 /*break*/, 3];
                case 12: return [2 /*return*/, tokens];
                case 13:
                    error_3 = _c.sent();
                    console.error("Error fetching token balances for ".concat(chain, ":"), error_3);
                    throw new Error("Failed to fetch token balances: ".concat(error_3.message));
                case 14: return [2 /*return*/];
            }
        });
    });
}
exports.getTokenBalances = getTokenBalances;
// Fetch transaction history
function getWalletTransactions(address, chain, limit) {
    if (chain === void 0) { chain = 'ethereum'; }
    if (limit === void 0) { limit = 20; }
    return __awaiter(this, void 0, void 0, function () {
        var alchemy, transfers, receivedTransfers, allTransfers, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    alchemy = getAlchemy(chain);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, alchemy.core.getAssetTransfers({
                            fromAddress: address,
                            category: [
                                alchemy_sdk_1.AssetTransfersCategory.EXTERNAL,
                                alchemy_sdk_1.AssetTransfersCategory.INTERNAL,
                                alchemy_sdk_1.AssetTransfersCategory.ERC20,
                                alchemy_sdk_1.AssetTransfersCategory.ERC721,
                                alchemy_sdk_1.AssetTransfersCategory.ERC1155
                            ],
                            maxCount: limit,
                            order: alchemy_sdk_1.SortingOrder.DESCENDING
                        })];
                case 2:
                    transfers = _a.sent();
                    return [4 /*yield*/, alchemy.core.getAssetTransfers({
                            toAddress: address,
                            category: [
                                alchemy_sdk_1.AssetTransfersCategory.EXTERNAL,
                                alchemy_sdk_1.AssetTransfersCategory.INTERNAL,
                                alchemy_sdk_1.AssetTransfersCategory.ERC20,
                                alchemy_sdk_1.AssetTransfersCategory.ERC721,
                                alchemy_sdk_1.AssetTransfersCategory.ERC1155
                            ],
                            maxCount: limit,
                            order: alchemy_sdk_1.SortingOrder.DESCENDING
                        })];
                case 3:
                    receivedTransfers = _a.sent();
                    allTransfers = __spreadArray(__spreadArray([], transfers.transfers, true), receivedTransfers.transfers, true).sort(function (a, b) {
                        var _a, _b;
                        var timeA = new Date(((_a = a.metadata) === null || _a === void 0 ? void 0 : _a.blockTimestamp) || 0).getTime();
                        var timeB = new Date(((_b = b.metadata) === null || _b === void 0 ? void 0 : _b.blockTimestamp) || 0).getTime();
                        return timeB - timeA;
                    })
                        .slice(0, limit);
                    return [2 /*return*/, allTransfers.map(function (tx) {
                            var _a, _b, _c, _d, _e, _f;
                            return ({
                                hash: tx.hash,
                                from: tx.from,
                                to: tx.to,
                                value: ((_a = tx.value) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
                                timestamp: ((_b = tx.metadata) === null || _b === void 0 ? void 0 : _b.blockTimestamp) || new Date().toISOString(),
                                blockNumber: tx.blockNum,
                                blockTimestamp: ((_c = tx.metadata) === null || _c === void 0 ? void 0 : _c.blockTimestamp) || new Date().toISOString(),
                                tokenTransfers: tx.asset ? [{
                                        asset: tx.asset,
                                        value: tx.value,
                                        valueFormatted: ((_d = tx.value) === null || _d === void 0 ? void 0 : _d.toString()) || '0',
                                        rawContract: tx.rawContract,
                                        contractAddress: (_e = tx.rawContract) === null || _e === void 0 ? void 0 : _e.address,
                                        tokenSymbol: tx.asset,
                                        decimals: ((_f = tx.rawContract) === null || _f === void 0 ? void 0 : _f.decimal) || 18
                                    }] : []
                            });
                        })];
                case 4:
                    error_4 = _a.sent();
                    console.error("Error fetching transactions for ".concat(chain, ":"), error_4);
                    throw new Error("Failed to fetch transactions: ".concat(error_4.message));
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getWalletTransactions = getWalletTransactions;
