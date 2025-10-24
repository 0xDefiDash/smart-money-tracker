
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
  const [chatId, setChatId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<TelegramSettings>({
    whaleAlerts: true,
    blockWars: true,
    alphaFeeds: true,
    marketAlerts: false,
    dailySummary: true,
  });

  useEffect(() => {
    if (session?.user) {
      loadUserSettings();
    }
  }, [session]);

  const loadUserSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/telegram-settings');
      const data = await response.json();

      if (data.success) {
        if (data.chatId) {
          setChatId(data.chatId);
          setIsConnected(true);
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

  const handleConnect = async () => {
    if (!chatId.trim()) {
      toast.error('Please enter your Telegram Chat ID');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/user/telegram-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: chatId.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setIsConnected(true);
        toast.success('Telegram connected successfully!');
      } else {
        toast.error(data.error || 'Failed to connect Telegram');
      }
    } catch (error) {
      toast.error('Error connecting Telegram');
      console.error(error);
    } finally {
      setIsSaving(false);
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

  const botUsername = 'defidash_bot'; // Replace with your actual bot username

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Telegram Notifications</CardTitle>
          <CardDescription>Please sign in to connect Telegram</CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">
                  {isConnected ? 'Connected' : 'Not Connected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConnected
                    ? 'Receiving notifications on Telegram'
                    : 'Connect your Telegram to receive notifications'}
                </p>
              </div>
            </div>
            {isConnected && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                Active
              </Badge>
            )}
          </div>

          {/* Setup Instructions */}
          {!isConnected && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-sm">How to Connect:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>
                    Open Telegram and search for{' '}
                    <Button
                      variant="link"
                      className="h-auto p-0 text-primary"
                      onClick={() => window.open(`https://t.me/${botUsername}`, '_blank')}
                    >
                      @{botUsername}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Send /start to the bot</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Send /connect to get your Chat ID</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span>Copy and paste your Chat ID below</span>
                </li>
              </ol>
            </div>
          )}

          {/* Chat ID Input */}
          <div className="space-y-2">
            <Label htmlFor="chatId">Telegram Chat ID</Label>
            <div className="flex gap-2">
              <Input
                id="chatId"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Enter your Telegram Chat ID"
                disabled={isConnected}
              />
              {isConnected && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(chatId)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
            {!isConnected && (
              <Button
                onClick={handleConnect}
                disabled={isSaving || !chatId.trim()}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Telegram'
                )}
              </Button>
            )}
          </div>

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
