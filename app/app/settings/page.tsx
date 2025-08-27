
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import {
  Settings,
  Bell,
  Shield,
  Eye,
  Palette,
  Zap,
  Globe,
  DollarSign,
  Clock,
  Smartphone,
  Mail,
  Lock,
  Key,
  Database,
  Activity,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { toast } from 'sonner'

interface SettingsData {
  // General Settings
  currency: string
  timezone: string
  language: string
  theme: string
  
  // Notification Settings
  enableNotifications: boolean
  priceAlerts: boolean
  whaleAlerts: boolean
  marketUpdates: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  
  // Display Settings
  showPortfolio: boolean
  showMarketCap: boolean
  show24hVolume: boolean
  showDominance: boolean
  refreshInterval: number
  
  // API Settings
  coingeckoEnabled: boolean
  coinapiEnabled: boolean
  moralisEnabled: boolean
  
  // Privacy Settings
  anonymousMode: boolean
  shareData: boolean
  trackingEnabled: boolean
  
  // Advanced Settings
  maxWhaleAddresses: number
  alertThreshold: number
  cacheExpiry: number
}

const DEFAULT_SETTINGS: SettingsData = {
  currency: 'USD',
  timezone: 'UTC',
  language: 'English',
  theme: 'dark',
  enableNotifications: true,
  priceAlerts: true,
  whaleAlerts: true,
  marketUpdates: false,
  emailNotifications: false,
  pushNotifications: true,
  showPortfolio: true,
  showMarketCap: true,
  show24hVolume: true,
  showDominance: true,
  refreshInterval: 30,
  coingeckoEnabled: true,
  coinapiEnabled: true,
  moralisEnabled: true,
  anonymousMode: false,
  shareData: false,
  trackingEnabled: true,
  maxWhaleAddresses: 200,
  alertThreshold: 1000000,
  cacheExpiry: 5
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('smart-money-tracker-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    // Load last saved timestamp
    const savedTimestamp = localStorage.getItem('smart-money-tracker-settings-timestamp')
    if (savedTimestamp) {
      setLastSaved(new Date(savedTimestamp))
    }
  }, [])

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Save to localStorage
      localStorage.setItem('smart-money-tracker-settings', JSON.stringify(settings))
      localStorage.setItem('smart-money-tracker-settings-timestamp', new Date().toISOString())
      
      setLastSaved(new Date())
      setHasChanges(false)
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    setHasChanges(true)
    toast.info('Settings reset to defaults')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Settings className="w-8 h-8 text-primary" />
            <span>Settings</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure your Smart Money Tracker preferences and display options
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {lastSaved && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </Badge>
          )}
          <Button 
            onClick={resetSettings}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={saveSettings}
            disabled={isSaving || !hasChanges}
            size="sm"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Alerts</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="apis">APIs</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-primary" />
                <span>Regional Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="BTC">BTC (₿)</SelectItem>
                      <SelectItem value="ETH">ETH (Ξ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Español</SelectItem>
                      <SelectItem value="French">Français</SelectItem>
                      <SelectItem value="German">Deutsch</SelectItem>
                      <SelectItem value="Chinese">中文</SelectItem>
                      <SelectItem value="Japanese">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-primary" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={settings.theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('theme', 'light')}
                    >
                      <Sun className="w-4 h-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={settings.theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('theme', 'dark')}
                    >
                      <Moon className="w-4 h-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant={settings.theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('theme', 'system')}
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-primary" />
                <span>Alert Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Master switch for all notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Alert Types</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Price Alerts</Label>
                        <p className="text-xs text-muted-foreground">
                          Significant price movements
                        </p>
                      </div>
                      <Switch
                        checked={settings.priceAlerts}
                        onCheckedChange={(checked) => updateSetting('priceAlerts', checked)}
                        disabled={!settings.enableNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Whale Alerts</Label>
                        <p className="text-xs text-muted-foreground">
                          Large transaction movements
                        </p>
                      </div>
                      <Switch
                        checked={settings.whaleAlerts}
                        onCheckedChange={(checked) => updateSetting('whaleAlerts', checked)}
                        disabled={!settings.enableNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Market Updates</Label>
                        <p className="text-xs text-muted-foreground">
                          General market news
                        </p>
                      </div>
                      <Switch
                        checked={settings.marketUpdates}
                        onCheckedChange={(checked) => updateSetting('marketUpdates', checked)}
                        disabled={!settings.enableNotifications}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Delivery Methods</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>Email Notifications</span>
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Receive alerts via email
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                        disabled={!settings.enableNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="flex items-center space-x-2">
                          <Smartphone className="w-4 h-4" />
                          <span>Push Notifications</span>
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Browser push notifications
                        </p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                        disabled={!settings.enableNotifications}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <span>Alert Thresholds</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Whale Transaction Threshold</Label>
                <div className="space-y-2">
                  <Slider
                    value={[settings.alertThreshold]}
                    onValueChange={(value) => updateSetting('alertThreshold', value[0])}
                    max={10000000}
                    min={100000}
                    step={100000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>$100K</span>
                    <span className="font-medium">${(settings.alertThreshold / 1000000).toFixed(1)}M</span>
                    <span>$10M</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-primary" />
                <span>Data Display</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Market Data</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label>Show Portfolio Values</Label>
                    <Switch
                      checked={settings.showPortfolio}
                      onCheckedChange={(checked) => updateSetting('showPortfolio', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Show Market Cap</Label>
                    <Switch
                      checked={settings.showMarketCap}
                      onCheckedChange={(checked) => updateSetting('showMarketCap', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Show 24h Volume</Label>
                    <Switch
                      checked={settings.show24hVolume}
                      onCheckedChange={(checked) => updateSetting('show24hVolume', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Show Dominance</Label>
                    <Switch
                      checked={settings.showDominance}
                      onCheckedChange={(checked) => updateSetting('showDominance', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Update Frequency</h4>
                  
                  <div className="space-y-2">
                    <Label>Data Refresh Interval</Label>
                    <Select 
                      value={settings.refreshInterval.toString()} 
                      onValueChange={(value) => updateSetting('refreshInterval', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                        <SelectItem value="600">10 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Lower intervals may increase API usage
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="apis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-primary" />
                <span>Data Sources</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Label className="font-medium">CoinGecko API</Label>
                      <Badge variant={settings.coingeckoEnabled ? "default" : "secondary"}>
                        {settings.coingeckoEnabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Primary source for cryptocurrency market data
                    </p>
                  </div>
                  <Switch
                    checked={settings.coingeckoEnabled}
                    onCheckedChange={(checked) => updateSetting('coingeckoEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Label className="font-medium">CoinAPI</Label>
                      <Badge variant={settings.coinapiEnabled ? "default" : "secondary"}>
                        {settings.coinapiEnabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Backup source for market data and historical prices
                    </p>
                  </div>
                  <Switch
                    checked={settings.coinapiEnabled}
                    onCheckedChange={(checked) => updateSetting('coinapiEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Label className="font-medium">Moralis API</Label>
                      <Badge variant={settings.moralisEnabled ? "default" : "secondary"}>
                        {settings.moralisEnabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Blockchain data for wallet monitoring and transactions
                    </p>
                  </div>
                  <Switch
                    checked={settings.moralisEnabled}
                    onCheckedChange={(checked) => updateSetting('moralisEnabled', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cache Expiry (minutes)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[settings.cacheExpiry]}
                    onValueChange={(value) => updateSetting('cacheExpiry', value[0])}
                    max={60}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1 min</span>
                    <span className="font-medium">{settings.cacheExpiry} minutes</span>
                    <span>60 min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Anonymous Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Hide sensitive wallet information
                    </p>
                  </div>
                  <Switch
                    checked={settings.anonymousMode}
                    onCheckedChange={(checked) => updateSetting('anonymousMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Share Usage Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the platform with anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={settings.shareData}
                    onCheckedChange={(checked) => updateSetting('shareData', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Track performance and user behavior
                    </p>
                  </div>
                  <Switch
                    checked={settings.trackingEnabled}
                    onCheckedChange={(checked) => updateSetting('trackingEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Advanced Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Maximum Whale Addresses to Track</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[settings.maxWhaleAddresses]}
                      onValueChange={(value) => updateSetting('maxWhaleAddresses', value[0])}
                      max={500}
                      min={50}
                      step={25}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>50</span>
                      <span className="font-medium">{settings.maxWhaleAddresses} addresses</span>
                      <span>500</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Higher values may impact performance
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Performance Settings</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="p-3 border rounded-lg">
                      <Label className="text-sm font-medium">API Rate Limiting</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically enabled to prevent API quota exhaustion
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <Label className="text-sm font-medium">Memory Optimization</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Efficient caching and garbage collection enabled
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-foreground">API Status</p>
                  <p className="text-xs text-muted-foreground">Operational</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-foreground">Data Sync</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-foreground">Cache</p>
                  <p className="text-xs text-muted-foreground">85% Full</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-foreground">Alerts</p>
                  <p className="text-xs text-muted-foreground">Running</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button (Sticky) */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6">
          <Button 
            onClick={saveSettings}
            disabled={isSaving}
            size="lg"
            className="shadow-lg"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  )
}
