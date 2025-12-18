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
exports.notifyWalletTransaction = exports.telegramClient = void 0;
// Telegram Bot API Client
var fs_1 = require("fs");
var path_1 = require("path");
var TelegramClient = /** @class */ (function () {
    function TelegramClient() {
        this.botToken = this.getBotToken();
        this.baseUrl = "https://api.telegram.org/bot".concat(this.botToken);
    }
    TelegramClient.prototype.getBotToken = function () {
        var _a, _b, _c, _d, _e, _f;
        try {
            var authSecretsPath = path_1.default.join('/home/ubuntu/.config/abacusai_auth_secrets.json');
            if (fs_1.default.existsSync(authSecretsPath)) {
                var secrets = JSON.parse(fs_1.default.readFileSync(authSecretsPath, 'utf-8'));
                var botToken = ((_c = (_b = (_a = secrets === null || secrets === void 0 ? void 0 : secrets.telegram) === null || _a === void 0 ? void 0 : _a.secrets) === null || _b === void 0 ? void 0 : _b.bot_token) === null || _c === void 0 ? void 0 : _c.value) || ((_f = (_e = (_d = secrets === null || secrets === void 0 ? void 0 : secrets.Telegram) === null || _d === void 0 ? void 0 : _d.secrets) === null || _e === void 0 ? void 0 : _e.BOT_TOKEN) === null || _f === void 0 ? void 0 : _f.value);
                if (botToken) {
                    return botToken;
                }
            }
        }
        catch (error) {
            console.error('Error reading Telegram bot token from auth secrets:', error);
        }
        // Fallback to environment variable
        var envToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!envToken) {
            throw new Error('Telegram bot token not found in auth secrets or environment variables');
        }
        return envToken;
    };
    TelegramClient.prototype.sendMessage = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/sendMessage"), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(params),
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        if (!data.ok) {
                            throw new Error(data.description || 'Failed to send message');
                        }
                        return [2 /*return*/, data.result];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error sending Telegram message:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TelegramClient.prototype.sendWhaleAlert = function (chatId, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        message = "\n\uD83D\uDC0B *Whale Alert*\n\n\uD83D\uDCB0 *Value:* ".concat(transaction.value, " (\u2248 $").concat(transaction.valueUsd.toLocaleString(), ")\n\u26D3\uFE0F *Blockchain:* ").concat(transaction.blockchain.toUpperCase(), "\n\n\uD83D\uDCE4 *From:* `").concat(transaction.fromAddress.slice(0, 8), "...").concat(transaction.fromAddress.slice(-6), "`\n\uD83D\uDCE5 *To:* `").concat(transaction.toAddress.slice(0, 8), "...").concat(transaction.toAddress.slice(-6), "`\n\n\uD83D\uDD17 [View Transaction](https://etherscan.io/tx/").concat(transaction.txHash, ")\n    ").trim();
                        return [4 /*yield*/, this.sendMessage({
                                chat_id: chatId,
                                text: message,
                                parse_mode: 'Markdown',
                                disable_web_page_preview: true,
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TelegramClient.prototype.sendBlockWarsNotification = function (chatId, notification) {
        return __awaiter(this, void 0, void 0, function () {
            var emojis, emoji, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        emojis = {
                            battle: '⚔️',
                            win: '🏆',
                            achievement: '🎖️',
                            level_up: '⬆️',
                        };
                        emoji = emojis[notification.type];
                        message = "\n".concat(emoji, " *").concat(notification.title, "*\n\n").concat(notification.description, "\n    ").trim();
                        if (notification.reward) {
                            message += "\n\n\uD83D\uDCB0 *Reward:* ".concat(notification.reward.toLocaleString(), " coins");
                        }
                        return [4 /*yield*/, this.sendMessage({
                                chat_id: chatId,
                                text: message,
                                parse_mode: 'Markdown',
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TelegramClient.prototype.sendAlphaFeed = function (chatId, tokenCall) {
        return __awaiter(this, void 0, void 0, function () {
            var sentimentEmojis, emoji, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sentimentEmojis = {
                            bullish: '🚀',
                            bearish: '📉',
                            neutral: '➡️',
                            alert: '🚨',
                        };
                        emoji = sentimentEmojis[tokenCall.sentiment] || '📊';
                        message = "\n".concat(emoji, " *Alpha Feed - ").concat(tokenCall.kolDisplayName, "*\n\n\uD83D\uDC8E *Token:* ").concat(tokenCall.tokenSymbol).concat(tokenCall.tokenName ? " (".concat(tokenCall.tokenName, ")") : '', "\n\uD83D\uDCCA *Sentiment:* ").concat(tokenCall.sentiment.toUpperCase(), "\n\n\uD83D\uDCAC \"").concat(tokenCall.content.slice(0, 200)).concat(tokenCall.content.length > 200 ? '...' : '', "\"\n\n\uD83D\uDD17 [View Tweet](").concat(tokenCall.tweetUrl, ")\n    ").trim();
                        return [4 /*yield*/, this.sendMessage({
                                chat_id: chatId,
                                text: message,
                                parse_mode: 'Markdown',
                                disable_web_page_preview: false,
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TelegramClient.prototype.sendMarketAlert = function (chatId, alert) {
        return __awaiter(this, void 0, void 0, function () {
            var isPositive, emoji, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isPositive = alert.priceChange > 0;
                        emoji = isPositive ? '📈' : '📉';
                        message = "\n".concat(emoji, " *Market Alert*\n\n\uD83D\uDCB0 *").concat(alert.symbol, "* (").concat(alert.name, ")\n\uD83D\uDCB5 *Price:* $").concat(alert.currentPrice.toLocaleString(), "\n").concat(isPositive ? '📈' : '📉', " *Change:* ").concat(isPositive ? '+' : '').concat(alert.priceChange.toFixed(2), "%\n\uD83D\uDCCA *24h Volume:* $").concat((alert.volume24h / 1000000).toFixed(2), "M\n    ").trim();
                        return [4 /*yield*/, this.sendMessage({
                                chat_id: chatId,
                                text: message,
                                parse_mode: 'Markdown',
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TelegramClient.prototype.sendDailySummary = function (chatId, summary) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        message = "\n\uD83D\uDCCA *Daily Market Summary - ".concat(summary.date, "*\n\n\uD83D\uDC0B *Whale Activity*\n\u2022 Transactions: ").concat(summary.totalWhaleTransactions, "\n\u2022 Volume: $").concat((summary.totalWhaleVolumeUsd / 1000000).toFixed(2), "M\n\n\uD83D\uDCC8 *Top Movers*\n").concat(summary.topMovers.map(function (m) { return "\u2022 ".concat(m.symbol, ": ").concat(m.change > 0 ? '+' : '').concat(m.change.toFixed(2), "%"); }).join('\n'), "\n\n\uD83D\uDCAD *Market Sentiment:* ").concat(summary.sentiment.toUpperCase(), "\n\n\uD83D\uDCF1 Visit DeFiDash for more insights!\n    ").trim();
                        return [4 /*yield*/, this.sendMessage({
                                chat_id: chatId,
                                text: message,
                                parse_mode: 'Markdown',
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TelegramClient.prototype.sendWalletTransactionAlert = function (chatId, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var typeEmojis, emoji, chainDisplay, explorerUrl, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        typeEmojis = {
                            sent: '📤',
                            received: '📥',
                            swap: '🔄',
                            contract: '📝'
                        };
                        emoji = typeEmojis[transaction.type];
                        chainDisplay = transaction.chain.toUpperCase();
                        explorerUrl = this.getExplorerUrl(transaction.chain, transaction.transactionHash);
                        message = "".concat(emoji, " *").concat(transaction.type.toUpperCase(), " Transaction*\n\n");
                        message += "\uD83D\uDD17 *Chain:* ".concat(chainDisplay, "\n");
                        message += "\uD83D\uDCBC *Wallet:* `".concat(transaction.walletAddress.slice(0, 8), "...").concat(transaction.walletAddress.slice(-6), "`\n");
                        if (transaction.tokenSymbol && transaction.tokenAmount) {
                            message += "\uD83D\uDCB0 *Amount:* ".concat(transaction.tokenAmount, " ").concat(transaction.tokenSymbol, "\n");
                        }
                        else if (transaction.value) {
                            message += "\uD83D\uDCB0 *Value:* ".concat(transaction.value, "\n");
                        }
                        message += "\n\uD83D\uDD0D [View on Explorer](".concat(explorerUrl, ")");
                        return [4 /*yield*/, this.sendMessage({
                                chat_id: chatId,
                                text: message,
                                parse_mode: 'Markdown',
                                disable_web_page_preview: true,
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TelegramClient.prototype.getExplorerUrl = function (chain, txHash) {
        var explorers = {
            ethereum: 'https://etherscan.io',
            bnb: 'https://bscscan.com',
            polygon: 'https://polygonscan.com',
            base: 'https://basescan.org',
            optimism: 'https://optimistic.etherscan.io',
            arbitrum: 'https://arbiscan.io',
            solana: 'https://solscan.io'
        };
        var baseUrl = explorers[chain] || explorers.ethereum;
        return "".concat(baseUrl, "/tx/").concat(txHash);
    };
    TelegramClient.prototype.sendWelcomeMessage = function (chatId, firstName) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        message = "\n\uD83D\uDC4B Welcome ".concat(firstName, "!\n\nI'm the DeFiDash Tracker Bot \uD83E\uDD16\n\n\uD83D\uDE80 *Quick Start:*\n1. Get your linking code at [defidashtracker.com/settings](https://defidashtracker.com/settings)\n2. Send: `/link YOUR_CODE` to connect your account\n3. Start receiving personalized alerts!\n\n\uD83D\uDCF1 *Telegram Mini App*\nLaunch our mobile-optimized app with /app for instant access to:\n\uD83D\uDCCA Live Market Data\n\uD83D\uDC0B Whale Activity Tracking  \n\uD83D\uDD25 Trending Tokens\n\u2694\uFE0F Block Wars Game\n\n*Useful Commands:*\n/link - Connect your account\n/app - Launch Mini App\n/help - See all commands\n/settings - Customize notifications\n\nLet's track the smart money together! \uD83D\uDE80\n    ").trim();
                        return [4 /*yield*/, this.sendMessage({
                                chat_id: chatId,
                                text: message,
                                parse_mode: 'Markdown',
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TelegramClient.prototype.sendHelpMessage = function (chatId) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        message = "\n\u2139\uFE0F *DeFiDash Bot Commands*\n\n\uD83D\uDCF1 *Mini App*\n/app - Launch the Telegram Mini App\n/miniapp - Same as /app\n\n\uD83D\uDCCB *Quick Commands*\n/start - Start the bot and get welcome message\n/help - Show this help message\n/settings - View and update notification preferences\n/link YOUR_CODE - Link your Telegram to DeFiDash account\n\n\uD83D\uDCCA *Market Data*\n/whale - Get latest whale transactions\n/alpha - Get latest alpha feeds from KOLs\n/market - Get current market overview\n/blockwars - Get your Block Wars stats\n\n\uD83D\uDD14 *Notification Types*\n\u2022 Whale Alerts - Large crypto transfers\n\u2022 Block Wars - Game updates and achievements  \n\u2022 Alpha Feeds - Token calls from KOLs\n\u2022 Market Alerts - Significant price movements\n\u2022 Daily Summary - End-of-day market report\n\n\uD83D\uDCA1 *Pro Tip:* Use /link to connect your account and receive personalized alerts!\n\n\uD83C\uDF10 Visit https://defidashtracker.com for full experience!\n    ".trim();
                        return [4 /*yield*/, this.sendMessage({
                                chat_id: chatId,
                                text: message,
                                parse_mode: 'Markdown',
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TelegramClient.prototype.setWebhook = function (webhookUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/setWebhook"), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    url: webhookUrl,
                                    allowed_updates: ['message', 'callback_query'],
                                }),
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error setting webhook:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TelegramClient.prototype.getMe = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/getMe"))];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error getting bot info:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TelegramClient.prototype.setMenuButton = function (menuButton) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/setChatMenuButton"), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    menu_button: menuButton || {
                                        type: 'web_app',
                                        text: '📱 Open App',
                                        web_app: { url: 'https://defidashtracker.com/telegram-mini' },
                                    },
                                }),
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Error setting menu button:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TelegramClient.prototype.setMyCommands = function (commands) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/setMyCommands"), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ commands: commands }),
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Error setting commands:', error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return TelegramClient;
}());
exports.telegramClient = new TelegramClient();
exports.default = exports.telegramClient;
// Helper function to notify wallet transactions
function notifyWalletTransaction(notification) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, user, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@/lib/db'); })];
                case 1:
                    prisma = (_a.sent()).prisma;
                    return [4 /*yield*/, prisma.user.findFirst({
                            where: {
                                telegramUsername: notification.username
                            },
                            select: { telegramChatId: true }
                        })];
                case 2:
                    user = _a.sent();
                    if (!(user === null || user === void 0 ? void 0 : user.telegramChatId)) {
                        console.log("No chat ID found for ".concat(notification.username));
                        return [2 /*return*/, false];
                    }
                    // Send notification
                    return [4 /*yield*/, exports.telegramClient.sendWalletTransactionAlert(user.telegramChatId, {
                            walletAddress: notification.walletAddress,
                            chain: notification.chain,
                            transactionHash: notification.transactionHash,
                            type: notification.type,
                            value: notification.value,
                            tokenSymbol: notification.tokenSymbol,
                            tokenAmount: notification.tokenAmount
                        })];
                case 3:
                    // Send notification
                    _a.sent();
                    return [2 /*return*/, true];
                case 4:
                    error_6 = _a.sent();
                    console.error('Error sending wallet transaction notification:', error_6);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.notifyWalletTransaction = notifyWalletTransaction;
