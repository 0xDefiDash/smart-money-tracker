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
exports.getSolanaTokenTransfers = exports.getSolanaTokenBalances = exports.getSolanaBalance = exports.getSolanaConnection = void 0;
var web3_js_1 = require("@solana/web3.js");
var price_service_1 = require("./price-service");
var HELIUS_API_KEY = process.env.HELIUS_API_KEY;
var HELIUS_RPC = HELIUS_API_KEY
    ? "https://mainnet.helius-rpc.com/?api-key=".concat(HELIUS_API_KEY)
    : 'https://api.mainnet-beta.solana.com';
// Get Solana connection
function getSolanaConnection() {
    return new web3_js_1.Connection(HELIUS_RPC, 'confirmed');
}
exports.getSolanaConnection = getSolanaConnection;
// Fetch SOL balance
function getSolanaBalance(address) {
    return __awaiter(this, void 0, void 0, function () {
        var connection, pubKey, lamports, sol, priceUSD, priceData, _a, usd, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    connection = getSolanaConnection();
                    pubKey = new web3_js_1.PublicKey(address);
                    return [4 /*yield*/, connection.getBalance(pubKey)];
                case 1:
                    lamports = _b.sent();
                    sol = lamports / web3_js_1.LAMPORTS_PER_SOL;
                    priceUSD = 0;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, price_service_1.getCryptoPrice)('SOL')];
                case 3:
                    priceData = _b.sent();
                    priceUSD = typeof priceData === 'object' && priceData && 'price' in priceData ? priceData.price : 0;
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    priceUSD = 0;
                    return [3 /*break*/, 5];
                case 5:
                    usd = sol * priceUSD;
                    return [2 /*return*/, {
                            sol: sol.toFixed(6),
                            usd: usd.toFixed(2),
                            lamports: lamports
                        }];
                case 6:
                    error_1 = _b.sent();
                    console.error('Error fetching Solana balance:', error_1);
                    throw new Error("Failed to fetch Solana balance: ".concat(error_1.message));
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.getSolanaBalance = getSolanaBalance;
// Fetch SPL token balances
function getSolanaTokenBalances(address) {
    return __awaiter(this, void 0, void 0, function () {
        var connection, pubKey, response, tokens, _i, _a, account, info, mint, balance, priceUSD, priceData, _b, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    connection = getSolanaConnection();
                    pubKey = new web3_js_1.PublicKey(address);
                    return [4 /*yield*/, connection.getParsedTokenAccountsByOwner(pubKey, {
                            programId: new web3_js_1.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
                        })];
                case 1:
                    response = _c.sent();
                    tokens = [];
                    _i = 0, _a = response.value;
                    _c.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    account = _a[_i];
                    info = account.account.data.parsed.info;
                    mint = info.mint;
                    balance = parseFloat(info.tokenAmount.uiAmountString || '0');
                    if (balance < 0.0001)
                        return [3 /*break*/, 7];
                    priceUSD = 0;
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, price_service_1.getCryptoPrice)(info.tokenAmount.symbol || '')];
                case 4:
                    priceData = _c.sent();
                    priceUSD = typeof priceData === 'object' && priceData && 'price' in priceData ? priceData.price : 0;
                    return [3 /*break*/, 6];
                case 5:
                    _b = _c.sent();
                    priceUSD = 0;
                    return [3 /*break*/, 6];
                case 6:
                    tokens.push({
                        address: mint,
                        symbol: 'Unknown',
                        name: 'Unknown Token',
                        balance: balance.toFixed(4),
                        decimals: info.tokenAmount.decimals,
                        price: priceUSD,
                        valueUSD: (balance * priceUSD).toFixed(2)
                    });
                    _c.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8: return [2 /*return*/, tokens];
                case 9:
                    error_2 = _c.sent();
                    console.error('Error fetching Solana token balances:', error_2);
                    throw new Error("Failed to fetch Solana token balances: ".concat(error_2.message));
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.getSolanaTokenBalances = getSolanaTokenBalances;
// Fetch Solana transactions
function getSolanaTokenTransfers(address, limit) {
    if (limit === void 0) { limit = 20; }
    return __awaiter(this, void 0, void 0, function () {
        var response, transactions, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!HELIUS_API_KEY) {
                        throw new Error('HELIUS_API_KEY not configured');
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("https://api.helius.xyz/v0/addresses/".concat(address, "/transactions?api-key=").concat(HELIUS_API_KEY, "&limit=").concat(limit, "&type=TOKEN_TRANSFER"))];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Helius API error: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    transactions = _a.sent();
                    return [2 /*return*/, transactions.map(function (tx) {
                            var _a, _b, _c;
                            return ({
                                hash: tx.signature,
                                timestamp: new Date(tx.timestamp * 1000).toISOString(),
                                blockTimestamp: new Date(tx.timestamp * 1000).toISOString(),
                                from: tx.feePayer,
                                to: ((_b = (_a = tx.accountData) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.account) || '',
                                value: '0',
                                tokenTransfers: ((_c = tx.tokenTransfers) === null || _c === void 0 ? void 0 : _c.map(function (transfer) {
                                    var _a, _b;
                                    return ({
                                        tokenAddress: transfer.mint,
                                        tokenSymbol: transfer.tokenSymbol || 'Unknown',
                                        contractAddress: transfer.mint,
                                        value: ((_a = transfer.tokenAmount) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
                                        valueFormatted: ((_b = transfer.tokenAmount) === null || _b === void 0 ? void 0 : _b.toString()) || '0',
                                        from: transfer.fromUserAccount,
                                        to: transfer.toUserAccount
                                    });
                                })) || []
                            });
                        })];
                case 4:
                    error_3 = _a.sent();
                    console.error('Error fetching Solana transactions:', error_3);
                    throw new Error("Failed to fetch Solana transactions: ".concat(error_3.message));
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getSolanaTokenTransfers = getSolanaTokenTransfers;
