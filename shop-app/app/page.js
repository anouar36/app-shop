"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart, Search, Menu, X, ArrowRight, Truck, Shield, RefreshCw, Award } from "lucide-react";

// Import Cookie Management System
import { GuestDataManager } from "@/lib/cookieManager";

// Simple toast fallback
const toast = {
  success: (message) => console.log('✅ Success:', message),
  error: (message) => console.log('❌ Error:', message),
  info: (message) => console.log('ℹ️ Info:', message),
};

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8001/api';

// Clean hero sections for modern design
const heroSections = [
  {
    id: 1,
    title: "New Collection",
    subtitle: "Summer 2025",
    description: "Discover our latest arrivals and premium products",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1400&auto=format&fit=crop",
    buttonText: "Shop Collection",
    theme: "light"
  },
  {
    id: 2,
    title: "Special Offer",
    subtitle: "Up to 50% off",
    description: "Limited time offer on selected items",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1400&auto=format&fit=crop",
    buttonText: "Shop Sale",
    theme: "dark"
  }
];

// Clean category data
const categories = [
  {
    name: "Women",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop",
    slug: "women"
  },
  {
    name: "Men", 
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
    slug: "men"
  },
  {
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
    slug: "accessories"
  },
  {
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=800&auto=format&fit=crop",
    slug: "electronics"
  }
];

const paymentMethods = [
  { id: 1, name: "Credit Card", icon: "/payment/credit-card.jpg" },
  { id: 2, name: "PayPal", icon: "/payment/paypal.jpg" },
  { id: 3, name: "Apple Pay", icon: "/payment/apple-pay.jpg" },
  { id: 4, name: "Google Pay", icon: "/payment/google-pay.jpg" }
];

export default function Home() {
  const router = useRouter();    
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);     
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [guestManager, setGuestManager] = useState(null);
  
  // Initialize Guest Data Manager
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const manager = new GuestDataManager();
      setGuestManager(manager);
      
      // Load cart count from cookies and localStorage
      const cookieCart = manager.getCart();
      const localCart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
      
      // Sync cookie cart with localStorage if different
      if (cookieCart.length !== localCart.length) {
        const totalItems = Math.max(
          cookieCart.reduce((sum, item) => sum + (item.quantity || 1), 0),
          localCart.reduce((sum, item) => sum + (item.quantity || 1), 0)
        );
        setCartCount(totalItems);
      }
      
      console.log('🍪 Guest Data Manager initialized');
      console.log('📊 Guest Analytics:', manager.getGuestAnalytics());
    }
  }, []);// Fetch products from API - Only real products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Filter only active products
          const activeProducts = data.filter(product => product.status === 'active');
          
          setProducts(activeProducts);
          console.log(`✅ Loaded ${activeProducts.length} real products from database`);
          toast.success(`Loaded ${activeProducts.length} products from database`);
        } else {
          console.error('❌ API response not ok:', response.status);
          setProducts([]); // Show empty instead of fake products
          toast.error('Failed to load products from database');
        }
      } catch (error) {
        console.error('💥 Error fetching products:', error);
        setProducts([]); // Show empty instead of fake products
        toast.error('Cannot connect to database');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const savedCart = localStorage.getItem('shopping_cart');
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          if (Array.isArray(cartData)) {
            const totalItems = cartData.reduce((sum, item) => sum + (item.quantity || 1), 0);
            setCartCount(totalItems);
          }
        }
      } catch (error) {
        console.error('Error reading cart:', error);
        setCartCount(0);
      }
    };

    updateCartCount();
    
    // Listen for storage changes (cart updates from other tabs)
    window.addEventListener('storage', updateCartCount);
    
    // Custom event for cart updates in same tab
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);
  
  // Handle scroll effect for the header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
                                                             
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Add to cart functionality with Cookie Support
  const handleAddToCart = (product) => {
    try {
      // Get existing cart from localStorage
      const savedCart = localStorage.getItem('shopping_cart');
      let cart = [];
      
      if (savedCart) {
        cart = JSON.parse(savedCart);
        if (!Array.isArray(cart)) {
          cart = [];
        }
      }

      // Check if product already exists in cart
      const existingIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingIndex > -1) {
        // Increase quantity
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        toast.success(`Increased ${product.name} quantity in cart!`);
      } else {
        // Add new item
        cart.push({
          id: product.id,
          quantity: 1
        });
        toast.success(`${product.name} added to cart!`);
      }

      // Save to both localStorage and cookies
      localStorage.setItem('shopping_cart', JSON.stringify(cart));
      
      // Save to cookies if guest manager is available
      if (guestManager) {
        guestManager.saveCart(cart);
      }
      
      // Update cart count
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(totalItems);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };// Get product image with fallback - Updated for real database structure  
  const getProductImage = (product) => {
    // Handle the real database image structure
    if (product.images && product.images.length > 0) {
      return `http://127.0.0.1:8001/${product.images[0]}`;
    }
    if (product.image) {
      return `http://127.0.0.1:8001/${product.image}`;
    }
    return "/placeholder.jpg"; // Use the existing placeholder in public folder
  };

  // Get product price
  const getProductPrice = (product) => {
    return parseFloat(product.current_price || product.price || 0);
  };
  // Filter products by category - Updated for real database structure
  const getFilteredProducts = (category) => {
    if (category === "all") {
      return products; // Show all products from database
    }
    return products.filter(p => p.category?.name?.toLowerCase() === category);
  };  // Get product card component - Enhanced with Cookie Features
  const ProductCard = ({ product }) => {
    const handleProductClick = () => {
      // Save to recently viewed
      if (guestManager) {
        guestManager.saveRecentlyViewed(product.id);
      }
      router.push(`/product/${product.id}`);
    };

    const handleAddToCartClick = (e) => {
      e.stopPropagation(); // Prevent navigation when clicking add to cart
      handleAddToCart(product);
    };

    const handleWishlistClick = (e) => {
      e.stopPropagation(); // Prevent navigation
      if (guestManager) {
        const wishlist = guestManager.getWishlist();
        if (wishlist.includes(product.id)) {
          guestManager.removeFromWishlist(product.id);
          toast.info(`${product.name} removed from wishlist`);
        } else {
          guestManager.addToWishlist(product.id);
          toast.success(`${product.name} added to wishlist`);
        }
      }
    };

    const isInWishlist = guestManager ? guestManager.getWishlist().includes(product.id) : false;

    return (
      <div className="group cursor-pointer" onClick={handleProductClick}>
        <div className="aspect-square overflow-hidden bg-gray-50 mb-4 relative">        
          <img 
            src={getProductImage(product)} 
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = "/placeholder.jpg";
            }}
          />
          {/* Show featured badge for products with current_price different from price */}
          {product.price && product.current_price && parseFloat(product.price) > parseFloat(product.current_price) && (
            <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs">
              Sale
            </Badge>
          )}
          {/* Wishlist Button */}
          <Button
            size="sm"
            variant="ghost"
            className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isInWishlist ? 'text-red-500' : 'text-gray-600'
            } hover:text-red-500`}
            onClick={handleWishlistClick}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </Button>
          {/* Add to Cart Button */}
          <Button
            size="sm"
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 hover:bg-gray-100"
            onClick={handleAddToCartClick}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">${getProductPrice(product).toFixed(2)}</span>
            {product.price && product.current_price && parseFloat(product.price) > parseFloat(product.current_price) && (
              <span className="text-sm text-gray-500 line-through">${parseFloat(product.price).toFixed(2)}</span>
            )}
          </div>
          {/* Show product category and size if available */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {product.category && <span>{product.category.name}</span>}
            {product.size && <span>• {product.size}</span>}
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Clean Modern Header */}
      <header className={`border-b border-gray-100 sticky top-0 z-50 bg-white/95 backdrop-blur-sm transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              BAZAR
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
              Home
            </a>
            <a href="#products" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Products
            </a>
            <a href="#categories" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Categories
            </a>
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              About
            </a>
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <a href="/checkout">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-gray-900 text-white text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </a>
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <nav className="flex flex-col p-4 gap-2">
              <a href="/" className="text-sm font-medium p-2 hover:bg-gray-50 rounded-md">Home</a>
              <a href="#products" className="text-sm font-medium p-2 hover:bg-gray-50 rounded-md">Products</a>
              <a href="#categories" className="text-sm font-medium p-2 hover:bg-gray-50 rounded-md">Categories</a>
              <a href="#" className="text-sm font-medium p-2 hover:bg-gray-50 rounded-md">About</a>
              <a href="#" className="text-sm font-medium p-2 hover:bg-gray-50 rounded-md">Contact</a>
            </nav>
          </div>
        )}
      </header>
      
      {/* Hero Section */}
      <section className="relative">
        <Carousel className="w-full">
          <CarouselContent>
            {heroSections.map((section) => (
              <CarouselItem key={section.id}>
                <div className="relative h-[70vh] overflow-hidden">
                  <div className="absolute inset-0">
                    <img 
                      src={section.image} 
                      alt={section.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white max-w-2xl px-4">
                      <p className="text-sm font-medium mb-2 uppercase tracking-wider">{section.subtitle}</p>
                      <h1 className="text-4xl md:text-6xl font-light mb-4">{section.title}</h1>
                      <p className="text-lg mb-8 text-white/90">{section.description}</p>
                      <Button 
                        size="lg" 
                        className="bg-white text-black hover:bg-gray-100 px-8 py-3"
                        onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        {section.buttonText}
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-6" />
          <CarouselNext className="right-6" />
        </Carousel>
      </section>
      
      {/* Categories Section */}
      <section id="categories" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600">Discover our curated collections</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="aspect-square overflow-hidden rounded-lg mb-4">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-center font-medium text-gray-900">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600 text-sm">Free delivery on orders over $100</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-gray-600 text-sm">30-day return policy</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">Your payment information is safe</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section id="products" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600">Handpicked favorites for you</p>
          </div>
            {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading products from database...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No products found in database.</p>
              <p className="text-sm text-gray-500">Please add products through the admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="px-8">
              View All Products
            </Button>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-light mb-4">Stay in the Loop</h2>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            Subscribe to receive updates, access to exclusive deals, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-3 bg-white text-gray-900 rounded-md"
            />
            <Button className="bg-white text-gray-900 hover:bg-gray-100 px-6">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded bg-gray-900 flex items-center justify-center text-white font-bold text-xs">
                  B
                </div>
                <h3 className="font-semibold text-gray-900">BAZAR</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Your premium shopping destination for quality products at great prices.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Shop</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">New Arrivals</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Best Sellers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Sale</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Contact Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Size Guide</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Returns</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Privacy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-8 pt-8 text-center">
            <p className="text-gray-600 text-sm">© 2025 BAZAR. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
