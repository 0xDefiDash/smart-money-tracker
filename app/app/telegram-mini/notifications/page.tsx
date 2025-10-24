
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 pb-20">
      {/* Compact Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-md mx-auto px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Notification Settings</h1>
              <p className="text-[10px] opacity-80">Customize your alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container - Max Width for Mobile */}
      <div className="max-w-md mx-auto px-2 py-3 space-y-2.5">
        {/* General Notifications */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-blue-600" />
              Alert Types
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Choose what you want to track</p>
          </div>
          <div className="p-2.5 space-y-2.5">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <WhaleIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <Label htmlFor="whale-alerts" className="text-xs font-semibold">
                    Whale Alerts
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Large transactions
                  </p>
                </div>
              </div>
              <Switch
                id="whale-alerts"
                checked={settings.whaleAlerts}
                onCheckedChange={() => handleToggleNotification('whaleAlerts')}
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <Label htmlFor="shot-callers" className="text-xs font-semibold">
                    Shot Callers
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
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

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Gamepad2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <Label htmlFor="block-wars" className="text-xs font-semibold">
                    Block Wars
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Game updates
                  </p>
                </div>
              </div>
              <Switch
                id="block-wars"
                checked={settings.blockWarsAlerts}
                onCheckedChange={() => handleToggleNotification('blockWarsAlerts')}
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <Label htmlFor="market-alerts" className="text-xs font-semibold">
                    Market Moves
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Price changes
                  </p>
                </div>
              </div>
              <Switch
                id="market-alerts"
                checked={settings.marketAlerts}
                onCheckedChange={() => handleToggleNotification('marketAlerts')}
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <Label htmlFor="daily-summary" className="text-xs font-semibold">
                    Daily Report
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    End-of-day summary
                  </p>
                </div>
              </div>
              <Switch
                id="daily-summary"
                checked={settings.dailySummary}
                onCheckedChange={() => handleToggleNotification('dailySummary')}
              />
            </div>
          </div>
        </div>

        {/* Shot Callers Selection */}
        {settings.shotCallersAlerts && (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-600" />
                    Follow KOLs
                  </h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {settings.selectedShotCallers.length} selected
                  </p>
                </div>
                {settings.selectedShotCallers.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] h-6 px-2"
                    onClick={() => setSettings((prev) => ({ ...prev, selectedShotCallers: [] }))}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <div className="p-2.5 space-y-2">
              {shotCallers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                  <p className="text-xs">No shot callers available</p>
                </div>
              ) : (
                <>
                  {shotCallers.map((caller) => (
                    <div
                      key={caller.username}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                        settings.selectedShotCallers.includes(caller.username)
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      onClick={() => handleToggleShotCaller(caller.username)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {caller.profileImage ? (
                          <img
                            src={caller.profileImage}
                            alt={caller.displayName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {caller.displayName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-xs truncate">
                              {caller.displayName}
                            </span>
                            {caller.isVerified && (
                              <span className="text-blue-600 text-[10px]">✓</span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            @{caller.username}
                          </p>
                        </div>
                      </div>
                      {settings.selectedShotCallers.includes(caller.username) && (
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="sticky bottom-16 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl h-10 shadow-md"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                <span className="text-xs">Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                <span className="text-xs">Save Settings</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
