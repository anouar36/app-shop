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
import { Star, ShoppingCart, Heart, Search, Menu, X, ArrowRight, Gift, Shield, Truck, Zap } from "lucide-react";
import './colorful-styles.css';
// import { toast } from "sonner"; // Temporarily disabled

// Simple toast fallback
const toast = {
  success: (message) => console.log('✅ Success:', message),
  error: (message) => console.log('❌ Error:', message),
  info: (message) => console.log('ℹ️ Info:', message),
};

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8001/api';

const heroSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
    title: "🌟 Summer Collection 2025 🌟",
    description: "Discover the hottest trends and exclusive styles that will make you shine this season!",
    buttonText: "Shop Now",
    gradient: "from-purple-600 via-pink-600 to-red-600"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop",
    title: "🔥 MEGA SALE ALERT! 🔥",
    description: "Up to 70% OFF on selected items! Limited time offer - Don't miss out!",
    buttonText: "Shop Deals",
    gradient: "from-orange-500 via-red-500 to-pink-500"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=1200&auto=format&fit=crop",
    title: "✨ Fresh Arrivals ✨",
    description: "Be the first to experience our latest premium collection of tech and fashion!",
    buttonText: "Explore New",
    gradient: "from-blue-600 via-purple-600 to-indigo-800"
  }
];

// Static fallback products (in case API fails)
const fallbackProducts = [
  {
    id: 1,
    name: "Classic T-Shirt",
    price: 29.99,
    current_price: 29.99,
    image: "/products/clothing.jpg",
    description: "A comfortable cotton t-shirt for everyday wear.",
    featured: true,
    category: { name: "clothing" },
    status: "active"
  },
  {
    id: 2,
    name: "Designer Jeans",
    price: 89.99,
    current_price: 89.99,
    image: "/products/clothing.jpg",
    description: "Premium quality jeans with perfect fit.",
    featured: true,
    category: { name: "clothing" },
    status: "active"
  },
  {
    id: 3,
    name: "Casual Sneakers",
    price: 59.99,
    current_price: 59.99,
    image: "https://images.unsplash.com/photo-1746469535771-71a672e8719f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Lightweight and stylish sneakers for any occasion.",
    featured: false,
    category: { name: "shoes" },
    status: "active"
  },
  {
    id: 4,
    name: "Leather Wallet",
    price: 39.99,
    current_price: 39.99,
    image: "/products/accessories.jpg",
    description: "Genuine leather wallet with multiple compartments.",
    featured: false,
    category: { name: "accessories" },
    status: "active"
  },
  {
    id: 5,
    name: "Smartwatch Pro",
    price: 199.99,
    current_price: 199.99,
    image: "/products/electronics.jpg",
    description: "Next-generation smartwatch with health monitoring.",
    featured: true,
    category: { name: "electronics" },
    status: "active"
  },
  {
    id: 6,
    name: "Wireless Headphones",
    price: 79.99,
    current_price: 79.99,
    image: "/products/electronics.jpg",
    description: "Premium sound quality with noise cancellation.",
    featured: true,
    category: { name: "electronics" },
    status: "active"
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
  
  // Fetch products from API
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
          console.log('✅ Products loaded from API:', activeProducts.length);
        } else {
          throw new Error('API response not ok');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        console.log('🔄 Using fallback products');
        setProducts(fallbackProducts);
        toast.error('Using offline product data');
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

  // Add to cart functionality
  const handleAddToCart = (product) => {
    try {
      // Get existing cart
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

      // Save cart
      localStorage.setItem('shopping_cart', JSON.stringify(cart));
      
      // Update cart count
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(totalItems);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Get product image with fallback
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return `${API_BASE_URL.replace('/api', '')}/${product.images[0]}`;
    }
    if (product.image) {
      return `${API_BASE_URL.replace('/api', '')}/${product.image}`;
    }
    return product.image || "/products/placeholder.jpg";
  };

  // Get product price
  const getProductPrice = (product) => {
    return parseFloat(product.current_price || product.price || 0);
  };

  // Filter products by category
  const getFilteredProducts = (category) => {
    if (category === "all") {
      return products.filter(p => p.featured || products.indexOf(p) < 8); // Show featured + first 8
    }
    return products.filter(p => p.category?.name?.toLowerCase() === category);
  };

  // Get product card component
  const ProductCard = ({ product }) => (
    <Card key={product.id} className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105">
      <div className="aspect-square relative bg-muted">
        <div className="w-full h-full">
          <img 
            src={getProductImage(product)} 
            alt={product.name}
            className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
            onError={(e) => {
              e.target.src = "/products/placeholder.jpg";
            }}
          />
        </div>
        {product.featured && (
          <Badge className="absolute top-2 right-2 bg-primary hover:bg-primary/90">Featured</Badge>
        )}
        {product.price && product.current_price && product.price > product.current_price && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            -{Math.round(((product.price - product.current_price) / product.price) * 100)}%
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
          <div className="text-lg font-bold">${getProductPrice(product).toFixed(2)}</div>
        </div>
        <CardDescription className="line-clamp-2 mt-2">{product.description}</CardDescription>
      </CardHeader>
      <CardFooter className="p-4 pt-2">
        <Button 
          className="w-full bg-primary/90 hover:bg-primary group-hover:scale-105 transition-all duration-200" 
          onClick={() => handleAddToCart(product)}
        >
          <ShoppingCart className="h-4 w-4 mr-2 group-hover:animate-bounce" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header with navigation */}
      <header className={`border-b border-border sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 shadow-lg ${scrolled ? 'shadow-xl py-2' : 'py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-lg animate-pulse-custom">
              S
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:scale-105 transition-transform duration-200">
              ShopApp
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-sm font-semibold hover:text-purple-600 transition-all duration-200 hover:scale-110 relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#products-section" className="text-sm font-semibold hover:text-purple-600 transition-all duration-200 hover:scale-110 relative group">
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#" className="text-sm font-semibold hover:text-purple-600 transition-all duration-200 hover:scale-110 relative group">
              Categories
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#" className="text-sm font-semibold hover:text-purple-600 transition-all duration-200 hover:scale-110 relative group">
              🔥 Sale
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="/admin" className="text-sm font-semibold hover:text-purple-600 transition-all duration-200 hover:scale-110 relative group">
              Admin
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-600 transition-all duration-200 hover:scale-110 rounded-xl">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-600 transition-all duration-200 hover:scale-110 rounded-xl">
              <Heart className="h-5 w-5" />
            </Button>
            <a href="/checkout">
              <Button 
                variant="outline" 
                size="icon" 
                className="relative hover:border-purple-500 hover:text-purple-600 transition-all duration-200 hover:scale-110 rounded-xl border-2 hover:shadow-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-500 text-white animate-bounce-custom text-xs font-bold shadow-lg">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </a>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 rounded-xl" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div 
          className={`md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg transform transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <nav className="flex flex-col p-4 gap-2">
            <a 
              href="/" 
              className="text-sm font-medium p-2 hover:bg-primary/10 rounded-md hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="#products-section" 
              className="text-sm font-medium p-2 hover:bg-primary/10 rounded-md hover:text-primary transition-colors"
              onClick={() => {
                document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
            >
              Products
            </a>
            <a 
              href="#" 
              className="text-sm font-medium p-2 hover:bg-primary/10 rounded-md hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </a>
            <a 
              href="#" 
              className="text-sm font-medium p-2 hover:bg-primary/10 rounded-md hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sale
            </a>
            <a 
              href="/admin" 
              className="text-sm font-medium p-2 hover:bg-primary/10 rounded-md hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </a>
            <div className="mt-2 pt-2 border-t border-border">
              <Button 
                variant="default" 
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                onClick={() => {
                  window.location.href = "/checkout";
                }}
              >
                View Cart ({cartCount})
              </Button>
            </div>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main>
        {/* Hero Carousel Section */}
        <section className="relative">
          <Carousel className="w-full" autoPlay={true} loop={true}>
            <CarouselContent>
              {heroSlides.map((slide) => (
                <CarouselItem key={slide.id}>
                  <div className="relative h-[60vh] md:h-[80vh] overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <img 
                        src={slide.image} 
                        alt={slide.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-80 z-10`}></div>
                    
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 z-15 opacity-20">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/20 animate-ping"></div>
                      <div className="absolute bottom-20 right-20 w-16 h-16 rounded-full bg-white/20 animate-pulse"></div>
                      <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-white/30 animate-bounce"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6">
                      <h1 className="text-4xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl animate-fade-in-up text-glow">
                        {slide.title}
                      </h1>
                      <p className="text-lg md:text-2xl mb-8 max-w-3xl text-white/95 drop-shadow-lg animate-fade-in-up">
                        {slide.description}
                      </p>
                      <Button 
                        size="lg" 
                        className="bg-white text-gray-900 hover:bg-white/90 transition-all duration-300 transform hover:scale-110 shadow-2xl text-lg px-8 py-4 rounded-full font-bold animate-fade-in-up btn-gradient"
                        onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        {slide.buttonText} <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-6 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm" />
            <CarouselNext className="right-6 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm" />
          </Carousel>
        </section>
        
        {/* Exciting Features Section */}
        <section className="py-16 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                ✨ Why Choose ShopApp? ✨
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience shopping like never before with our amazing features and unbeatable service!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group hover-lift">
                <div className="bg-gradient-to-br from-green-400 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <Truck className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">🚚 FREE Shipping</h3>
                <p className="text-gray-600">Free delivery on orders over $50. Fast, reliable, and tracked shipping worldwide!</p>
              </div>
              
              <div className="text-center group hover-lift">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">🔒 Secure Shopping</h3>
                <p className="text-gray-600">Your data is safe with us. 256-bit SSL encryption and secure payment processing!</p>
              </div>
              
              <div className="text-center group hover-lift">
                <div className="bg-gradient-to-br from-pink-400 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <Gift className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">🎁 Amazing Deals</h3>
                <p className="text-gray-600">Daily deals, seasonal sales, and exclusive offers just for you. Save big!</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Categories */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">🛍️ Shop by Category</h2>
              <p className="text-lg text-gray-600">Find exactly what you're looking for in our diverse collection</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "Electronics", emoji: "📱", color: "from-blue-400 to-blue-600", count: "500+ Items" },
                { name: "Fashion", emoji: "👕", color: "from-pink-400 to-pink-600", count: "800+ Items" },
                { name: "Shoes", emoji: "👟", color: "from-green-400 to-green-600", count: "300+ Items" },
                { name: "Accessories", emoji: "👜", color: "from-purple-400 to-purple-600", count: "200+ Items" }
              ].map((category, index) => (
                <Card key={index} className="group cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:scale-105 border-0 bg-gradient-to-br from-gray-50 to-white hover-lift">
                  <CardContent className="p-6 text-center">
                    <div className={`bg-gradient-to-br ${category.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl`}>
                      <span className="text-2xl">{category.emoji}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{category.name}</h3>                    <p className="text-sm text-gray-500">{category.count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Showcase */}
        <section className="py-16 bg-gradient-to-br from-slate-100 to-blue-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">🎯 Featured Categories</h2>
              <p className="text-lg text-gray-600">Explore our most popular product categories</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Clothing', 'Shoes', 'Accessories', 'Electronics'].map((category, index) => (
                <Card key={index} className="overflow-hidden group cursor-pointer">
                  <div className="aspect-square relative bg-muted transition-transform group-hover:scale-105 duration-300">
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <div className="relative w-full h-full">
                        <img 
                          src={`/products/category-${category.toLowerCase()}.jpg`} 
                          alt={`${category} category`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-center">{category}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Tabs */}
        <section id="products-section" className="py-16 container mx-auto px-4">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Separator className="my-4 w-24" />
            <p className="text-muted-foreground text-center max-w-2xl">
              Discover our handpicked selection of premium quality products
            </p>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="clothing">Clothing</TabsTrigger>
                <TabsTrigger value="shoes">Shoes</TabsTrigger>
                <TabsTrigger value="electronics">Electronics</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.filter(p => p.featured).map(product => (
                  <Card key={product.id} className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg">                    <div className="aspect-square relative bg-muted">
                      <div className="w-full h-full">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
                        />
                      </div>
                      <Badge className="absolute top-2 right-2 bg-primary hover:bg-primary/90">Featured</Badge>
                    </div>
                    <CardHeader className="p-4 pb-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
                      </div>
                      <CardDescription className="line-clamp-2 mt-2">{product.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-2">
                      <Button className="w-full bg-primary/90 hover:bg-primary group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 group-hover:animate-bounce">
                          <circle cx="8" cy="21" r="1"></circle>
                          <circle cx="19" cy="21" r="1"></circle>
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                        </svg>
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="clothing" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.filter(p => p.category === 'clothing').map(product => (
                  <Card key={product.id} className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg">
                    <div className="aspect-square relative bg-muted">
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground group-hover:opacity-90 transition-opacity">
                        Product Image
                      </div>
                      {product.featured && (
                        <Badge className="absolute top-2 right-2 bg-primary hover:bg-primary/90">Featured</Badge>
                      )}
                    </div>
                    <CardHeader className="p-4 pb-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
                      </div>
                      <CardDescription className="line-clamp-2 mt-2">{product.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-2">
                      <Button className="w-full bg-primary/90 hover:bg-primary group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 group-hover:animate-bounce">
                          <circle cx="8" cy="21" r="1"></circle>
                          <circle cx="19" cy="21" r="1"></circle>
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                        </svg>
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Similar structure for shoes and electronics tabs */}
            <TabsContent value="shoes" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.filter(p => p.category === 'shoes').map(product => (
                  <Card key={product.id} className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg">
                    {/* Product card content */}
                    <div className="aspect-square relative bg-muted">
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground group-hover:opacity-90 transition-opacity">
                        Product Image
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
                      </div>
                      <CardDescription className="line-clamp-2 mt-2">{product.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-2">
                      <Button className="w-full bg-primary/90 hover:bg-primary">Add to Cart</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="electronics" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.filter(p => p.category === 'electronics').map(product => (
                  <Card key={product.id} className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg">
                    {/* Product card content */}
                    <div className="aspect-square relative bg-muted">
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground group-hover:opacity-90 transition-opacity">
                        Product Image
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
                      </div>
                      <CardDescription className="line-clamp-2 mt-2">{product.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-2">
                      <Button className="w-full bg-primary/90 hover:bg-primary">Add to Cart</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
        
        {/* Special Offers Banner */}
        <section className="py-12 bg-primary/10">
          <div className="container mx-auto px-4">
            <div className="rounded-xl bg-gradient-to-r from-primary/80 to-primary p-6 md:p-12 text-white overflow-hidden relative">              <div className="max-w-lg">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Summer Sale Is Live!</h2>
                <p className="text-lg mb-6">Enjoy up to 50% off on selected summer products. Limited time offer.</p>
                <Button variant="secondary" size="lg" className="text-primary" onClick={() => document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' })}>Shop the Sale</Button>
              </div>
              <div className="hidden md:block absolute -bottom-10 right-10 w-64 h-64 rounded-full bg-white/20"></div>
              <div className="hidden md:block absolute -top-10 right-40 w-32 h-32 rounded-full bg-white/10"></div>
            </div>
          </div>
        </section>
        
        {/* Payment Methods Section */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Secure Payment Methods</h2>
              <p className="text-muted-foreground mt-2">We offer multiple payment options for your convenience</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {paymentMethods.map(method => (
                <Card key={method.id} className="bg-background hover:shadow-md transition-shadow">
                  <CardContent className="flex flex-col items-center justify-center p-4">                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden">
                      <img src={method.icon} alt={`${method.name} icon`} className="w-full h-full object-cover" />
                    </div>
                    <p className="font-medium text-sm">{method.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">All transactions are secure and encrypted</p>
            </div>
          </div>
        </section>
        
        {/* Newsletter Subscription */}
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-8">Subscribe to our newsletter to receive updates and exclusive offers</p>
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
              <input type="email" placeholder="Enter your email" className="flex h-10 w-full sm:w-80 rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">ShopApp</h3>
              <p className="text-muted-foreground text-sm mb-4">Your one-stop shop for fashion, electronics, and more.</p>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect width="20" height="20" x="2" y="2" rx="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <path d="M17.5 6.5h.01"></path>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </Button>
              </div>            </div>
            <div>
              <h3 className="font-bold mb-4">Shop</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:underline text-muted-foreground">All Products</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
            <p className="text-sm text-muted-foreground">© 2025 ShopApp. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs text-muted-foreground hover:underline">Privacy Policy</a>
              <a href="#" className="text-xs text-muted-foreground hover:underline">Terms of Service</a>
              <a href="#" className="text-xs text-muted-foreground hover:underline">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
