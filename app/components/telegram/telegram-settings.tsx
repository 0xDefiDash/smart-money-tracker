
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
  const [username, setUsername] = useState('');
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

  const [linkingCode, setLinkingCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);

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
        if (data.username || data.chatId) {
          setUsername(data.username || '');
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

  const generateLinkingCode = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/telegram/link-account');
      const data = await response.json();

      if (data.success) {
        if (data.connected) {
          // Already connected
          setUsername(data.username || '');
          setIsConnected(true);
          toast.success('✅ Already connected!');
          if (session?.user) {
            await loadUserSettings();
          }
        } else {
          // Got linking code
          setLinkingCode(data.linkingCode);
          setCodeExpiry(new Date(data.expiresAt));
          // Store in localStorage for persistence
          localStorage.setItem('telegram_linking_code', data.linkingCode);
          localStorage.setItem('telegram_code_expiry', data.expiresAt);
          toast.success('Linking code generated!');
        }
      } else {
        toast.error(data.error || 'Failed to generate linking code');
      }
    } catch (error) {
      console.error('Error generating linking code:', error);
      toast.error('Error generating linking code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (session?.user) {
      await loadUserSettings();
    }
    if (isConnected) {
      toast.success('✅ Connection verified!');
    } else {
      toast.info('Not connected yet. Please follow the steps above.');
    }
  };

  // Auto-generate linking code when component loads (even without session)
  useEffect(() => {
    if (!isConnected) {
      // Check localStorage first
      const storedCode = localStorage.getItem('telegram_linking_code');
      const storedExpiry = localStorage.getItem('telegram_code_expiry');
      
      if (storedCode && storedExpiry) {
        const expiryDate = new Date(storedExpiry);
        if (expiryDate > new Date()) {
          // Code is still valid
          setLinkingCode(storedCode);
          setCodeExpiry(expiryDate);
          return;
        }
      }
      
      // Generate new code
      generateLinkingCode();
    }
  }, [isConnected]);

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
            <div className="space-y-4">
              {/* Linking Code Display */}
              {linkingCode && (
                <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-lg border-2 border-primary/20">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                      <span>Your Linking Code</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-4xl font-mono font-bold tracking-widest bg-background px-6 py-3 rounded-lg border-2 border-primary/30 select-all">
                        {linkingCode}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12"
                        onClick={() => {
                          copyToClipboard(linkingCode);
                          toast.success('Code copied!');
                        }}
                      >
                        <Copy className="w-5 h-5" />
                      </Button>
                    </div>
                    {codeExpiry && (
                      <p className="text-xs text-muted-foreground">
                        Expires in {Math.ceil((codeExpiry.getTime() - Date.now()) / 60000)} minutes
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Connect in 2 Easy Steps:
                </h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      1
                    </span>
                    <span>
                      Open our bot:{' '}
                      <Button
                        variant="link"
                        className="h-auto p-0 text-primary font-semibold inline-flex items-center gap-1"
                        onClick={() => window.open(`https://t.me/${botUsername}`, '_blank')}
                      >
                        @{botUsername}
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      2
                    </span>
                    <div className="flex-1">
                      <div className="space-y-1">
                        <p>Send this command to the bot:</p>
                        <code className="block bg-black text-green-400 px-3 py-2 rounded font-mono text-sm select-all">
                          /link {linkingCode || 'YOUR_CODE'}
                        </code>
                      </div>
                    </div>
                  </li>
                </ol>
                
                <div className="pt-3 border-t space-y-2">
                  <Button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="w-full"
                    variant="default"
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
                  <Button
                    onClick={generateLinkingCode}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    Generate New Code
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Username Display */}
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
