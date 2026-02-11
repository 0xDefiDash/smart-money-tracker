#!/usr/bin/env ts-node
"use strict";
/**
 * Direct Watchlist Monitor Script
 * Runs the monitoring logic directly without requiring the HTTP server
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
var prisma = new client_1.PrismaClient();
// Import the monitoring functions
function getWalletTransactions(address, chain, limit) {
    if (limit === void 0) { limit = 10; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // This is a placeholder - in production this would call Alchemy/Moralis/Etherscan
            console.log("  Fetching transactions for ".concat(address, " on ").concat(chain, "..."));
            return [2 /*return*/, []];
        });
    });
}
function getSolanaTokenTransfers(address) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // This is a placeholder - in production this would call Helius
            console.log("  Fetching Solana transactions for ".concat(address, "..."));
            return [2 /*return*/, []];
        });
    });
}
function notifyWalletTransaction(data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // This is a placeholder - in production this would send Telegram notification
            console.log("  Would send Telegram notification to ".concat(data.username));
            return [2 /*return*/];
        });
    });
}
function monitorWatchlist() {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var startTime, now, expiredUsers, deleted, watchlistItems, alertsCreated, results, _loop_1, _i, watchlistItems_1, item, endTime, duration, error_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    startTime = new Date();
                    console.log("[".concat(startTime.toISOString(), "] Starting watchlist monitoring..."));
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 10, 11, 13]);
                    now = new Date();
                    return [4 /*yield*/, prisma.user.findMany({
                            where: {
                                isPremium: false,
                                trialEndsAt: { lte: now }
                            },
                            select: { id: true }
                        })];
                case 2:
                    expiredUsers = _e.sent();
                    if (!(expiredUsers.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.watchlistItem.deleteMany({
                            where: {
                                userId: { in: expiredUsers.map(function (u) { return u.id; }) }
                            }
                        })];
                case 3:
                    deleted = _e.sent();
                    console.log("Cleaned up ".concat(deleted.count, " watchlist items from ").concat(expiredUsers.length, " expired users"));
                    _e.label = 4;
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
                    watchlistItems = _e.sent();
                    console.log("Found ".concat(watchlistItems.length, " watchlist items to check"));
                    alertsCreated = 0;
                    results = [];
                    _loop_1 = function (item) {
                        var transactions, newTransactions, _f, _g, tx, hasTokenTransfer, isSent, isReceived, type, tokenTransfer, transfer, alert_1, error_2, error_3;
                        return __generator(this, function (_h) {
                            switch (_h.label) {
                                case 0:
                                    _h.trys.push([0, 14, , 15]);
                                    console.log("\nChecking: ".concat(item.address, " (").concat(item.chain, ")"));
                                    transactions = [];
                                    if (!(item.chain === 'solana')) return [3 /*break*/, 2];
                                    return [4 /*yield*/, getSolanaTokenTransfers(item.address)];
                                case 1:
                                    transactions = _h.sent();
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, getWalletTransactions(item.address, item.chain, 10)];
                                case 3:
                                    transactions = _h.sent();
                                    _h.label = 4;
                                case 4:
                                    newTransactions = transactions.filter(function (tx) {
                                        var txTime = new Date(tx.timestamp || tx.blockTimestamp);
                                        return txTime > item.lastChecked;
                                    });
                                    console.log("  Found ".concat(newTransactions.length, " new transactions"));
                                    _f = 0, _g = newTransactions;
                                    _h.label = 5;
                                case 5:
                                    if (!(_f < _g.length)) return [3 /*break*/, 12];
                                    tx = _g[_f];
                                    // If token-specific monitoring, filter by token
                                    if (item.tokenAddress) {
                                        hasTokenTransfer = (_a = tx.tokenTransfers) === null || _a === void 0 ? void 0 : _a.some(function (transfer) {
                                            var _a, _b, _c, _d, _e, _f, _g;
                                            return ((_b = (_a = transfer.rawContract) === null || _a === void 0 ? void 0 : _a.address) === null || _b === void 0 ? void 0 : _b.toLowerCase()) ===
                                                ((_c = item.tokenAddress) === null || _c === void 0 ? void 0 : _c.toLowerCase()) ||
                                                ((_d = transfer.contractAddress) === null || _d === void 0 ? void 0 : _d.toLowerCase()) ===
                                                    ((_e = item.tokenAddress) === null || _e === void 0 ? void 0 : _e.toLowerCase()) ||
                                                ((_f = transfer.tokenAddress) === null || _f === void 0 ? void 0 : _f.toLowerCase()) ===
                                                    ((_g = item.tokenAddress) === null || _g === void 0 ? void 0 : _g.toLowerCase());
                                        });
                                        if (!hasTokenTransfer)
                                            return [3 /*break*/, 11];
                                    }
                                    isSent = ((_b = tx.from) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === item.address.toLowerCase();
                                    isReceived = ((_c = tx.to) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === item.address.toLowerCase();
                                    type = isSent ? 'sent' : isReceived ? 'received' : 'contract';
                                    tokenTransfer = null;
                                    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
                                        transfer = tx.tokenTransfers[0];
                                        tokenTransfer = {
                                            address: ((_d = transfer.rawContract) === null || _d === void 0 ? void 0 : _d.address) || transfer.contractAddress || transfer.tokenAddress,
                                            symbol: transfer.asset || transfer.tokenSymbol,
                                            amount: transfer.valueFormatted || transfer.value
                                        };
                                    }
                                    _h.label = 6;
                                case 6:
                                    _h.trys.push([6, 10, , 11]);
                                    return [4 /*yield*/, prisma.transactionAlert.create({
                                            data: {
                                                userId: item.user.id,
                                                walletAddress: item.address,
                                                chain: item.chain,
                                                transactionHash: tx.hash,
                                                fromAddress: tx.from,
                                                toAddress: tx.to,
                                                value: tx.value,
                                                tokenAddress: tokenTransfer === null || tokenTransfer === void 0 ? void 0 : tokenTransfer.address,
                                                tokenSymbol: tokenTransfer === null || tokenTransfer === void 0 ? void 0 : tokenTransfer.symbol,
                                                tokenAmount: tokenTransfer === null || tokenTransfer === void 0 ? void 0 : tokenTransfer.amount,
                                                type: type
                                            }
                                        })];
                                case 7:
                                    alert_1 = _h.sent();
                                    alertsCreated++;
                                    console.log("  \u2713 Created alert for transaction ".concat(tx.hash));
                                    if (!item.user.telegramUsername) return [3 /*break*/, 9];
                                    return [4 /*yield*/, notifyWalletTransaction({
                                            username: item.user.telegramUsername,
                                            walletAddress: item.address,
                                            chain: item.chain,
                                            transactionHash: tx.hash,
                                            type: type,
                                            value: tx.value,
                                            tokenSymbol: tokenTransfer === null || tokenTransfer === void 0 ? void 0 : tokenTransfer.symbol,
                                            tokenAmount: tokenTransfer === null || tokenTransfer === void 0 ? void 0 : tokenTransfer.amount
                                        })];
                                case 8:
                                    _h.sent();
                                    _h.label = 9;
                                case 9: return [3 /*break*/, 11];
                                case 10:
                                    error_2 = _h.sent();
                                    // Skip if duplicate alert (same tx hash for same user)
                                    if (error_2.code === 'P2002') {
                                        console.log("  \u2298 Skipped duplicate alert for ".concat(tx.hash));
                                        return [3 /*break*/, 11];
                                    }
                                    throw error_2;
                                case 11:
                                    _f++;
                                    return [3 /*break*/, 5];
                                case 12: 
                                // Update lastChecked timestamp
                                return [4 /*yield*/, prisma.watchlistItem.update({
                                        where: { id: item.id },
                                        data: { lastChecked: new Date() }
                                    })];
                                case 13:
                                    // Update lastChecked timestamp
                                    _h.sent();
                                    results.push({
                                        address: item.address,
                                        chain: item.chain,
                                        newTransactions: newTransactions.length,
                                        success: true
                                    });
                                    return [3 /*break*/, 15];
                                case 14:
                                    error_3 = _h.sent();
                                    console.error("  \u274C Error checking watchlist item ".concat(item.id, ":"), error_3.message);
                                    results.push({
                                        address: item.address,
                                        chain: item.chain,
                                        error: error_3.message,
                                        success: false
                                    });
                                    return [3 /*break*/, 15];
                                case 15: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, watchlistItems_1 = watchlistItems;
                    _e.label = 6;
                case 6:
                    if (!(_i < watchlistItems_1.length)) return [3 /*break*/, 9];
                    item = watchlistItems_1[_i];
                    return [5 /*yield**/, _loop_1(item)];
                case 7:
                    _e.sent();
                    _e.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9:
                    endTime = new Date();
                    duration = (endTime.getTime() - startTime.getTime()) / 1000;
                    console.log("\n[".concat(endTime.toISOString(), "] Monitoring complete"));
                    console.log("Duration: ".concat(duration, "s"));
                    console.log("Wallets checked: ".concat(watchlistItems.length));
                    console.log("Alerts created: ".concat(alertsCreated));
                    return [2 /*return*/, {
                            success: true,
                            walletsChecked: watchlistItems.length,
                            alertsCreated: alertsCreated,
                            results: results,
                            duration: duration,
                            timestamp: endTime.toISOString()
                        }];
                case 10:
                    error_1 = _e.sent();
                    console.error("[".concat(new Date().toISOString(), "] Monitoring failed:"), error_1.message);
                    return [2 /*return*/, {
                            success: false,
                            error: error_1.message,
                            timestamp: new Date().toISOString()
                        }];
                case 11: return [4 /*yield*/, prisma.$disconnect()];
                case 12:
                    _e.sent();
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// Execute monitoring
monitorWatchlist()
    .then(function (result) {
    console.log("\n=== Monitoring Result ===");
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
})
    .catch(function (error) {
    console.error("\n=== Fatal Error ===");
    console.error(error);
    process.exit(1);
});
