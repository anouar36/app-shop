// Cookie Management Demo Page for BAZAR
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Cookie, User, ShoppingCart, Heart, Eye, Search, 
  Settings, Trash2, Download, Upload, Shield
} from "lucide-react";
import Link from "next/link";

// Import Cookie Management System
import { GuestDataManager } from "@/lib/cookieManager";

export default function CookieManagementPage() {
  const [guestManager, setGuestManager] = useState(null);
  const [guestData, setGuestData] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [preferences, setPreferences] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const manager = new GuestDataManager();
      setGuestManager(manager);
      loadAllData(manager);
      setIsLoading(false);
    }
  }, []);

  const loadAllData = (manager) => {
    const allData = manager.exportGuestData();
    setGuestData(allData);
    setAnalytics(manager.getGuestAnalytics());
    setPreferences(manager.getPreferences());
  };

  const refreshData = () => {
    if (guestManager) {
      loadAllData(guestManager);
    }
  };

  const clearAllCookies = () => {
    if (guestManager) {
      guestManager.clearAllCookies();
      loadAllData(guestManager);
      alert('All cookies cleared!');
    }
  };

  const updatePreferences = (key, value) => {
    if (guestManager) {
      guestManager.savePreferences({ [key]: value });
      refreshData();
    }
  };

  const downloadData = () => {
    const dataStr = JSON.stringify(guestData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bazar_guest_data.json';
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cookie data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">BAZAR</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/checkout" className="text-gray-600 hover:text-gray-900">Cart</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Cookie className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Cookie Management</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See what data BAZAR saves to enhance your shopping experience. 
            All data is stored locally in your browser and helps us provide personalized features.
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button onClick={refreshData} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={downloadData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Data
          </Button>
          <Button onClick={clearAllCookies} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Cookies
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Guest Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Guest Analytics
              </CardTitle>
              <CardDescription>Your shopping behavior and statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Guest ID:</span>
                <span className="text-sm font-medium truncate ml-2">{analytics.guest_id?.slice(-8) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Visit Count:</span>
                <Badge variant="secondary">{analytics.visit_count || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cart Items:</span>
                <Badge variant="secondary">{analytics.cart_items || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Wishlist Items:</span>
                <Badge variant="secondary">{analytics.wishlist_items || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Recently Viewed:</span>
                <Badge variant="secondary">{analytics.recently_viewed_count || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Searches:</span>
                <Badge variant="secondary">{analytics.search_count || 0}</Badge>
              </div>
              {analytics.last_visit && (
                <div className="pt-2">
                  <span className="text-xs text-gray-500">Last visit: {new Date(analytics.last_visit).toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shopping Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Shopping Data
              </CardTitle>
              <CardDescription>Cart, wishlist, and product interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div>
                <h4 className="font-medium text-sm mb-2">Cart Items ({guestData.cart?.length || 0})</h4>
                {guestData.cart?.length > 0 ? (
                  <div className="space-y-1">
                    {guestData.cart.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                        Product ID: {item.id}, Qty: {item.quantity}
                      </div>
                    ))}
                    {guestData.cart.length > 3 && (
                      <div className="text-xs text-gray-500">+{guestData.cart.length - 3} more items</div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">No items in cart</div>
                )}
              </div>

              {/* Wishlist */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  Wishlist ({guestData.wishlist?.length || 0})
                </h4>
                {guestData.wishlist?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {guestData.wishlist.slice(0, 5).map((id, index) => (
                      <Badge key={index} variant="outline" className="text-xs">#{id}</Badge>
                    ))}
                    {guestData.wishlist.length > 5 && (
                      <Badge variant="outline" className="text-xs">+{guestData.wishlist.length - 5}</Badge>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">No wishlist items</div>
                )}
              </div>

              {/* Recently Viewed */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  Recently Viewed ({guestData.recently_viewed?.length || 0})
                </h4>
                {guestData.recently_viewed?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {guestData.recently_viewed.slice(0, 5).map((id, index) => (
                      <Badge key={index} variant="outline" className="text-xs">#{id}</Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">No recently viewed products</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preferences & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Preferences
              </CardTitle>
              <CardDescription>Your personalized settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="language" className="text-sm">Language</Label>
                <select 
                  id="language"
                  className="w-full mt-1 p-2 border rounded text-sm"
                  value={preferences.language || 'en'}
                  onChange={(e) => updatePreferences('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="tr">Türkçe</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div>
                <Label htmlFor="currency" className="text-sm">Currency</Label>
                <select 
                  id="currency"
                  className="w-full mt-1 p-2 border rounded text-sm"
                  value={preferences.currency || 'USD'}
                  onChange={(e) => updatePreferences('currency', e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="theme" className="text-sm">Theme</Label>
                <select 
                  id="theme"
                  className="w-full mt-1 p-2 border rounded text-sm"
                  value={preferences.theme || 'light'}
                  onChange={(e) => updatePreferences('theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="notifications"
                  checked={preferences.notifications !== false}
                  onChange={(e) => updatePreferences('notifications', e.target.checked)}
                />
                <Label htmlFor="notifications" className="text-sm">Enable notifications</Label>
              </div>

              {/* Search History */}
              {guestData.search_history?.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <Search className="h-3 w-3 mr-1" />
                    Recent Searches
                  </h4>
                  <div className="space-y-1">
                    {guestData.search_history.slice(0, 3).map((search, index) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded truncate">
                        "{search.query}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Privacy Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Privacy & Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none text-sm text-gray-600">
              <p className="mb-4">
                <strong>Your privacy is important to us.</strong> All data shown above is stored locally in your browser using cookies 
                and localStorage. This information is never sent to our servers without your explicit consent.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">What we store:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Shopping cart contents</li>
                    <li>Wishlist/favorite products</li>
                    <li>Recently viewed products</li>
                    <li>Search history</li>
                    <li>Language & theme preferences</li>
                    <li>Temporary checkout form data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Why we store it:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Remember your cart between visits</li>
                    <li>Provide personalized recommendations</li>
                    <li>Save your preferences</li>
                    <li>Improve your shopping experience</li>
                    <li>Pre-fill forms to save time</li>
                    <li>Show relevant products</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4">
                You can clear all this data at any time using the "Clear All Cookies" button above. 
                When you create an account, you'll have the option to migrate this data to your profile.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
