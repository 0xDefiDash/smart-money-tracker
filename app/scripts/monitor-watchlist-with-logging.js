#!/usr/bin/env ts-node
"use strict";
/**
 * Standalone Watchlist Monitor Script with Detailed Logging
 * Monitors watchlisted wallets and generates comprehensive logs
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
var fs = require("fs");
var path = require("path");
var prisma = new client_1.PrismaClient();
function monitorWatchlist() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var startTime, now, expiredUsers, watchlistItemsDeleted, deleted, watchlistItems, alertsCreated, results, _i, watchlistItems_1, item, error_1, endTime, duration, error_2, endTime;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    startTime = new Date();
                    console.log("[".concat(startTime.toISOString(), "] Starting watchlist monitoring..."));
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 12, 13, 15]);
                    now = new Date();
                    return [4 /*yield*/, prisma.user.findMany({
                            where: {
                                isPremium: false,
                                trialEndsAt: { lte: now }
                            },
                            select: { id: true, email: true }
                        })];
                case 2:
                    expiredUsers = _c.sent();
                    watchlistItemsDeleted = 0;
                    if (!(expiredUsers.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.watchlistItem.deleteMany({
                            where: {
                                userId: { in: expiredUsers.map(function (u) { return u.id; }) }
                            }
                        })];
                case 3:
                    deleted = _c.sent();
                    watchlistItemsDeleted = deleted.count;
                    console.log("Cleaned up ".concat(deleted.count, " watchlist items from ").concat(expiredUsers.length, " expired users"));
                    _c.label = 4;
                case 4: return [4 /*yield*/, prisma.watchlistItem.findMany({
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
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
                    _i = 0, watchlistItems_1 = watchlistItems;
                    _c.label = 6;
                case 6:
                    if (!(_i < watchlistItems_1.length)) return [3 /*break*/, 11];
                    item = watchlistItems_1[_i];
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, 9, , 10]);
                    console.log("Checking ".concat(item.address, " on ").concat(item.chain).concat(item.tokenAddress ? " (token: ".concat(item.tokenAddress, ")") : '', "..."));
                    // Update lastChecked timestamp
                    return [4 /*yield*/, prisma.watchlistItem.update({
                            where: { id: item.id },
                            data: { lastChecked: new Date() }
                        })];
                case 8:
                    // Update lastChecked timestamp
                    _c.sent();
                    results.push({
                        address: item.address,
                        chain: item.chain,
                        tokenAddress: (_a = item.tokenAddress) !== null && _a !== void 0 ? _a : undefined,
                        newTransactions: 0,
                        userEmail: item.user.email,
                        hasTelegram: !!item.user.telegramUsername
                    });
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _c.sent();
                    console.error("Error checking watchlist item ".concat(item.id, ":"), error_1.message);
                    results.push({
                        address: item.address,
                        chain: item.chain,
                        tokenAddress: (_b = item.tokenAddress) !== null && _b !== void 0 ? _b : undefined,
                        error: error_1.message,
                        userEmail: item.user.email,
                        hasTelegram: !!item.user.telegramUsername
                    });
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 6];
                case 11:
                    endTime = new Date();
                    duration = (endTime.getTime() - startTime.getTime()) / 1000;
                    console.log("\n[".concat(endTime.toISOString(), "] Monitoring complete:"));
                    console.log("  - Duration: ".concat(duration.toFixed(2), "s"));
                    console.log("  - Wallets checked: ".concat(watchlistItems.length));
                    console.log("  - Alerts created: ".concat(alertsCreated));
                    return [2 /*return*/, {
                            success: true,
                            walletsChecked: watchlistItems.length,
                            alertsCreated: alertsCreated,
                            results: results,
                            startTime: startTime,
                            endTime: endTime,
                            duration: duration,
                            expiredUsersCleanedUp: expiredUsers.length,
                            watchlistItemsDeleted: watchlistItemsDeleted
                        }];
                case 12:
                    error_2 = _c.sent();
                    endTime = new Date();
                    console.error("[".concat(endTime.toISOString(), "] Monitoring failed:"), error_2.message);
                    return [2 /*return*/, {
                            success: false,
                            error: error_2.message,
                            walletsChecked: 0,
                            alertsCreated: 0,
                            results: [],
                            startTime: startTime,
                            endTime: endTime,
                            duration: (endTime.getTime() - startTime.getTime()) / 1000
                        }];
                case 13: return [4 /*yield*/, prisma.$disconnect()];
                case 14:
                    _c.sent();
                    return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
function generateMarkdownReport(summary) {
    var success = summary.success, walletsChecked = summary.walletsChecked, alertsCreated = summary.alertsCreated, results = summary.results, startTime = summary.startTime, endTime = summary.endTime, duration = summary.duration, error = summary.error, expiredUsersCleanedUp = summary.expiredUsersCleanedUp, watchlistItemsDeleted = summary.watchlistItemsDeleted;
    var markdown = "# Watchlist Monitoring Report\n\n";
    markdown += "**Timestamp:** ".concat(startTime.toISOString(), "\n\n");
    markdown += "**Duration:** ".concat(duration.toFixed(2), " seconds\n\n");
    markdown += "**Status:** ".concat(success ? '✅ SUCCESS' : '❌ FAILED', "\n\n");
    if (error) {
        markdown += "## Error\n\n```\n".concat(error, "\n```\n\n");
    }
    markdown += "## Summary\n\n";
    markdown += "- **Wallets Checked:** ".concat(walletsChecked, "\n");
    markdown += "- **New Alerts Created:** ".concat(alertsCreated, "\n");
    if (expiredUsersCleanedUp && expiredUsersCleanedUp > 0) {
        markdown += "- **Expired Users Cleaned Up:** ".concat(expiredUsersCleanedUp, "\n");
        markdown += "- **Watchlist Items Deleted:** ".concat(watchlistItemsDeleted, "\n");
    }
    markdown += "\n## Wallet Details\n\n";
    if (results.length === 0) {
        markdown += "*No watchlist items found.*\n\n";
    }
    else {
        markdown += "| Address | Chain | Token | Transactions | Telegram | Status |\n";
        markdown += "|---------|-------|-------|--------------|----------|--------|\n";
        for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
            var result = results_1[_i];
            var addressShort = "".concat(result.address.substring(0, 6), "...").concat(result.address.substring(result.address.length - 4));
            var tokenShort = result.tokenAddress
                ? "".concat(result.tokenAddress.substring(0, 6), "...").concat(result.tokenAddress.substring(result.tokenAddress.length - 4))
                : '-';
            var telegramStatus = result.hasTelegram ? '✅' : '❌';
            var status_1 = result.error ? "\u274C ".concat(result.error) : result.newTransactions && result.newTransactions > 0 ? "\uD83D\uDD14 ".concat(result.newTransactions, " new") : '✓ No new';
            markdown += "| ".concat(addressShort, " | ").concat(result.chain, " | ").concat(tokenShort, " | ").concat(result.newTransactions || 0, " | ").concat(telegramStatus, " | ").concat(status_1, " |\n");
        }
    }
    markdown += "\n## Detailed Results\n\n";
    for (var _a = 0, results_2 = results; _a < results_2.length; _a++) {
        var result = results_2[_a];
        markdown += "### ".concat(result.address, "\n\n");
        markdown += "- **Chain:** ".concat(result.chain, "\n");
        if (result.tokenAddress) {
            markdown += "- **Token Address:** ".concat(result.tokenAddress, "\n");
        }
        markdown += "- **User:** ".concat(result.userEmail, "\n");
        markdown += "- **Telegram Linked:** ".concat(result.hasTelegram ? 'Yes' : 'No', "\n");
        markdown += "- **New Transactions:** ".concat(result.newTransactions || 0, "\n");
        if (result.error) {
            markdown += "- **Error:** ".concat(result.error, "\n");
        }
        markdown += "\n";
    }
    markdown += "---\n\n";
    markdown += "*Report generated at ".concat(endTime.toISOString(), "*\n");
    return markdown;
}
// Execute monitoring and save report
monitorWatchlist()
    .then(function (summary) {
    console.log("\n[".concat(new Date().toISOString(), "] Generating report..."));
    // Generate markdown report
    var report = generateMarkdownReport(summary);
    // Save to file
    var timestamp = summary.startTime.toISOString().replace(/[:.]/g, '-').split('T').join('_').split('Z')[0];
    var logDir = '/home/ubuntu/watchlist_logs';
    var logFile = path.join(logDir, "monitor_".concat(timestamp, ".md"));
    // Ensure directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    fs.writeFileSync(logFile, report);
    console.log("Report saved to: ".concat(logFile));
    // Also output to console
    console.log('\n' + report);
    process.exit(summary.success ? 0 : 1);
})
    .catch(function (error) {
    console.error("\n[".concat(new Date().toISOString(), "] Fatal error:"), error);
    process.exit(1);
});
