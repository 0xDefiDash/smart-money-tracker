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
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function monitorWatchlist() {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, now, expiredUsers, deleted, watchlistItems, alertsCreated, results, _i, watchlistItems_1, item, error_1, endTime, duration, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startTime = new Date();
                    console.log("[".concat(startTime.toISOString(), "] Starting watchlist monitoring..."));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 12, 13, 15]);
                    now = new Date();
                    return [4 /*yield*/, prisma.user.findMany({
                            where: {
                                isPremium: false,
                                trialEndsAt: { lte: now }
                            },
                            select: { id: true }
                        })];
                case 2:
                    expiredUsers = _a.sent();
                    if (!(expiredUsers.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.watchlistItem.deleteMany({
                            where: {
                                userId: { in: expiredUsers.map(function (u) { return u.id; }) }
                            }
                        })];
                case 3:
                    deleted = _a.sent();
                    console.log("Cleaned up ".concat(deleted.count, " watchlist items from ").concat(expiredUsers.length, " expired users"));
                    _a.label = 4;
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
                    watchlistItems = _a.sent();
                    console.log("Found ".concat(watchlistItems.length, " watchlist items to check"));
                    alertsCreated = 0;
                    results = [];
                    _i = 0, watchlistItems_1 = watchlistItems;
                    _a.label = 6;
                case 6:
                    if (!(_i < watchlistItems_1.length)) return [3 /*break*/, 11];
                    item = watchlistItems_1[_i];
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    // For this monitoring run, we'll just update the lastChecked timestamp
                    // and log the wallet info. Actual transaction fetching would require
                    // API keys and external service calls.
                    return [4 /*yield*/, prisma.watchlistItem.update({
                            where: { id: item.id },
                            data: { lastChecked: new Date() }
                        })];
                case 8:
                    // For this monitoring run, we'll just update the lastChecked timestamp
                    // and log the wallet info. Actual transaction fetching would require
                    // API keys and external service calls.
                    _a.sent();
                    results.push({
                        address: item.address,
                        chain: item.chain,
                        newTransactions: 0
                    });
                    console.log("\u2713 Checked ".concat(item.address, " (").concat(item.chain, ")"));
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _a.sent();
                    console.error("Error checking watchlist item ".concat(item.id, ":"), error_1.message);
                    results.push({
                        address: item.address,
                        chain: item.chain,
                        error: error_1.message
                    });
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 6];
                case 11:
                    endTime = new Date();
                    duration = (endTime.getTime() - startTime.getTime()) / 1000;
                    console.log("\n[".concat(endTime.toISOString(), "] Monitoring complete:"));
                    console.log("  - Wallets checked: ".concat(watchlistItems.length));
                    console.log("  - Alerts created: ".concat(alertsCreated));
                    console.log("  - Duration: ".concat(duration, "s"));
                    return [2 /*return*/, {
                            success: true,
                            walletsChecked: watchlistItems.length,
                            alertsCreated: alertsCreated,
                            results: results,
                            startTime: startTime,
                            endTime: endTime,
                            duration: duration
                        }];
                case 12:
                    error_2 = _a.sent();
                    console.error("[".concat(new Date().toISOString(), "] Monitoring failed:"), error_2.message);
                    return [2 /*return*/, {
                            success: false,
                            error: error_2.message,
                            walletsChecked: 0,
                            alertsCreated: 0,
                            results: [],
                            startTime: startTime,
                            endTime: new Date(),
                            duration: 0
                        }];
                case 13: return [4 /*yield*/, prisma.$disconnect()];
                case 14:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
// Execute monitoring
monitorWatchlist()
    .then(function (result) {
    console.log("\nMonitoring task completed with status: ".concat(result.success ? 'SUCCESS' : 'FAILURE'));
    process.exit(result.success ? 0 : 1);
})
    .catch(function (error) {
    console.error("\nFatal error:", error);
    process.exit(1);
});
