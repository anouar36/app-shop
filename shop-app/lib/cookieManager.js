// Cookie Management System for BAZAR E-commerce
// Saves client data when users are not signed in

class CookieManager {
  constructor() {
    this.cookiePrefix = 'bazar_';
    this.defaultOptions = {
      expires: 30, // 30 days default
      path: '/',
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax'
    };
  }

  // Set cookie with options
  setCookie(name, value, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    const cookieName = this.cookiePrefix + name;
    
    let cookieString = `${cookieName}=${encodeURIComponent(JSON.stringify(value))}`;
    
    if (opts.expires) {
      const date = new Date();
      date.setTime(date.getTime() + (opts.expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }
    
    if (opts.path) cookieString += `; path=${opts.path}`;
    if (opts.domain) cookieString += `; domain=${opts.domain}`;
    if (opts.secure) cookieString += `; secure`;
    if (opts.sameSite) cookieString += `; samesite=${opts.sameSite}`;
    
    document.cookie = cookieString;
    
    console.log(`🍪 Cookie set: ${cookieName}`, value);
  }

  // Get cookie value
  getCookie(name) {
    const cookieName = this.cookiePrefix + name;
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      let [key, value] = cookie.trim().split('=');
      if (key === cookieName) {
        try {
          return JSON.parse(decodeURIComponent(value));
        } catch (error) {
          console.error(`Error parsing cookie ${cookieName}:`, error);
          return null;
        }
      }
    }
    return null;
  }

  // Remove cookie
  removeCookie(name, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    const cookieName = this.cookiePrefix + name;
    
    let cookieString = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    if (opts.path) cookieString += `; path=${opts.path}`;
    if (opts.domain) cookieString += `; domain=${opts.domain}`;
    
    document.cookie = cookieString;
    console.log(`🗑️ Cookie removed: ${cookieName}`);
  }

  // Check if cookies are available
  areCookiesAvailable() {
    try {
      document.cookie = 'test=1';
      const available = document.cookie.indexOf('test=') !== -1;
      document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
      return available;
    } catch (error) {
      return false;
    }
  }

  // Get all BAZAR cookies
  getAllCookies() {
    const cookies = {};
    const allCookies = document.cookie.split(';');
    
    for (let cookie of allCookies) {
      let [key, value] = cookie.trim().split('=');
      if (key.startsWith(this.cookiePrefix)) {
        const cleanKey = key.replace(this.cookiePrefix, '');
        try {
          cookies[cleanKey] = JSON.parse(decodeURIComponent(value));
        } catch (error) {
          cookies[cleanKey] = decodeURIComponent(value);
        }
      }
    }
    return cookies;
  }

  // Clear all BAZAR cookies
  clearAllCookies() {
    const cookies = this.getAllCookies();
    Object.keys(cookies).forEach(key => {
      this.removeCookie(key);
    });
    console.log('🧹 All BAZAR cookies cleared');
  }
}

// Guest User Data Manager
class GuestDataManager extends CookieManager {
  constructor() {
    super();
    this.init();
  }

  init() {
    // Initialize default guest data structure
    this.ensureGuestData();
  }

  // Ensure guest data exists
  ensureGuestData() {
    if (!this.getCookie('guest_data')) {
      this.setCookie('guest_data', {
        id: this.generateGuestId(),
        created_at: new Date().toISOString(),
        last_visit: new Date().toISOString(),
        visit_count: 1
      }, { expires: 365 }); // 1 year for guest ID
    } else {
      // Update last visit
      const guestData = this.getCookie('guest_data');
      guestData.last_visit = new Date().toISOString();
      guestData.visit_count = (guestData.visit_count || 0) + 1;
      this.setCookie('guest_data', guestData, { expires: 365 });
    }
  }

  // Generate unique guest ID
  generateGuestId() {
    return 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Save cart data
  saveCart(cartItems) {
    this.setCookie('cart', cartItems, { expires: 7 }); // 7 days
    console.log('🛒 Cart saved to cookies', cartItems);
  }

  // Get cart data
  getCart() {
    return this.getCookie('cart') || [];
  }

  // Save user preferences
  savePreferences(preferences) {
    const current = this.getCookie('preferences') || {};
    const updated = { ...current, ...preferences };
    this.setCookie('preferences', updated, { expires: 90 }); // 3 months
    console.log('⚙️ Preferences saved', updated);
  }

  // Get user preferences
  getPreferences() {
    return this.getCookie('preferences') || {
      language: 'en',
      currency: 'USD',
      theme: 'light',
      notifications: true
    };
  }

  // Save recently viewed products
  saveRecentlyViewed(productId) {
    let recent = this.getCookie('recently_viewed') || [];
    
    // Remove if already exists
    recent = recent.filter(id => id !== productId);
    
    // Add to beginning
    recent.unshift(productId);
    
    // Keep only last 10
    recent = recent.slice(0, 10);
    
    this.setCookie('recently_viewed', recent, { expires: 30 });
    console.log('👁️ Recently viewed updated', recent);
  }

  // Get recently viewed products
  getRecentlyViewed() {
    return this.getCookie('recently_viewed') || [];
  }

  // Save search history
  saveSearchQuery(query) {
    if (!query || query.trim() === '') return;
    
    let searches = this.getCookie('search_history') || [];
    
    // Remove if already exists
    searches = searches.filter(search => search.query !== query);
    
    // Add to beginning with timestamp
    searches.unshift({
      query: query,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 20 searches
    searches = searches.slice(0, 20);
    
    this.setCookie('search_history', searches, { expires: 30 });
    console.log('🔍 Search history updated', searches);
  }

  // Get search history
  getSearchHistory() {
    return this.getCookie('search_history') || [];
  }

  // Save wishlist/favorites
  saveWishlist(productIds) {
    this.setCookie('wishlist', productIds, { expires: 90 }); // 3 months
    console.log('💝 Wishlist saved', productIds);
  }

  // Get wishlist
  getWishlist() {
    return this.getCookie('wishlist') || [];
  }

  // Add to wishlist
  addToWishlist(productId) {
    const wishlist = this.getWishlist();
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      this.saveWishlist(wishlist);
    }
  }

  // Remove from wishlist
  removeFromWishlist(productId) {
    const wishlist = this.getWishlist();
    const updated = wishlist.filter(id => id !== productId);
    this.saveWishlist(updated);
  }

  // Save checkout form data (temporary)
  saveCheckoutData(data) {
    this.setCookie('checkout_data', data, { expires: 1 }); // 1 day only
    console.log('📝 Checkout data saved (temporary)');
  }

  // Get checkout data
  getCheckoutData() {
    return this.getCookie('checkout_data') || {};
  }

  // Clear checkout data
  clearCheckoutData() {
    this.removeCookie('checkout_data');
  }

  // Save shipping address
  saveShippingAddress(address) {
    this.setCookie('shipping_address', address, { expires: 90 });
    console.log('🏠 Shipping address saved');
  }

  // Get shipping address
  getShippingAddress() {
    return this.getCookie('shipping_address') || {};
  }

  // Get guest analytics data
  getGuestAnalytics() {
    const guestData = this.getCookie('guest_data') || {};
    const cart = this.getCart();
    const preferences = this.getPreferences();
    const recentlyViewed = this.getRecentlyViewed();
    const searchHistory = this.getSearchHistory();
    const wishlist = this.getWishlist();

    return {
      guest_id: guestData.id,
      visit_count: guestData.visit_count || 0,
      cart_items: cart.length,
      wishlist_items: wishlist.length,
      recently_viewed_count: recentlyViewed.length,
      search_count: searchHistory.length,
      last_visit: guestData.last_visit,
      preferences: preferences
    };
  }

  // Export all guest data (for potential account creation)
  exportGuestData() {
    return {
      guest_data: this.getCookie('guest_data'),
      cart: this.getCart(),
      preferences: this.getPreferences(),
      recently_viewed: this.getRecentlyViewed(),
      search_history: this.getSearchHistory(),
      wishlist: this.getWishlist(),
      checkout_data: this.getCheckoutData(),
      shipping_address: this.getShippingAddress()
    };
  }

  // Migrate guest data to user account (when user signs up)
  migrateToUser(userId) {
    const guestData = this.exportGuestData();
    
    // Save migration data with user ID
    this.setCookie('migration_data', {
      user_id: userId,
      guest_data: guestData,
      migrated_at: new Date().toISOString()
    }, { expires: 7 }); // Keep for 7 days for verification

    console.log('🔄 Guest data prepared for migration to user:', userId);
    return guestData;
  }

  // Clear guest data after successful migration
  clearGuestData() {
    const keysToKeep = ['preferences']; // Keep some preferences
    const allCookies = this.getAllCookies();
    
    Object.keys(allCookies).forEach(key => {
      if (!keysToKeep.includes(key)) {
        this.removeCookie(key);
      }
    });
    
    console.log('🧹 Guest data cleared after migration');
  }
}

// Create global instances
if (typeof window !== 'undefined') {
  window.cookieManager = new CookieManager();
  window.guestDataManager = new GuestDataManager();
}

export { CookieManager, GuestDataManager };
export default GuestDataManager;
