"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import "./animations.css";

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [recentOrdersData, setRecentOrdersData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation and interaction states
  const [menuTransition, setMenuTransition] = useState(false);
  const [cardHoverStates, setCardHoverStates] = useState({});
  const [buttonClickStates, setButtonClickStates] = useState({});
    // Notification states
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [lastOrderCheck, setLastOrderCheck] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [allNotifications, setAllNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  // Product management states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Order management states
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [orderStats, setOrderStats] = useState(null);
  
  // Enhanced order filters with product filter
  const [orderFilters, setOrderFilters] = useState({
    status: 'all',
    search: '',
    product: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  
  const [orderPagination, setOrderPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0
  });
  
  // Customer management states
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  
  const [productFormData, setProductFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    current_price: '',
    description: '',
    size: '',
    images: []
  });
  
  const router = useRouter();  useEffect(() => {
    setMounted(true);
    checkAuth();
    fetchDashboardData();
    
    // Simulate chart loading
    const timer = setTimeout(() => {
      setChartLoaded(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  // Fetch products when activeMenu changes to products
  useEffect(() => {
    if (activeMenu === 'products') {
      fetchProducts();
    }  }, [activeMenu]);  
  
  // Fetch orders when activeMenu changes to orders
  useEffect(() => {
    if (activeMenu === 'orders' && mounted && !fetchingOrders) {
      console.log('useEffect[activeMenu]: Switching to orders tab, fetching data');
      // Fetch orders and stats, but handle them independently
      fetchOrders(1); // Start from page 1
      fetchOrderStats(); // This won't show error toast if it fails
    }
    
    if (activeMenu === 'customers' && mounted) {
      console.log('useEffect[activeMenu]: Switching to customers tab, fetching data');
      fetchCustomers();
    }
  }, [activeMenu, mounted]);
  // Debounce search filter changes (only when orders menu is active)
  useEffect(() => {
    if (activeMenu === 'orders' && mounted && !fetchingOrders) {
      console.log('useEffect[filters]: Order filters changed, debouncing search');
      const timeoutId = setTimeout(() => {
        console.log('useEffect[filters]: Debounce timeout, fetching orders');
        fetchOrders(1); // Reset to page 1 when filters change
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [orderFilters.search, orderFilters.status, orderFilters.product, orderFilters.sort_by, orderFilters.sort_order, mounted]);
    // New order checking interval
  useEffect(() => {
    if (mounted) {
      // Check for new orders every 30 seconds
      const interval = setInterval(checkForNewOrders, 30000);
      // Initial check
      setTimeout(checkForNewOrders, 2000);
      
      return () => clearInterval(interval);
    }
  }, [mounted, lastOrderCheck]);

  // Fetch notifications and unread count on mount
  useEffect(() => {
    if (mounted) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Refresh notifications every 60 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [mounted]);

  // Fetch notifications when notifications panel is opened
  useEffect(() => {
    if (showNotifications && mounted) {
      fetchNotifications();
    }
  }, [showNotifications, mounted]);
  
  // Clear new orders count when orders menu is accessed
  useEffect(() => {
    if (activeMenu === 'orders' && newOrdersCount > 0) {
      setTimeout(() => {
        setNewOrdersCount(0);
        setNotifications([]);
      }, 1000);
    }
  }, [activeMenu]);

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    
    if (!token || !userData) {
      toast.error("Please login to access admin dashboard");
      router.push('/admin');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      toast.error("Invalid user data. Please login again.");
      logout();
    }
  };  const fetchDashboardData = async (showRefreshMessage = false) => {
    const token = localStorage.getItem('admin_token');
    
    if (!token) return;
    
    if (showRefreshMessage) {
      setRefreshing(true);
      toast.info("Refreshing dashboard data...");
    }
    
    try {      const response = await fetch('http://127.0.0.1:8001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApiStats(data.stats);
        
        // Set recent orders from API if available
        if (data.stats.recent_orders) {
          setRecentOrdersData(data.stats.recent_orders);
        }
        
        // Set top products from API if available
        if (data.stats.top_products) {
          setTopProductsData(data.stats.top_products);
        }
        
        if (showRefreshMessage) {
          toast.success("Dashboard data refreshed successfully!");
        }
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to load dashboard data");
      }
    } catch (error) {
      console.error('Dashboard API error:', error);
      toast.error("Connection error. Check if backend is running.");
    }
    
    setIsLoading(false);
    setRefreshing(false);
  };
  // Add refresh function
  const refreshDashboard = () => {
    fetchDashboardData(true);
  };
  // Add logout function
  const logout = () => {
    // Clear authentication data
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    // Show logout message
    toast.success("Logged out successfully!");
    
    // Redirect to admin login page
    router.push('/admin');
  };
  
  // Animation and interaction functions
  const handleMenuTransition = (menuId) => {
    setMenuTransition(true);
    setTimeout(() => {
      setActiveMenu(menuId);
      setMenuTransition(false);
    }, 150);
  };
  
  const handleCardHover = (cardId, isHovered) => {
    setCardHoverStates(prev => ({
      ...prev,
      [cardId]: isHovered
    }));
  };
  
  const handleButtonClick = (buttonId) => {
    setButtonClickStates(prev => ({
      ...prev,
      [buttonId]: true
    }));
    setTimeout(() => {
      setButtonClickStates(prev => ({
        ...prev,
        [buttonId]: false
      }));
    }, 200);
  };
  
  // New order notification system
  const checkForNewOrders = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/admin/orders?per_page=50&sort_by=created_at&sort_order=desc`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const recentOrders = data.data.filter(order => 
          new Date(order.created_at) > lastOrderCheck
        );
        
        if (recentOrders.length > 0) {
          setNewOrdersCount(prev => prev + recentOrders.length);
          const newNotifications = recentOrders.map(order => ({
            id: Date.now() + Math.random(),
            type: 'new_order',
            message: `New order ${order.order_number} from ${order.customer}`,
            timestamp: new Date(),
            orderId: order.id
          }));
          
          setNotifications(prev => [...newNotifications, ...prev].slice(0, 10));
          
          // Show toast notification for new orders
          if (recentOrders.length === 1) {
            toast.success(`New order received: ${recentOrders[0].order_number}`);
          } else {
            toast.success(`${recentOrders.length} new orders received!`);
          }
        }
        
        setLastOrderCheck(new Date());
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  };
  
  // Enhanced filter handling with product filter  // Product management functions
  const fetchProducts = async () => {
    setLoadingProducts(true);    try {
      const response = await fetch('http://127.0.0.1:8001/api/products', {
        headers: {
          'Content-Type': 'application/json'
          // No authorization needed - products API is public
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error("Connection error while fetching products");
    }    setLoadingProducts(false);
  };  // Order management functions
  const fetchOrders = async (page = 1) => {
    // Don't fetch if component is not mounted (SSR issue)
    if (!mounted) {
      console.log('fetchOrders: Component not mounted yet, skipping');
      return;
    }
    
    // Prevent duplicate calls
    if (fetchingOrders) {
      console.log('fetchOrders: Already fetching, skipping duplicate call');
      return;
    }
    
    setLoadingOrders(true);
    setFetchingOrders(true);
    
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      console.warn('fetchOrders: No admin token found in localStorage');
      setLoadingOrders(false);
      setFetchingOrders(false);
      return;
    }    try {      
      // Ensure all filter parameters are properly formatted including product filter
      const safeFilters = {
        status: orderFilters.status || 'all',
        search: orderFilters.search || '',
        product: orderFilters.product || '',
        sort_by: orderFilters.sort_by || 'created_at',
        sort_order: orderFilters.sort_order || 'desc'
      };
      
      // Remove empty filters to clean up the URL
      const cleanFilters = Object.fromEntries(
        Object.entries(safeFilters).filter(([key, value]) => value !== '' && value !== 'all')
      );
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: orderPagination.per_page.toString(),
        ...cleanFilters
      });

      console.log('fetchOrders: Making request with params:', {
        page,
        per_page: orderPagination.per_page,
        ...cleanFilters
      });
      console.log('fetchOrders: Full URL:', `http://127.0.0.1:8001/api/admin/orders?${queryParams}`);

      const response = await fetch(`http://127.0.0.1:8001/api/admin/orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('fetchOrders: Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('fetchOrders: Success! Orders received:', data.data.length);
        setOrders(data.data);
        setOrderPagination(data.pagination);
      } else if (response.status === 401) {
        console.error('fetchOrders: Unauthorized (401) - token may be expired');
        toast.error("Session expired. Please login again.");
        logout();
        return;      } else {
        let errorMessage = "Failed to fetch orders";
        try {
          const errorData = await response.json();
          console.error('fetchOrders: API error response:', errorData);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.error) {
            console.error('fetchOrders: Detailed error:', errorData.error);
          }
        } catch (e) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('fetchOrders: API error', response.status, errorText);
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('fetchOrders: Network/JS error:', error);
      toast.error("Connection error while fetching orders");
    } finally {
      setLoadingOrders(false);
      setFetchingOrders(false);
    }
  };
  const fetchOrderStats = async () => {
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      console.warn('fetchOrderStats: No admin token found');
      return;
    }

    try {
      console.log('fetchOrderStats: Fetching order statistics...');
      const response = await fetch('http://127.0.0.1:8001/api/admin/orders/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('fetchOrderStats: Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('fetchOrderStats: Success! Stats received:', data.stats);
        setOrderStats(data.stats);
      } else if (response.status === 401) {
        console.error('fetchOrderStats: Unauthorized (401) - token expired');
        logout();
        return;
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('fetchOrderStats: API error', response.status, errorText);
        // Don't show error toast for statistics - it's not critical
        console.warn('Order statistics could not be loaded, but this won\'t affect main functionality');
      }
    } catch (error) {
      console.error('fetchOrderStats: Network/JS error:', error);
      // Don't show error toast for statistics - it's not critical
      console.warn('Order statistics could not be loaded due to network error');
    }
  };
  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('admin_token');
    
    if (!token) return;

    try {
      const response = await fetch(`http://127.0.0.1:8001/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success("Order status updated successfully!");
        fetchOrders(orderPagination.current_page);
        fetchOrderStats();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to update order status");
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error("Connection error while updating order status");
    }
  };
  
  // Customer management functions
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      console.warn('fetchCustomers: No admin token found in localStorage');
      setLoadingCustomers(false);
      return;
    }

    try {
      console.log('fetchCustomers: Making request for customer data');
      const response = await fetch(`http://127.0.0.1:8001/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('fetchCustomers: Success! Customers received:', data.length);
        setCustomers(data);
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        return;
      } else {
        toast.error("Failed to fetch customers");
      }
    } catch (error) {
      console.error('fetchCustomers: Network/JS error:', error);
      toast.error("Connection error while fetching customers");
    } finally {
      setLoadingCustomers(false);
    }
  };
    // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
      toast.error("Failed to copy to clipboard");
    });
  };

  // Notification management functions
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    const token = localStorage.getItem('admin_token');

    if (!token) {
      setLoadingNotifications(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8001/api/admin/notifications?per_page=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllNotifications(data.data);
      } else if (response.status === 401) {
        logout();
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch('http://127.0.0.1:8001/api/admin/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadNotificationsCount(data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`http://127.0.0.1:8001/api/admin/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setAllNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        );
        fetchUnreadCount(); // Refresh count
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch('http://127.0.0.1:8001/api/admin/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAllNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
        );
        setUnreadNotificationsCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`http://127.0.0.1:8001/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAllNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        fetchUnreadCount(); // Refresh count
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleOrderFilterChange = (field, value) => {
    setOrderFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setOrderPagination(prev => ({
      ...prev,
      current_page: 1
    }));
  };
  
  const fetchCategories = async () => {
    try {      const response = await fetch('http://127.0.0.1:8001/api/categories', {
        headers: {
          'Content-Type': 'application/json'
          // No authorization needed - categories API is public
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        toast.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error("Connection error while fetching categories");
    }
  };
  const handleAddProduct = async (e) => {
    e.preventDefault();
    // No token required for public API, but keep for future admin-only endpoints
    // const token = localStorage.getItem('admin_token');

    // Validation
    if (!productFormData.name || !productFormData.category_id || !productFormData.price || !productFormData.current_price || !productFormData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', productFormData.name);
      formData.append('category_id', parseInt(productFormData.category_id));
      formData.append('price', parseFloat(productFormData.price));
      formData.append('current_price', parseFloat(productFormData.current_price));
      formData.append('description', productFormData.description);
      formData.append('size', productFormData.size || '');

      // Add all images if present
      if (productFormData.images && productFormData.images.length > 0) {
        productFormData.images.forEach((img, idx) => {
          formData.append('images[]', img);
        });
      }

      const response = await fetch('http://127.0.0.1:8001/api/products', {
        method: 'POST',
        // Don't set Content-Type for FormData, let browser set it
        body: formData
      });

      if (response.ok) {
        const newProduct = await response.json();
        toast.success("Product added successfully!");
        setShowAddProductModal(false);
        setProductFormData({
          name: '',
          category_id: '',
          price: '',
          current_price: '',
          description: '',
          size: '',
          images: []
        });
        fetchProducts();
        fetchDashboardData();
      } else {
        let errorMessage = "Failed to add product";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = response.statusText || errorMessage;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error("Connection error: Cannot reach the server. Please check if the backend is running.");
      } else if (error.message.includes('JSON')) {
        toast.error("Server response error. Please try again.");
      } else {    
        toast.error("Connection error. Please try again.");
      }
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductFormData(prev => ({      
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setProductFormData(prev => ({
        ...prev,
        images: prev.images ? [...prev.images, ...files] : files
      }));
    }
  };
  const removeImage = (indexToRemove) => {
    setProductFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const openAddProductModal = () => {
    setActiveMenu('products'); // Switch to products view
    setShowAddProductModal(true);
    fetchCategories(); // Fetch categories when opening the modal
  };

  // Function to render content based on active menu
  const renderMainContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return renderDashboardContent();
      case 'orders':
        return renderOrdersContent();
      case 'products':
        return renderProductsContent();
      case 'customers':
        return renderCustomersContent();
      case 'analytics':
        return renderAnalyticsContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return renderDashboardContent();
    }
  };
  const renderDashboardContent = () => (
    <>
      {/* Enhanced Stats with Animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, i) => (
          <Card 
            key={i} 
            className="relative overflow-hidden transition-all duration-500 hover:shadow-xl group cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50"
            style={{
              animationDelay: `${i * 100}ms`,
              animation: 'slideInUp 0.8s ease-out forwards',
              transform: cardHoverStates[`stat-${i}`] ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)'
            }}
            onMouseEnter={() => handleCardHover(`stat-${i}`, true)}
            onMouseLeave={() => handleCardHover(`stat-${i}`, false)}
            onClick={() => handleButtonClick(`stat-${i}`)}
          >
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full blur-lg group-hover:animate-bounce"></div>
            </div>
            
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className={`text-3xl font-bold transition-all duration-300 ${stat.textColor} group-hover:scale-110`}>
                      {stat.value}
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full transition-all duration-300 ${
                      stat.change.startsWith('+') 
                        ? 'text-green-600 bg-green-100 group-hover:bg-green-200' 
                        : 'text-red-600 bg-red-100 group-hover:bg-red-200'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                
                <div className={`relative transition-all duration-300 transform group-hover:scale-125 group-hover:rotate-12`}>
                  <div className={`size-14 rounded-2xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <div className="transition-all duration-300 group-hover:scale-110">
                      {stat.icon}
                    </div>
                  </div>
                  
                  {/* Pulse effect */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-30 animate-ping`}></div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4 space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${stat.bgColor.replace('from-', 'from-').replace('to-', 'to-')} transition-all duration-1000 ease-out`}
                    style={{
                      width: cardHoverStates[`stat-${i}`] ? '100%' : `${Math.min(100, parseInt(stat.value) || 75)}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                  {stat.title === 'Total Users' ? 'Active users this month' :
                   stat.title === 'Total Products' ? 'Items in catalog' :
                   stat.title === 'Total Orders' ? 'Orders processed' :
                   'Categories available'}
                </p>
              </div>
            </CardContent>
            
            {/* Click ripple effect */}
            {buttonClickStates[`stat-${i}`] && (
              <div className="absolute inset-0 bg-white/30 animate-ping rounded-lg"></div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-8">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 animate-slide-up overflow-hidden" style={{animationDelay: "0.2s"}}>
          <CardHeader className="pb-4 border-b border-border/40">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>You have {recentOrders.length} orders this week</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveMenu('orders')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path>
                  <path d="M8 5v0a2 2 0 0 1 2 2v0"></path>
                  <path d="M2 12h10"></path>
                  <path d="M12 2v10"></path>
                  <path d="M9 5h6a2 2 0 0 1 2 2v6"></path>
                </svg>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 md:px-2 pt-0">            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b border-border/40 [&>th]:px-2 [&>th]:py-1.5 text-xs font-medium text-muted-foreground">
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors group [&>td]:px-2 [&>td]:py-1.5 text-xs">
                      <td className="font-medium text-primary">
                        {order.id}
                      </td>
                      <td className="truncate max-w-[120px]">
                        {order.customer}
                      </td>
                      <td className="text-muted-foreground">
                        {order.date}
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-1.5 py-0 rounded-full text-[10px] font-medium transition-colors ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          <span className={`mr-0.5 size-1 rounded-full ${
                            order.status === 'Completed' ? 'bg-green-600' : 
                            order.status === 'Processing' ? 'bg-blue-600' : 
                            'bg-amber-600'
                          }`}></span>
                          {order.status}
                        </span>
                      </td>
                      <td className="font-medium text-right">
                        {order.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/40 flex justify-center py-3">
            <Button variant="ghost" size="sm" className="text-sm gap-1 hover:text-primary transition-colors" onClick={() => setActiveMenu('orders')}>
              View All Orders
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>
          </CardFooter>
        </Card>

        {/* Top Products */}
        <Card className="animate-slide-up" style={{animationDelay: "0.3s"}}>
          <CardHeader className="pb-4 border-b border-border/40">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling products this month</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="size-9 p-0" onClick={() => setActiveMenu('products')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-4">
              {topProducts.map((product, i) => (
                <li key={product.id} className="flex items-center gap-3 p-1 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="size-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-sm font-bold text-primary border border-primary/10 transition-all group-hover:border-primary/20">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{product.sales} sales</span>
                      <span className="text-xs text-green-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5">
                          <path d="m5 12 7-7 7 7"></path>
                          <path d="M12 19V5"></path>
                        </svg>
                        {product.growth}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{product.revenue}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="border-t border-border/40 flex justify-center py-3">
            <Button variant="ghost" size="sm" className="text-sm gap-1 hover:text-primary transition-colors" onClick={() => setActiveMenu('products')}>
              View All Products
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Chart Tabs */}
      <Card className="animate-slide-up overflow-hidden" style={{animationDelay: "0.4s"}}>
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Store performance for the last 30 days</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                This Month
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M21 15V6" />
                  <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path d="M12 12H3" />
                  <path d="M16 6H3" />
                  <path d="M12 18H3" />
                </svg>
                Filter
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M21 14V8H8l-7 8v-8" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                </svg>
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <Tabs defaultValue="sales">
            <TabsList className="mb-6 bg-muted/50">
              <TabsTrigger value="sales" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                Sales
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                Orders
              </TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                Customers
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sales" className="relative">
              <div className={`h-72 bg-gradient-to-br from-background to-muted/20 rounded-lg border border-border/40 flex items-center justify-center transition-opacity duration-500 ${chartLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <div className="relative w-full h-full p-4">
                  <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden">
                    <div className="flex items-end h-full px-2">
                      {generateChartData().map((item, i) => (
                        <div 
                          key={i} 
                          className="flex-1 mx-0.5 bg-gradient-to-t from-primary/60 to-primary/30 rounded-t hover:bg-primary/80 transition-all hover:-translate-y-1 group relative"
                          style={{ 
                            height: `${item.value}%`,
                            animationDelay: `${i * 0.03}s`,
                            animation: chartLoaded ? 'slideUp 0.5s ease-out forwards' : 'none'
                          }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {item.value} sales
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pb-1 text-xs text-muted-foreground border-t border-border/40">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                  </div>
                </div>
              </div>
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${chartLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin size-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-muted-foreground">Loading chart data...</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="orders" className="space-y-4">
              <div className="h-72 bg-gradient-to-br from-background to-muted/20 rounded-lg border border-border/40 flex items-center justify-center">
                <p className="text-muted-foreground text-center">Orders chart visualization would appear here</p>
              </div>
            </TabsContent>
            <TabsContent value="customers" className="space-y-4">
              <div className="h-72 bg-gradient-to-br from-background to-muted/20 rounded-lg border border-border/40 flex items-center justify-center">
                <p className="text-muted-foreground text-center">Customers chart visualization would appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
  const renderOrdersContent = () => (
    <div className="space-y-6">
      {/* Order Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orderStats?.total || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Orders</p>
                <p className="text-2xl font-bold text-orange-600">{orderStats?.new || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-orange-600">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{orderStats?.processing || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600">
                  <path d="M12 2v20m8-10H4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{orderStats?.completed || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-600">
                  <path d="m9 12 2 2 4-4" />
                  <path d="M21 12c.552 0 1-.448 1-1V8c0-.552-.448-1-1-1s-1 .448-1 1v3c0 .552.448 1 1 1z" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Management */}
      <Card>
        <CardHeader>          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Orders Management
              </CardTitle>
              <CardDescription>
                Filter and manage all store orders ({orderPagination.total} total)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/admin/invoices')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Daily Invoice
              </Button>
              <Button onClick={() => fetchOrders(orderPagination.current_page)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M3 21v-5h5"></path> 
                </svg> 
                Refresh
              </Button>
            </div> 
          </div>
        </CardHeader>
        <CardContent>          {/* Enhanced Filters with Modern Design */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <h3 className="text-sm font-semibold text-gray-700">Filter & Search Orders</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Filter */}
              <div className="space-y-2">
                <Label htmlFor="search-orders" className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  Search Orders
                </Label>
                <Input
                  id="search-orders"
                  placeholder="Customer name, email, phone..."
                  value={orderFilters.search}
                  onChange={(e) => handleOrderFilterChange('search', e.target.value)}
                  className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>

              {/* Product Filter */}
              <div className="space-y-2">
                <Label htmlFor="product-filter" className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  Filter by Product
                </Label>
                <Input
                  id="product-filter"
                  placeholder="Product name..."
                  value={orderFilters.product}
                  onChange={(e) => handleOrderFilterChange('product', e.target.value)}
                  className="h-9 text-sm border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6"></path>
                  </svg>
                  Status
                </Label>
                <Select value={orderFilters.status} onValueChange={(value) => handleOrderFilterChange('status', value)}>
                  <SelectTrigger id="status-filter" className="h-9 text-sm border-gray-300 focus:border-purple-500">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">🆕 New</SelectItem>
                    <SelectItem value="processing">⚙️ Processing</SelectItem>
                    <SelectItem value="route">🚚 On Route</SelectItem>
                    <SelectItem value="changed">🔄 Changed</SelectItem>
                    <SelectItem value="completed">✅ Completed</SelectItem>
                    <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="space-y-2">
                <Label htmlFor="sort-filter" className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M7 12h10"></path>
                    <path d="M10 18h4"></path>
                  </svg>
                  Sort By
                </Label>
                <Select value={`${orderFilters.sort_by}_${orderFilters.sort_order}`} onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('_');
                  handleOrderFilterChange('sort_by', sortBy);
                  handleOrderFilterChange('sort_order', sortOrder);
                }}>
                  <SelectTrigger id="sort-filter" className="h-9 text-sm border-gray-300 focus:border-orange-500">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at_desc">📅 Newest First</SelectItem>
                    <SelectItem value="created_at_asc">📅 Oldest First</SelectItem>
                    <SelectItem value="status_asc">📊 Status A-Z</SelectItem>
                    <SelectItem value="status_desc">📊 Status Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Filter Summary */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Active filters:</span>
                {orderFilters.search && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Search: {orderFilters.search}</span>
                )}
                {orderFilters.product && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Product: {orderFilters.product}</span>
                )}
                {orderFilters.status !== 'all' && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Status: {orderFilters.status}</span>
                )}
              </div>
              
              {(orderFilters.search || orderFilters.product || orderFilters.status !== 'all') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setOrderFilters({
                      status: 'all',
                      search: '',
                      product: '',
                      sort_by: 'created_at',
                      sort_order: 'desc'
                    });
                  }}
                  className="text-xs h-7 text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>          {/* Enhanced Orders Table with Animations */}
          {loadingOrders ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-medium">Loading orders...</p>
                <p className="text-gray-400 text-sm">Please wait while we fetch your data</p>
              </div>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {/* Orders Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Orders</p>
                      <p className="text-blue-800 text-2xl font-bold">{orderPagination.total}</p>
                    </div>
                    <div className="bg-blue-500 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <path d="M3 6h18" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Completed</p>
                      <p className="text-green-800 text-2xl font-bold">
                        {orders.filter(o => o.status === 'completed').length}
                      </p>
                    </div>
                    <div className="bg-green-500 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12l2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">Processing</p>
                      <p className="text-yellow-800 text-2xl font-bold">
                        {orders.filter(o => o.status === 'processing').length}
                      </p>
                    </div>
                    <div className="bg-yellow-500 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">New Orders</p>
                      <p className="text-purple-800 text-2xl font-bold">
                        {orders.filter(o => o.status === 'new').length}
                      </p>
                    </div>
                    <div className="bg-purple-500 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>              {/* Ultra-Compact Professional Orders Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5">
                {orders.map((order, index) => (
                  <div
                    key={order.id}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-150 transform hover:-translate-y-0.5 ${
                      cardHoverStates[`order-${order.id}`] ? 'scale-[1.02] shadow-lg border-blue-300 bg-blue-50/30' : ''
                    }`}
                    style={{
                      opacity: 0,
                      animation: `fadeInUp 0.4s ease-out ${index * 0.05}s forwards`
                    }}
                    onMouseEnter={() => handleCardHover(`order-${order.id}`, true)}
                    onMouseLeave={() => handleCardHover(`order-${order.id}`, false)}
                  >
                    <div className="p-2.5">
                      {/* Compact Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {order.order_number.slice(-2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-xs truncate">{order.order_number}</h3>
                            <p className="text-gray-500 text-[10px]">{order.date_creation}</p>
                          </div>
                        </div>
                        
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium flex-shrink-0 ml-1 ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'route' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'new' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'changed' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status === 'completed' ? '✅' :
                           order.status === 'processing' ? '⚙️' :
                           order.status === 'route' ? '🚚' :
                           order.status === 'new' ? '🆕' :
                           order.status === 'changed' ? '🔄' :
                           order.status === 'cancelled' ? '❌' :
                           '◯'}
                        </span>
                      </div>
                      
                      {/* Compact Content */}
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-[10px] w-12 flex-shrink-0">Customer</span>
                          <span className="font-medium text-gray-900 text-[10px] truncate ml-1" title={order.customer}>
                            {order.customer}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-[10px] w-12 flex-shrink-0">Product</span>
                          <span className="font-medium text-gray-900 text-[10px] truncate ml-1" title={order.product_name}>
                            {order.product_name}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-0.5 border-t border-gray-100">
                          <span className="text-gray-500 text-[10px]">Total</span>
                          <span className="font-bold text-green-600 text-xs">{order.total}</span>
                        </div>
                      </div>
                      
                      {/* Compact Actions */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100">
                        <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                          <SelectTrigger className="w-20 h-5 px-1.5 text-[10px] border-gray-300 hover:border-gray-400 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">🆕 New</SelectItem>
                            <SelectItem value="processing">⚙️ Processing</SelectItem>
                            <SelectItem value="route">🚚 On Route</SelectItem>
                            <SelectItem value="completed">✅ Completed</SelectItem>
                            <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="flex items-center space-x-0.5">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 w-5 p-0 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150"
                            onClick={() => handleButtonClick(`view-${order.id}`)}
                            title="View Order"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 w-5 p-0 hover:bg-green-50 hover:text-green-600 transition-all duration-150"
                            onClick={() => handleButtonClick(`edit-${order.id}`)}
                            title="Edit Order"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}              </div>

              {/* Enhanced Professional Pagination */}
              {orderPagination.last_page > 1 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 order-2 sm:order-1">
                      Showing <span className="font-medium">{orderPagination.from || 0}</span> to <span className="font-medium">{orderPagination.to || 0}</span> of <span className="font-medium">{orderPagination.total}</span> orders
                    </div>
                    
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                      {/* First Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={orderPagination.current_page === 1}
                        onClick={() => fetchOrders(1)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
                        title="First page"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m11 17-5-5 5-5" />
                          <path d="m18 17-5-5 5-5" />
                        </svg>
                      </Button>
                      
                      {/* Previous Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={orderPagination.current_page === 1}
                        onClick={() => fetchOrders(orderPagination.current_page - 1)}
                        className="h-8 px-3 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 text-xs"
                      >
                        Previous
                      </Button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {(() => {
                          const pages = [];
                          const current = orderPagination.current_page;
                          const total = orderPagination.last_page;
                          
                          // Always show first page
                          if (current > 3) {
                            pages.push(
                              <Button
                                key={1}
                                variant="outline"
                                size="sm"
                                onClick={() => fetchOrders(1)}
                                className="h-8 w-8 p-0 text-xs hover:bg-blue-50 hover:border-blue-300"
                              >
                                1
                              </Button>
                            );
                            if (current > 4) {
                              pages.push(<span key="dots1" className="text-gray-400 px-1">...</span>);
                            }
                          }
                          
                          // Show pages around current page
                          for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
                            pages.push(
                              <Button
                                key={i}
                                variant={i === current ? "default" : "outline"}
                                size="sm"
                                onClick={() => fetchOrders(i)}
                                className={`h-8 w-8 p-0 text-xs ${
                                  i === current 
                                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                                    : "hover:bg-blue-50 hover:border-blue-300"
                                }`}
                              >
                                {i}
                              </Button>
                            );
                          }
                          
                          // Always show last page
                          if (current < total - 2) {
                            if (current < total - 3) {
                              pages.push(<span key="dots2" className="text-gray-400 px-1">...</span>);
                            }
                            pages.push(
                              <Button
                                key={total}
                                variant="outline"
                                size="sm"
                                onClick={() => fetchOrders(total)}
                                className="h-8 w-8 p-0 text-xs hover:bg-blue-50 hover:border-blue-300"
                              >
                                {total}
                              </Button>
                            );
                          }
                          
                          return pages;
                        })()}
                      </div>
                      
                      {/* Next Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={orderPagination.current_page === orderPagination.last_page}
                        onClick={() => fetchOrders(orderPagination.current_page + 1)}
                        className="h-8 px-3 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 text-xs"
                      >
                        Next
                      </Button>
                      
                      {/* Last Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={orderPagination.current_page === orderPagination.last_page}
                        onClick={() => fetchOrders(orderPagination.last_page)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
                        title="Last page"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m13 17 5-5-5-5" />
                          <path d="m6 17 5-5-5-5" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Page Size Selector */}
                  <div className="flex items-center justify-center mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Show:</span>
                      <Select 
                        value={orderPagination.per_page.toString()} 
                        onValueChange={(value) => {
                          setOrderPagination(prev => ({
                            ...prev,
                            per_page: parseInt(value),
                            current_page: 1
                          }));
                          fetchOrders(1);
                        }}
                      >
                        <SelectTrigger className="w-20 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                      <span>per page</span>
                    </div>
                  </div>
                </div>
              )}</div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No orders found. {orderFilters.status !== 'all' || orderFilters.search || orderFilters.product ? 'Try adjusting your filters.' : 'Orders will appear here once customers start placing them.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderProductsContent = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
          Products Management
        </CardTitle>
        <CardDescription>Manage your product catalog</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button className="flex-1" onClick={() => setShowAddProductModal(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              Add Product
            </Button>
            <Button variant="outline" onClick={refreshDashboard}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
              </svg>
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{apiStats?.total_products || 0}</div>
              <div className="text-sm text-muted-foreground">Total Products</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{apiStats?.total_categories || 0}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-muted-foreground">Low Stock</div>
            </div>
          </div>          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">All Products</h3>
              <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loadingProducts}>
                {loadingProducts ? "Loading..." : "Refresh"}
              </Button>
            </div>
            {loadingProducts ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading products...
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-2">                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">                      {product.image ? (
                        <img 
                          src={`http://127.0.0.1:8001/${product.image}`}
                          alt={product.name}
                          className="size-12 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border">
                          #{product.id}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                        <div className="text-xs text-gray-500">Size: {product.size || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${product.current_price}</div>
                      {product.price !== product.current_price && (
                        <div className="text-sm text-gray-500 line-through">${product.price}</div>
                      )}                      <div className="text-xs text-blue-600">Category ID: {product.category_id}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No products found. Add your first product to get started.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  const renderCustomersContent = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Customers Management
        </CardTitle>
        <CardDescription>Manage your customers and user accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <Button className="flex-1" onClick={fetchCustomers}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M3 21v-5h5"></path>
                </svg>
                Refresh
              </Button>
            </div>
            <div className="w-full sm:w-auto">
              <Input 
                type="search" 
                placeholder="Search customers..." 
                value={customerSearch} 
                onChange={e => setCustomerSearch(e.target.value)}
                className="min-w-[200px]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{customers.length || apiStats?.total_users || 0}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.role?.role_name !== 'admin').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Customers</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {customers.filter(c => c.role?.role_name === 'admin').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Admin Users</div>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Customer Management</h3>
            {loadingCustomers ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : customers && customers.length > 0 ? (              <div className="overflow-x-auto">                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-left border-b border-border/40 [&>th]:px-1 [&>th]:py-1 font-medium text-muted-foreground">
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers
                      .filter(customer => 
                        customerSearch === '' || 
                        customer.name?.toLowerCase().includes(customerSearch.toLowerCase()) || 
                        customer.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        customer.phone?.includes(customerSearch))
                      .map((customer) => (
                      <tr key={customer.id} className="hover:bg-muted/50 transition-colors group [&>td]:px-1 [&>td]:py-1">
                        <td className="font-medium">{customer.id}</td>
                        <td className="truncate max-w-[100px]">{customer.name} {customer.last_name || ''}</td>
                        <td className="max-w-[150px] truncate">
                          <div className="flex items-center space-x-0.5">
                            <span className="truncate">{customer.email}</span>
                            <button 
                              onClick={() => copyToClipboard(customer.email)}
                              className="text-gray-500 hover:text-primary invisible group-hover:visible"
                              title="Copy email"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="max-w-[100px]">
                          {customer.phone ? (
                            <div className="flex items-center space-x-0.5">
                              <span className="truncate">{customer.phone}</span>
                              <button 
                                onClick={() => copyToClipboard(customer.phone)}
                                className="text-gray-500 hover:text-primary invisible group-hover:visible"
                                title="Copy phone"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-[9px]">Not provided</span>
                          )}
                        </td>
                        <td>
                          <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-[9px] font-medium ${
                            customer.role?.role_name === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {customer.role?.role_name || 'customer'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center">
                            <Button variant="outline" size="sm" className="h-5 w-5 p-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No customers found. They will appear here when registered.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAnalyticsContent = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          Analytics & Reports
        </CardTitle>
        <CardDescription>View detailed analytics and generate reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{apiStats?.total_users || 0}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
              <div className="text-xs text-green-600 mt-1">+12% this month</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{apiStats?.total_products || 0}</div>
              <div className="text-sm text-muted-foreground">Products</div>
              <div className="text-xs text-green-600 mt-1">+28% this month</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{apiStats?.total_orders || 0}</div>
              <div className="text-sm text-muted-foreground">Orders</div>
              <div className="text-xs text-green-600 mt-1">+15% this month</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{apiStats?.total_categories || 0}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
              <div className="text-xs text-green-600 mt-1">+5% this month</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sales Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Sales chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Revenue chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-blue-600">95%</div>
                  <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-green-600">2.4s</div>
                  <div className="text-sm text-muted-foreground">Avg. Page Load Time</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-purple-600">78%</div>
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );

  const renderSettingsContent = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
          Settings & Configuration
        </CardTitle>
        <CardDescription>Manage your application settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Store Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Store Name</label>
                  <div className="mt-1 p-2 bg-muted rounded">ShopApp Store</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <div className="mt-1 p-2 bg-muted rounded">USD ($)</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Timezone</label>
                  <div className="mt-1 p-2 bg-muted rounded">UTC</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <div className="mt-1 p-2 bg-muted rounded">{user?.name || 'Admin'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="mt-1 p-2 bg-muted rounded">{user?.email || 'admin@shop.com'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <div className="mt-1 p-2 bg-muted rounded">Administrator</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="font-medium">Backend</div>
                  <div className="text-sm text-muted-foreground">Laravel 11</div>
                  <div className="text-xs text-green-600 mt-1">Running</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="font-medium">Frontend</div>
                  <div className="text-sm text-muted-foreground">Next.js 15</div>
                  <div className="text-xs text-green-600 mt-1">Running</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="font-medium">Database</div>
                  <div className="text-sm text-muted-foreground">SQLite</div>
                  <div className="text-xs text-green-600 mt-1">Connected</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button onClick={refreshDashboard} disabled={refreshing}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M3 21v-5h5"></path>
                  </svg>
                  Refresh Data
                </Button>
                <Button variant="outline" onClick={logout}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16,17 21,12 16,7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );

  // Combine API stats with existing mock data structure
  const stats = [
    { 
      title: "Total Users", 
      value: apiStats ? apiStats.total_users.toString() : "Loading...", 
      change: "+12%", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-blue-600">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      bgColor: "from-blue-50 to-blue-100/60",
      textColor: "text-blue-600"
    },
    { 
      title: "Total Products", 
      value: apiStats ? apiStats.total_products.toString() : "Loading...", 
      change: "+28%", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-emerald-600">
          <path d="M2 17a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-4Z"></path>
          <path d="M2 8v9"></path>
          <path d="M22 8v9"></path>
          <path d="M6 11V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7"></path>
        </svg>
      ),
      bgColor: "from-emerald-50 to-emerald-100/60",
      textColor: "text-emerald-600"
    },
    { 
      title: "Total Orders", 
      value: apiStats ? apiStats.total_orders.toString() : "Loading...", 
      change: "+15%", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-purple-600">
          <path d="M5 7.5V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2h-3.5"></path>
          <path d="M14 2v4"></path>
          <path d="M10 2v4"></path>
          <path d="M2 10h20"></path>
          <path d="M5 14v6"></path>
          <path d="M2 17h6"></path>
        </svg>
      ),
      bgColor: "from-purple-50 to-purple-100/60",
      textColor: "text-purple-600"
    },
    { 
      title: "Categories", 
      value: apiStats ? apiStats.total_categories.toString() : "Loading...", 
      change: "+5%", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-orange-600">
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>      ),
      bgColor: "from-orange-50 to-orange-100/60",
      textColor: "text-orange-600"
    }
  ];
  const recentOrders = recentOrdersData.length > 0 ? recentOrdersData : [
    { id: "#ORD-7245", customer: "John Smith", date: "Today, 2:30 PM", status: "Completed", total: "$129.99" },
    { id: "#ORD-7244", customer: "Emily Johnson", date: "Today, 11:15 AM", status: "Processing", total: "$89.50" },
    { id: "#ORD-7243", customer: "Michael Brown", date: "Yesterday", status: "Completed", total: "$245.00" },
    { id: "#ORD-7242", customer: "Sarah Wilson", date: "Yesterday", status: "Shipped", total: "$74.99" },
    { id: "#ORD-7241", customer: "David Lee", date: "Jun 15, 2025", status: "Completed", total: "$199.99" },
  ];

  const topProducts = topProductsData.length > 0 ? topProductsData : [
    { id: 1, name: "Designer Jeans", sales: 54, revenue: "$4,860", growth: "+12%" },
    { id: 5, name: "Smartwatch Pro", sales: 47, revenue: "$9,399", growth: "+24%" },
    { id: 2, name: "Classic T-Shirt", sales: 42, revenue: "$1,260", growth: "+8%" },
    { id: 6, name: "Wireless Headphones", sales: 38, revenue: "$3,040", growth: "+18%" },
  ];

  // Mock chart data
  const generateChartData = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 100) + 50
    }));
  };

  const menuItems = [
    { 
      name: "Dashboard", 
      id: "dashboard", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      )
    },
    { 
      name: "Orders", 
      id: "orders", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      )
    },
    { 
      name: "Products", 
      id: "products", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7.5 4.27 9 5.15" />
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      )
    },
    { 
      name: "Customers", 
      id: "customers", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    { 
      name: "Analytics", 
      id: "analytics", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      )
    },
    { 
      name: "Settings", 
      id: "settings", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    }  ];

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-muted/20 relative overflow-hidden">  
      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-slideInRight"
              style={{ animation: 'notificationSlideIn 0.5s ease-out' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <path d="M3 6h18" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New Order</p>
                    <p className="text-xs text-gray-500">{notification.message}</p>
                    <p className="text-xs text-gray-400">{notification.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNotifications(prev => prev.filter(n => n.id !== notification.id));
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className={`w-64 border-r border-border bg-background/95 backdrop-blur-sm hidden md:flex flex-col animate-slide-in-left shadow-lg z-20`}>
        <div className="flex items-center gap-2 p-4 mb-6 border-b border-border">
          <div className="size-8 rounded bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground font-bold">S</div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">ShopApp Admin</h1>
        </div>       
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleButtonClick(`menu-${item.id}`);
                handleMenuTransition(item.id);
              }}
              onMouseEnter={() => handleCardHover(`menu-${item.id}`, true)}
              onMouseLeave={() => handleCardHover(`menu-${item.id}`, false)}
              className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md group ${
                activeMenu === item.id    
                  ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-medium shadow-lg border border-primary/20"
                  : "hover:bg-gradient-to-r hover:from-muted hover:to-muted/50 hover:text-primary/80"
              } ${
                buttonClickStates[`menu-${item.id}`] ? 'scale-95' : ''
              } ${
                cardHoverStates[`menu-${item.id}`] ? 'shadow-lg' : ''
              }`}
            >             
              <span className={`transition-all duration-300 ${
                activeMenu === item.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              } ${
                cardHoverStates[`menu-${item.id}`] ? 'scale-110' : ''
              }`}>
                {item.icon}
              </span>
              <span className="transition-all duration-300">{item.name}</span>
              
              {/* Notification badge for orders */}
              {item.id === 'orders' && newOrdersCount > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                  {newOrdersCount > 99 ? '99+' : newOrdersCount}
                </span>
              )}
              
              {/* Active indicator */}
              {activeMenu === item.id && (  
                <span className="ml-auto size-2 rounded-full bg-primary animate-pulse shadow-lg"></span>
              )}
              
              {/* Hover effect indicator */}
              {cardHoverStates[`menu-${item.id}`] && activeMenu !== item.id && (
                <span className="ml-auto size-1.5 rounded-full bg-primary/50 transition-all duration-300"></span>
              )}
            </button>
          ))}  
        </nav>
        
        <div className="p-4 border-t border-border mt-auto">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-muted-foreground group-hover:text-primary transition-colors">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex md:hidden items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground font-bold">S</div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">ShopApp Admin</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="relative"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`size-4 transition-all duration-300 ${mobileMenuOpen ? "rotate-90 opacity-0" : "opacity-100"}`}
          >
            <path d="M4 6h16"></path>
            <path d="M4 12h16"></path>
            <path d="M4 18h16"></path>
          </svg>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`size-4 absolute transition-all duration-300 ${mobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`}
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>
      
      <div 
        className={`fixed top-[73px] left-0 bottom-0 w-64 bg-background border-r border-border z-40 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all ${
                activeMenu === item.id
                  ? "bg-primary/10 text-primary font-medium shadow-sm"
                  : "hover:bg-muted hover:text-primary/80"
              }`}
            >
              <span className={`${activeMenu === item.id ? "text-primary" : "text-muted-foreground"}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
              {activeMenu === item.id && (
                <span className="ml-auto size-1.5 rounded-full bg-primary"></span>
              )}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-border">
            <Link 
              href="/" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              <span>Back to Store</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Welcome back, {user ? user.name : 'Admin'}
                </h1>
                <p className="text-muted-foreground">Here's what's happening with your store today.</p>
              </div>              <div className="flex gap-2">
                {/* Notification Bell */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-xs relative"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                  </svg>
                  Notifications
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </span>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshDashboard}
                  disabled={refreshing}
                  className="text-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mr-1 ${refreshing ? 'animate-spin' : ''}`}>
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M3 21v-5h5"></path>
                  </svg>
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout}
                  className="text-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16,17 21,12 16,7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </Button>                <Button className="group" onClick={openAddProductModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 mr-2 group-hover:scale-110 transition-transform">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                  Add Product
                </Button></div>
            </div>
          </header>

          {/* Notification Panel */}
          {showNotifications && (
            <div className="fixed top-20 right-4 w-96 max-h-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadNotificationsCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={markAllNotificationsAsRead}
                        className="text-xs"
                      >
                        Mark all read
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowNotifications(false)}
                      className="p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading notifications...</p>
                  </div>
                ) : allNotifications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {allNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${
                                notification.priority === 'urgent' ? 'bg-red-500' :
                                notification.priority === 'high' ? 'bg-orange-500' :
                                'bg-blue-500'
                              }`}></div>
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </h4>
                              {!notification.is_read && (
                                <span className="bg-blue-500 text-white text-xs px-1 rounded-full">New</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {notification.action_url && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenu('orders');
                                  setShowNotifications(false);
                                }}
                                className="p-1"
                                title="View details"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Delete notification"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-300">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                    </svg>
                    <p className="text-gray-500">No notifications yet</p>
                    <p className="text-sm text-gray-400">New order notifications will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Content Based on Active Menu */}
          {renderMainContent()}
        </div>
      </main>      {/* Enhanced Add Product Modal - Fully Responsive */}
      <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
        <DialogContent className="w-full max-w-[90vw] sm:max-w-[600px] lg:max-w-[800px] xl:max-w-[900px] max-h-[95vh] h-auto sm:h-[90vh] lg:h-[95vh] rounded-lg sm:rounded-xl lg:rounded-2xl bg-white shadow-2xl border-0 p-0 flex flex-col mx-4 sm:mx-6">{/* Responsive Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-3 sm:p-4 lg:p-6 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg lg:rounded-xl p-1.5 sm:p-2 border border-white/30">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="text-white">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Create New Product</h2>
                <p className="text-white/90 text-xs sm:text-sm lg:text-base hidden sm:block">Build your product catalog with stunning details</p>
              </div>
            </div>
          </div>

          {/* Responsive Form Content */}
          <div className="flex-1 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-white overflow-y-auto">
            <form onSubmit={handleAddProduct} className="h-full">
              
              {/* Responsive Layout - Single column on mobile, two columns on larger screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                
                {/* Left Column / Main Content */}
                <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                  
                  {/* Product Information */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <div className="bg-blue-100 rounded-md lg:rounded-lg p-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">Product Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700">Product Name *</label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={productFormData.name} 
                          onChange={handleInputChange} 
                          className="w-full h-8 sm:h-9 lg:h-10 border-2 border-gray-200 rounded-md lg:rounded-lg px-2 sm:px-3 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 sm:focus:ring-2 focus:ring-blue-200 transition-all duration-200" 
                          placeholder="Enter product name" 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-1.5 sm:space-y-2">
                        <label htmlFor="category_id" className="block text-xs sm:text-sm font-medium text-gray-700">Category *</label>
                        <Select value={productFormData.category_id} onValueChange={value => setProductFormData(prev => ({...prev, category_id: value}))}>
                          <SelectTrigger className="w-full h-8 sm:h-9 lg:h-10 border-2 border-gray-200 rounded-md lg:rounded-lg px-2 sm:px-3 text-xs sm:text-sm focus:border-blue-500">
                            <SelectValue placeholder="Choose category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1.5 sm:space-y-2">
                        <label htmlFor="size" className="block text-xs sm:text-sm font-medium text-gray-700">Size / Variant</label>
                        <Input 
                          id="size" 
                          name="size" 
                          value={productFormData.size} 
                          onChange={handleInputChange} 
                          className="w-full h-8 sm:h-9 lg:h-10 border-2 border-gray-200 rounded-md lg:rounded-lg px-2 sm:px-3 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 sm:focus:ring-2 focus:ring-blue-200 transition-all duration-200" 
                          placeholder="S, M, L, XL" 
                        />
                      </div>
                      
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">Status</label>
                        <div className="flex items-center gap-2 h-8 sm:h-9 lg:h-10 px-2 sm:px-3 bg-green-50 border-2 border-green-200 rounded-md lg:rounded-lg">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs sm:text-sm text-green-700 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <div className="bg-green-100 rounded-md lg:rounded-lg p-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">Pricing Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <label htmlFor="price" className="block text-xs sm:text-sm font-medium text-gray-700">Original Price *</label>
                        <div className="relative">
                          <span className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-xs sm:text-sm">$</span>
                          <Input 
                            id="price" 
                            name="price" 
                            type="number" 
                            step="0.01" 
                            value={productFormData.price} 
                            onChange={handleInputChange} 
                            className="w-full h-8 sm:h-9 lg:h-10 border-2 border-gray-200 rounded-md lg:rounded-lg pl-5 sm:pl-7 pr-2 sm:pr-3 text-xs sm:text-sm focus:border-green-500 focus:ring-1 sm:focus:ring-2 focus:ring-green-200 transition-all duration-200" 
                            placeholder="0.00" 
                            required 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 sm:space-y-2">
                        <label htmlFor="current_price" className="block text-xs sm:text-sm font-medium text-gray-700">Sale Price *</label>
                        <div className="relative">
                          <span className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-xs sm:text-sm">$</span>
                          <Input 
                            id="current_price" 
                            name="current_price" 
                            type="number" 
                            step="0.01" 
                            value={productFormData.current_price} 
                            onChange={handleInputChange} 
                            className="w-full h-8 sm:h-9 lg:h-10 border-2 border-gray-200 rounded-md lg:rounded-lg pl-5 sm:pl-7 pr-2 sm:pr-3 text-xs sm:text-sm focus:border-green-500 focus:ring-1 sm:focus:ring-2 focus:ring-green-200 transition-all duration-200" 
                            placeholder="0.00" 
                            required 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <div className="bg-orange-100 rounded-md lg:rounded-lg p-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01 2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">Product Description</h3>
                    </div>
                    
                    <div className="space-y-1.5 sm:space-y-2">
                      <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700">Detailed Description *</label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        value={productFormData.description} 
                        onChange={handleInputChange} 
                        className="w-full h-20 sm:h-24 lg:h-32 border-2 border-gray-200 rounded-md lg:rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm resize-none focus:border-orange-500 focus:ring-1 sm:focus:ring-2 focus:ring-orange-200 transition-all duration-200" 
                        placeholder="Describe your product in detail..." 
                        required 
                      />
                      <p className="text-xs text-gray-500 hidden sm:block">Tip: A compelling description helps customers understand your product</p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Image Gallery (Hidden on mobile, shown on lg+) */}
                <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <div className="bg-purple-100 rounded-md lg:rounded-lg p-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">Product Gallery</h3>
                    </div>
                    
                    {/* Image Preview Grid - Responsive */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                      {productFormData.images && productFormData.images.length > 0 ? (
                        productFormData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-md lg:rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                              <img 
                                src={URL.createObjectURL(image)} 
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex items-center justify-center text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      ) : (
                        Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="aspect-square border-2 border-dashed border-gray-300 rounded-md lg:rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <svg className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Upload Section - Responsive */}
                    <div className="space-y-3 sm:space-y-4">
                      <label className="group cursor-pointer block">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="font-medium text-xs sm:text-sm lg:text-base">Upload Images</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          multiple
                        />
                      </label>
                      
                      {productFormData.images && productFormData.images.length > 0 && (
                        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 bg-green-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md lg:rounded-lg border border-green-200">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-green-700 font-medium">{productFormData.images.length} image{productFormData.images.length !== 1 ? 's' : ''} selected</span>
                        </div>
                      )}
                      
                      <div className="text-center text-xs sm:text-sm text-gray-500 bg-gray-50 p-2 sm:p-3 rounded-md lg:rounded-lg hidden sm:block">
                        <p><strong>💡 Tips:</strong></p>
                        <p>• Upload high-quality images</p>
                        <p>• Use multiple angles</p>
                        <p>• Maximum 10 images per product</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Responsive */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-3 sm:pt-4 lg:pt-6 mt-4 sm:mt-6 border-t border-gray-200 gap-3 sm:gap-0">
                <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                  <span>* Required fields</span>
                </div>
                
                <div className="flex gap-2 sm:gap-3 lg:gap-4 order-1 sm:order-2 w-full sm:w-auto">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddProductModal(false)} 
                    className="flex-1 sm:flex-none px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 h-8 sm:h-9 lg:h-11 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg lg:rounded-xl transition-all duration-200 text-xs sm:text-sm"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 sm:flex-none px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 h-8 sm:h-9 lg:h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-3 text-xs sm:text-sm"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Product
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
