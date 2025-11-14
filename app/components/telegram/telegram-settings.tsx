
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Loader2,
  Link2,
  Clock,
} from 'lucide-react';

interface TelegramSettings {
  whaleAlerts: boolean;
  blockWars: boolean;
  alphaFeeds: boolean;
  marketAlerts: boolean;
  dailySummary: boolean;
}

interface LinkingCodeData {
  code: string;
  deepLink: string;
  expiresAt: string;
}

export default function TelegramSettings() {
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [linkingCode, setLinkingCode] = useState<LinkingCodeData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [settings, setSettings] = useState<TelegramSettings>({
    whaleAlerts: true,
    blockWars: true,
    alphaFeeds: true,
    marketAlerts: false,
    dailySummary: true,
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  // Countdown timer for code expiry
  useEffect(() => {
    if (!linkingCode) {
      setTimeRemaining(0);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(linkingCode.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeRemaining(diff);
      
      if (diff === 0) {
        setLinkingCode(null);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [linkingCode]);

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

  const handleGenerateCode = async () => {
    try {
      setIsGeneratingCode(true);
      const response = await fetch('/api/telegram/generate-code', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setLinkingCode({
          code: data.code,
          deepLink: data.deepLink,
          expiresAt: data.expiresAt,
        });
        toast.success('Connection link generated!');
      } else {
        toast.error(data.error || 'Failed to generate connection link');
      }
    } catch (error) {
      toast.error('Error generating connection link');
      console.error(error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleRefresh = async () => {
    await loadUserSettings();
    if (isConnected) {
      toast.success('✅ Connection verified!');
    } else {
      toast.info('Not connected yet. Please click the Telegram link above.');
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
          username: username,
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
              ) : linkingCode ? (
                <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">
                  {isConnected ? 'Connected' : linkingCode ? 'Pending Connection' : 'Not Connected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConnected
                    ? 'Receiving notifications on Telegram'
                    : linkingCode
                    ? 'Click the link below to complete connection'
                    : 'Connect your Telegram to receive notifications'}
                </p>
              </div>
            </div>
            {isConnected && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                Active
              </Badge>
            )}
            {linkingCode && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                Pending
              </Badge>
            )}
          </div>

          {/* Setup Instructions - Not Connected */}
          {!isConnected && !linkingCode && (
            <div className="space-y-4">
              <div className="space-y-4 p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-lg border-2 border-primary/20">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Connect in 2 Simple Steps:
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      1
                    </span>
                    <div className="flex-1">
                      <p>Click "Connect Telegram" to generate your unique connection link</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      2
                    </span>
                    <div className="flex-1">
                      <p>Click the link to open Telegram and complete the connection</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleGenerateCode}
                  disabled={isGeneratingCode}
                  className="w-full"
                  size="lg"
                >
                  {isGeneratingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Link...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Connect Telegram
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Show Generated Link */}
          {!isConnected && linkingCode && (
            <div className="space-y-4">
              <div className="space-y-4 p-4 bg-gradient-to-br from-green-500/10 via-primary/5 to-transparent rounded-lg border-2 border-green-500/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Connection Link Ready!
                  </h3>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-black/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground mb-1 block">Your Connection Code</Label>
                    <div className="flex items-center justify-between">
                      <code className="text-2xl font-bold tracking-widest text-green-400">
                        {linkingCode.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(linkingCode.code);
                          toast.success('Code copied!');
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white"
                    onClick={() => window.open(linkingCode.deepLink, '_blank')}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Open Telegram & Connect
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Click the button above to open Telegram. The connection will happen automatically!
                  </p>
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
                  
                  <Button
                    onClick={() => setLinkingCode(null)}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    Generate New Link
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
