
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Loader2,
  User,
} from 'lucide-react';

interface TelegramSettings {
  whaleAlerts: boolean;
  blockWars: boolean;
  alphaFeeds: boolean;
  marketAlerts: boolean;
  dailySummary: boolean;
}

export default function TelegramSettings() {
  const { data: session } = useSession() || {};
  const [username, setUsername] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPendingConnection, setIsPendingConnection] = useState(false);
  const [settings, setSettings] = useState<TelegramSettings>({
    whaleAlerts: true,
    blockWars: true,
    alphaFeeds: true,
    marketAlerts: false,
    dailySummary: true,
  });

  useEffect(() => {
    loadUserSettings();
  }, [session]);

  const loadUserSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/telegram-settings');
      const data = await response.json();

      if (data.success) {
        if (data.username || data.chatId) {
          setUsername(data.username || '');
          setIsConnected(true);
          setIsPendingConnection(false);
        } else if (data.pendingUsername) {
          setInputUsername(data.pendingUsername);
          setIsPendingConnection(true);
        }
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!inputUsername.trim()) {
      toast.error('Please enter your Telegram username');
      return;
    }

    // Remove @ if user included it
    const cleanUsername = inputUsername.replace('@', '').trim();

    try {
      setIsSaving(true);
      const response = await fetch('/api/telegram/save-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername }),
      });

      const data = await response.json();

      if (data.success) {
        setIsPendingConnection(true);
        toast.success('Username saved! Now go to Telegram and send /connect');
      } else {
        toast.error(data.error || 'Failed to save username');
      }
    } catch (error) {
      toast.error('Error saving username');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    await loadUserSettings();
    if (isConnected) {
      toast.success('✅ Connection verified!');
    } else {
      toast.info('Not connected yet. Please send /connect to the bot.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/user/telegram-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    if (!isConnected) {
      toast.error('Please connect Telegram first');
      return;
    }

    try {
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test',
          data: {
            message: '🎉 Test notification from DeFiDash Tracker!\n\nYour Telegram notifications are working correctly.',
          },
          userId: session?.user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Test notification sent! Check your Telegram.');
      } else {
        toast.error('Failed to send test notification');
      }
    } catch (error) {
      toast.error('Error sending test notification');
      console.error(error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const botUsername = 'Tracker103_bot'; // Official DeFiDash Tracker Bot

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Telegram Notifications
          </CardTitle>
          <CardDescription>
            Receive real-time alerts and updates directly on Telegram
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : isPendingConnection ? (
                <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">
                  {isConnected ? 'Connected' : isPendingConnection ? 'Pending Connection' : 'Not Connected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConnected
                    ? 'Receiving notifications on Telegram'
                    : isPendingConnection
                    ? 'Waiting for you to send /connect on Telegram'
                    : 'Connect your Telegram to receive notifications'}
                </p>
              </div>
            </div>
            {isConnected && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                Active
              </Badge>
            )}
            {isPendingConnection && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                Pending
              </Badge>
            )}
          </div>

          {/* Setup Instructions - Not Connected */}
          {!isConnected && !isPendingConnection && (
            <div className="space-y-4">
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Connect in 2 Simple Steps:
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      1
                    </span>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="telegram-username">Enter your Telegram username</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                          <Input
                            id="telegram-username"
                            placeholder="your_username"
                            value={inputUsername}
                            onChange={(e) => setInputUsername(e.target.value)}
                            className="pl-7"
                          />
                        </div>
                        <Button
                          onClick={handleSaveUsername}
                          disabled={isSaving || !inputUsername.trim()}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save'
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter your Telegram username (without @)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Setup Instructions - Pending Connection */}
          {!isConnected && isPendingConnection && (
            <div className="space-y-4">
              <div className="space-y-4 p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-lg border-2 border-primary/20">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Username Saved: @{inputUsername}</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      2
                    </span>
                    <div className="flex-1 space-y-2">
                      <p>Open our bot and send <code className="bg-black text-green-400 px-2 py-1 rounded">/connect</code></p>
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => window.open(`https://t.me/${botUsername}`, '_blank')}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Open @{botUsername}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t space-y-2">
                  <Button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Check Connection Status
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Username Display - Connected */}
          {isConnected && (
            <div className="space-y-2">
              <Label>Connected Telegram Account</Label>
              <div className="flex gap-2">
                <Input
                  value={username ? `@${username}` : 'Connected'}
                  disabled
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => username && copyToClipboard(`@${username}`)}
                  disabled={!username}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your account is connected and receiving notifications
              </p>
            </div>
          )}

          {/* Notification Settings */}
          {isConnected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notification Preferences</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestNotification}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Test Notification
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>🐋 Whale Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Large crypto transfers and whale activity
                    </p>
                  </div>
                  <Switch
                    checked={settings.whaleAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, whaleAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>⚔️ Block Wars</Label>
                    <p className="text-sm text-muted-foreground">
                      Game updates, battles, and achievements
                    </p>
                  </div>
                  <Switch
                    checked={settings.blockWars}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, blockWars: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>💎 Alpha Feeds</Label>
                    <p className="text-sm text-muted-foreground">
                      Token calls from top KOLs and analysts
                    </p>
                  </div>
                  <Switch
                    checked={settings.alphaFeeds}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, alphaFeeds: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>📊 Market Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Significant price movements and market changes
                    </p>
                  </div>
                  <Switch
                    checked={settings.marketAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, marketAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>📈 Daily Summary</Label>
                    <p className="text-sm text-muted-foreground">
                      End-of-day market report and statistics
                    </p>
                  </div>
                  <Switch
                    checked={settings.dailySummary}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, dailySummary: checked })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
