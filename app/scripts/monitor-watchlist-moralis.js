#!/usr/bin/env ts-node
"use strict";
/**
 * Watchlist Monitor Script - Using Moralis API
 *
 * This script monitors all watchlisted wallets using Moralis API
 * and sends alerts when transactions are detected.
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
var client_1 = require("@prisma/client");
var moralis_client_1 = require("../lib/moralis-client");
var prisma = new client_1.PrismaClient();
function monitorWatchlist() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var now, expiredUsers, deleted, watchlistItems, alertsCreated, results, _loop_1, _i, watchlistItems_1, item, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("[".concat(new Date().toISOString(), "] Starting watchlist monitoring with Moralis..."));
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 10, 11, 13]);
                    now = new Date();
                    return [4 /*yield*/, prisma.user.findMany({
                            where: {
                                isPremium: false,
                                trialEndsAt: { lte: now }
                            },
                            select: { id: true }
                        })];
                case 2:
                    expiredUsers = _c.sent();
                    if (!(expiredUsers.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.watchlistItem.deleteMany({
                            where: {
                                userId: { in: expiredUsers.map(function (u) { return u.id; }) }
                            }
                        })];
                case 3:
                    deleted = _c.sent();
                    console.log("Cleaned up ".concat(deleted.count, " watchlist items from ").concat(expiredUsers.length, " expired users"));
                    _c.label = 4;
                case 4: return [4 /*yield*/, prisma.watchlistItem.findMany({
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    telegramUsername: true,
                                    telegramChatId: true,
                                    isPremium: true,
                                    trialEndsAt: true
                                }
                            }
                        }
                    })];
                case 5:
                    watchlistItems = _c.sent();
                    console.log("Found ".concat(watchlistItems.length, " watchlist items to monitor"));
                    alertsCreated = 0;
                    results = [];
                    _loop_1 = function (item) {
                        var chainId, response, transactions, newTransactions, _d, newTransactions_1, tx, isSent, isReceived, type, value, error_2, error_3;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    _e.trys.push([0, 9, , 10]);
                                    // Skip Solana for now (Moralis is EVM-focused)
                                    if (item.chain === 'solana') {
                                        results.push({
                                            address: item.address,
                                            chain: item.chain,
                                            newTransactions: 0,
                                            error: 'Solana monitoring not supported with Moralis'
                                        });
                                        return [2 /*return*/, "continue"];
                                    }
                                    chainId = moralis_client_1.moralisClient.getChainId(item.chain);
                                    return [4 /*yield*/, moralis_client_1.moralisClient.getWalletTransactions(item.address, chainId, 10)];
                                case 1:
                                    response = _e.sent();
                                    transactions = response.raw.result || [];
                                    console.log("  Checking ".concat(item.address, " (").concat(item.chain, "): ").concat(transactions.length, " recent transactions"));
                                    newTransactions = transactions.filter(function (tx) {
                                        var txTime = new Date(tx.block_timestamp);
                                        return txTime > item.lastChecked;
                                    });
                                    console.log("    Found ".concat(newTransactions.length, " new transactions since ").concat(item.lastChecked.toISOString()));
                                    _d = 0, newTransactions_1 = newTransactions;
                                    _e.label = 2;
                                case 2:
                                    if (!(_d < newTransactions_1.length)) return [3 /*break*/, 7];
                                    tx = newTransactions_1[_d];
                                    isSent = ((_a = tx.from_address) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === item.address.toLowerCase();
                                    isReceived = ((_b = tx.to_address) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === item.address.toLowerCase();
                                    type = isSent ? 'sent' : isReceived ? 'received' : 'contract';
                                    value = moralis_client_1.moralisClient.formatWei(tx.value || '0', 18);
                                    _e.label = 3;
                                case 3:
                                    _e.trys.push([3, 5, , 6]);
                                    return [4 /*yield*/, prisma.transactionAlert.create({
                                            data: {
                                                userId: item.userId,
                                                walletAddress: item.address,
                                                transactionHash: tx.hash,
                                                chain: item.chain,
                                                type: type,
                                                fromAddress: tx.from_address,
                                                toAddress: tx.to_address,
                                                value: value,
                                                isRead: false
                                            }
                                        })];
                                case 4:
                                    _e.sent();
                                    alertsCreated++;
                                    console.log("    \u2713 Created alert for transaction ".concat(tx.hash.substring(0, 10), "..."));
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_2 = _e.sent();
                                    if (error_2.code === 'P2002') {
                                        console.log("    \u2298 Alert already exists for ".concat(tx.hash.substring(0, 10), "..."));
                                    }
                                    else {
                                        console.error("    \u2717 Failed to create alert: ".concat(error_2.message));
                                    }
                                    return [3 /*break*/, 6];
                                case 6:
                                    _d++;
                                    return [3 /*break*/, 2];
                                case 7: 
                                // Update lastChecked timestamp
                                return [4 /*yield*/, prisma.watchlistItem.update({
                                        where: { id: item.id },
                                        data: { lastChecked: new Date() }
                                    })];
                                case 8:
                                    // Update lastChecked timestamp
                                    _e.sent();
                                    results.push({
                                        address: item.address,
                                        chain: item.chain,
                                        newTransactions: newTransactions.length
                                    });
                                    return [3 /*break*/, 10];
                                case 9:
                                    error_3 = _e.sent();
                                    console.error("  \u2717 Error checking ".concat(item.address, " (").concat(item.chain, "):"), error_3.message);
                                    results.push({
                                        address: item.address,
                                        chain: item.chain,
                                        newTransactions: 0,
                                        error: error_3.message
                                    });
                                    return [3 /*break*/, 10];
                                case 10: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, watchlistItems_1 = watchlistItems;
                    _c.label = 6;
                case 6:
                    if (!(_i < watchlistItems_1.length)) return [3 /*break*/, 9];
                    item = watchlistItems_1[_i];
                    return [5 /*yield**/, _loop_1(item)];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9:
                    console.log("\n[".concat(new Date().toISOString(), "] Monitoring complete"));
                    console.log("  Wallets checked: ".concat(watchlistItems.length));
                    console.log("  Alerts created: ".concat(alertsCreated));
                    return [2 /*return*/, {
                            success: true,
                            walletsChecked: watchlistItems.length,
                            alertsCreated: alertsCreated,
                            results: results
                        }];
                case 10:
                    error_1 = _c.sent();
                    console.error("[".concat(new Date().toISOString(), "] Monitoring failed:"), error_1.message);
                    return [2 /*return*/, {
                            success: false,
                            error: error_1.message,
                            walletsChecked: 0,
                            alertsCreated: 0,
                            results: []
                        }];
                case 11: return [4 /*yield*/, prisma.$disconnect()];
                case 12:
                    _c.sent();
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// Execute monitoring
monitorWatchlist()
    .then(function (result) {
    console.log("\n[".concat(new Date().toISOString(), "] Monitoring task completed"));
    process.exit(result.success ? 0 : 1);
})
    .catch(function (error) {
    console.error("\n[".concat(new Date().toISOString(), "] Fatal error:"), error);
    process.exit(1);
});
