
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Bell,
  BellOff,
  Fish as WhaleIcon,
  TrendingUp,
  Users,
  Flame,
  Gamepad2,
  Check,
  AlertCircle,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  whaleAlerts: boolean;
  shotCallersAlerts: boolean;
  blockWarsAlerts: boolean;
  marketAlerts: boolean;
  dailySummary: boolean;
  selectedShotCallers: string[];
}

interface ShotCaller {
  username: string;
  displayName: string;
  isVerified: boolean;
  profileImage?: string;
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    whaleAlerts: true,
    shotCallersAlerts: true,
    blockWarsAlerts: true,
    marketAlerts: false,
    dailySummary: true,
    selectedShotCallers: [],
  });
  const [shotCallers, setShotCallers] = useState<ShotCaller[]>([]);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Show back button
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        window.history.back();
      });

      // Get user data
      if (tg.initDataUnsafe.user) {
        setUserId(tg.initDataUnsafe.user.id);
        loadNotificationSettings(tg.initDataUnsafe.user.id);
      }
    }

    loadShotCallers();

    return () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.BackButton.hide();
      }
    };
  }, []);

  const loadNotificationSettings = async (telegramUserId: number) => {
    try {
      const response = await fetch(`/api/telegram/notifications?userId=${telegramUserId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadShotCallers = async () => {
    try {
      const response = await fetch('/api/shot-callers/list');
      if (response.ok) {
        const data = await response.json();
        setShotCallers(data.shotCallers || []);
      }
    } catch (error) {
      console.error('Error loading shot callers:', error);
    }
  };

  const handleToggleNotification = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleShotCaller = (username: string) => {
    setSettings((prev) => {
      const selected = prev.selectedShotCallers;
      const isSelected = selected.includes(username);
      
      return {
        ...prev,
        selectedShotCallers: isSelected
          ? selected.filter((u) => u !== username)
          : [...selected, username],
      };
    });
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error('User ID not found. Please restart the bot.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/telegram/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          settings,
        }),
      });

      if (response.ok) {
        toast.success('Notification settings saved!');
      } else {
        toast.error('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notification Settings
        </h1>
        <p className="text-xs opacity-90 mt-1">
          Customize your alerts and updates
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* General Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              General Notifications
            </CardTitle>
            <CardDescription>
              Choose which types of alerts you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <WhaleIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <Label htmlFor="whale-alerts" className="font-semibold">
                    Whale Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Large cryptocurrency transactions
                  </p>
                </div>
              </div>
              <Switch
                id="whale-alerts"
                checked={settings.whaleAlerts}
                onCheckedChange={() => handleToggleNotification('whaleAlerts')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <Label htmlFor="shot-callers" className="font-semibold">
                    Shot Callers Posts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Token calls from KOLs
                  </p>
                </div>
              </div>
              <Switch
                id="shot-callers"
                checked={settings.shotCallersAlerts}
                onCheckedChange={() => handleToggleNotification('shotCallersAlerts')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <Label htmlFor="block-wars" className="font-semibold">
                    Block Wars Updates
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Game achievements and battles
                  </p>
                </div>
              </div>
              <Switch
                id="block-wars"
                checked={settings.blockWarsAlerts}
                onCheckedChange={() => handleToggleNotification('blockWarsAlerts')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <Label htmlFor="market-alerts" className="font-semibold">
                    Market Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Significant price movements
                  </p>
                </div>
              </div>
              <Switch
                id="market-alerts"
                checked={settings.marketAlerts}
                onCheckedChange={() => handleToggleNotification('marketAlerts')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <Label htmlFor="daily-summary" className="font-semibold">
                    Daily Summary
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    End-of-day market report
                  </p>
                </div>
              </div>
              <Switch
                id="daily-summary"
                checked={settings.dailySummary}
                onCheckedChange={() => handleToggleNotification('dailySummary')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Shot Callers Selection */}
        {settings.shotCallersAlerts && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Follow Shot Callers
              </CardTitle>
              <CardDescription>
                Get notified when these KOLs make token calls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {shotCallers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No shot callers available</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-sm font-medium">
                      {settings.selectedShotCallers.length} selected
                    </span>
                    {settings.selectedShotCallers.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSettings((prev) => ({ ...prev, selectedShotCallers: [] }))}
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  {shotCallers.map((caller) => (
                    <div
                      key={caller.username}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        settings.selectedShotCallers.includes(caller.username)
                          ? 'bg-primary/5 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleToggleShotCaller(caller.username)}
                    >
                      <div className="flex items-center gap-3">
                        {caller.profileImage ? (
                          <img
                            src={caller.profileImage}
                            alt={caller.displayName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {caller.displayName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {caller.displayName}
                            </span>
                            {caller.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                ✓
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            @{caller.username}
                          </p>
                        </div>
                      </div>
                      {settings.selectedShotCallers.includes(caller.username) && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
