#!/usr/bin/env ts-node
"use strict";
/**
 * Direct Watchlist Monitor
 * Queries the database directly to generate monitoring report
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
function monitorWatchlist() {
    return __awaiter(this, void 0, void 0, function () {
        var timestamp, watchlistItems, oneDayAgo, recentAlerts, alertsByWallet_1, _i, recentAlerts_1, alert_1, key, results, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    timestamp = new Date().toISOString();
                    console.log("[".concat(timestamp, "] Starting direct watchlist monitoring..."));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 7]);
                    return [4 /*yield*/, prisma.watchlistItem.findMany({
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                    }
                                }
                            }
                        })];
                case 2:
                    watchlistItems = _a.sent();
                    console.log("Found ".concat(watchlistItems.length, " watchlist items"));
                    oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    return [4 /*yield*/, prisma.transactionAlert.findMany({
                            where: {
                                createdAt: {
                                    gte: oneDayAgo
                                }
                            }
                        })];
                case 3:
                    recentAlerts = _a.sent();
                    console.log("Found ".concat(recentAlerts.length, " alerts in the last 24 hours"));
                    alertsByWallet_1 = new Map();
                    for (_i = 0, recentAlerts_1 = recentAlerts; _i < recentAlerts_1.length; _i++) {
                        alert_1 = recentAlerts_1[_i];
                        key = "".concat(alert_1.walletAddress, "-").concat(alert_1.chain);
                        if (!alertsByWallet_1.has(key)) {
                            alertsByWallet_1.set(key, []);
                        }
                        alertsByWallet_1.get(key).push(alert_1);
                    }
                    results = watchlistItems.map(function (item) {
                        var _a;
                        var key = "".concat(item.address, "-").concat(item.chain);
                        var alerts = alertsByWallet_1.get(key) || [];
                        return {
                            id: item.id,
                            address: item.address,
                            chain: item.chain,
                            tokenAddress: item.tokenAddress,
                            userId: item.userId,
                            userEmail: (_a = item.user) === null || _a === void 0 ? void 0 : _a.email,
                            label: item.label,
                            lastChecked: item.lastChecked,
                            alertsLast24h: alerts.length,
                            latestAlert: alerts.length > 0 ? alerts[0].createdAt : null
                        };
                    });
                    return [2 /*return*/, {
                            success: true,
                            timestamp: timestamp,
                            walletsChecked: watchlistItems.length,
                            totalAlerts24h: recentAlerts.length,
                            results: results
                        }];
                case 4:
                    error_1 = _a.sent();
                    console.error("[".concat(timestamp, "] Monitoring failed:"), error_1.message);
                    return [2 /*return*/, {
                            success: false,
                            timestamp: timestamp,
                            error: error_1.message
                        }];
                case 5: return [4 /*yield*/, prisma.$disconnect()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Execute monitoring
monitorWatchlist()
    .then(function (result) {
    console.log('\n=== MONITORING RESULTS ===');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
})
    .catch(function (error) {
    console.error('Fatal error:', error);
    process.exit(1);
});
