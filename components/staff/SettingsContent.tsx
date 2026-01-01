"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Badge } from "@/components/ui/badge";
import { Bell, Database, Shield, Palette, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SettingsContent() {
  const [settings, setSettings] = useState({
    priceRefreshInterval: "300", // 5 minutes in seconds
    enableNotifications: true,
    notificationThreshold: "5", // 5% price change
    theme: "default",
    autoPublish: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    
    // Simulate save (in production, this would call an API)
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <AnimatedSection>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Price Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                    Price Settings
                  </CardTitle>
                  <CardDescription>Configure price refresh and update intervals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="refreshInterval" className="text-sm font-medium">
                  Price Refresh Interval (seconds)
                </Label>
                <Input
                  id="refreshInterval"
                  type="number"
                  value={settings.priceRefreshInterval}
                  onChange={(e) => setSettings({ ...settings, priceRefreshInterval: e.target.value })}
                  className="mt-1 border-brand-300"
                  min="60"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  How often to fetch new prices from the API (minimum 60 seconds)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoPublish"
                  checked={settings.autoPublish}
                  onChange={(e) => setSettings({ ...settings, autoPublish: e.target.checked })}
                  className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                />
                <Label htmlFor="autoPublish" className="text-sm font-medium cursor-pointer">
                  Auto-publish new prices
                </Label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                    Notifications
                  </CardTitle>
                  <CardDescription>Configure price alert notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableNotifications"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                  className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                />
                <Label htmlFor="enableNotifications" className="text-sm font-medium cursor-pointer">
                  Enable price change notifications
                </Label>
              </div>
              {settings.enableNotifications && (
                <div>
                  <Label htmlFor="notificationThreshold" className="text-sm font-medium">
                    Notification Threshold (%)
                  </Label>
                  <Input
                    id="notificationThreshold"
                    type="number"
                    value={settings.notificationThreshold}
                    onChange={(e) => setSettings({ ...settings, notificationThreshold: e.target.value })}
                    className="mt-1 border-brand-300"
                    min="1"
                    max="50"
                    step="0.1"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Alert when price changes by this percentage or more
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                    Security
                  </CardTitle>
                  <CardDescription>System security and access settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="rounded-lg border border-brand-200/50 bg-brand-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Session Timeout</span>
                  <Badge variant="outline" className="border-brand-300">30 minutes</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Automatic logout after inactivity
                </p>
              </div>
              <div className="rounded-lg border border-brand-200/50 bg-brand-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Activity Logging</span>
                  <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">Enabled</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  All actions are logged for audit purposes
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                    Appearance
                  </CardTitle>
                  <CardDescription>Theme and display preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="theme" className="text-sm font-medium">Theme</Label>
                <select
                  id="theme"
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className="mt-1 w-full rounded-md border border-brand-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="default">Default (Purple & Gold)</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="rounded-lg border border-brand-200/50 bg-brand-50/50 p-4">
                <p className="text-xs text-muted-foreground">
                  Theme changes will be applied after page refresh
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-brand-700">Save Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Your settings will be saved and applied immediately
                </p>
              </div>
              <AnimatedButton
                onClick={handleSave}
                disabled={saving}
                className="gold-gradient-button rounded-lg"
              >
                {saving ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </AnimatedButton>
            </div>
            {saved && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  Settings saved successfully!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatedSection>
  );
}
