"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart, Search, Menu, X, ArrowRight } from "lucide-react";

// Simple toast fallback
const toast = {
  success: (message) => console.log('✅ Success:', message),
  error: (message) => console.log('❌ Error:', message),
  info: (message) => console.log('ℹ️ Info:', message),
};

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8001/api';

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
    image: "https://images.unsplash.com/photo-1746469535771-71a672e8719f?q=80&w=800&auto=format&fit=crop",
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

export default function ModernHome() {
  const router = useRouter();    
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);     
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

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Modern Header */}
      <header className={`border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${scrolled ? 'shadow-md py-3' : 'py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white font-bold">
              S
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Store
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
              Home
            </a>
            <a href="#products-section" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Products
            </a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Collections
            </a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              About
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-gray-100">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <Heart className="h-5 w-5" />
            </Button>
            <a href="/checkout">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-gray-100"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-black text-white text-xs font-bold">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </a>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-gray-100" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <nav className="flex flex-col p-4 gap-2">
              <a href="/" className="text-sm font-medium p-3 hover:bg-gray-50 rounded-lg">Home</a>
              <a href="#products-section" className="text-sm font-medium p-3 hover:bg-gray-50 rounded-lg">Products</a>
              <a href="#" className="text-sm font-medium p-3 hover:bg-gray-50 rounded-lg">Collections</a>
              <a href="#" className="text-sm font-medium p-3 hover:bg-gray-50 rounded-lg">About</a>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop" 
              alt="Hero background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Discover Your Style
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Shop the latest trends in fashion, electronics, and lifestyle products
            </p>
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-6 rounded-full"
              onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Shop Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Shop by Category
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our curated collections designed for every lifestyle
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="aspect-square relative overflow-hidden rounded-2xl mb-4">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-center text-gray-900">
                    {category.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section id="products-section" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Handpicked items from our latest collection
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm">
                    <div className="aspect-square bg-gray-200 rounded-t-lg animate-pulse"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse mb-4 w-2/3"></div>
                      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : (
                products.slice(0, 8).map((product) => (
                  <Card key={product.id} className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
                      <img 
                        src={getProductImage(product)} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = "/products/placeholder.jpg";
                        }}
                      />
                      {product.featured && (
                        <Badge className="absolute top-3 left-3 bg-black text-white">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">
                          ${getProductPrice(product).toFixed(2)}
                        </span>
                        <Button 
                          size="sm"
                          className="bg-black hover:bg-gray-800 text-white"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg"
                className="border-black text-black hover:bg-black hover:text-white"
              >
                View All Products
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-black text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay in the Loop
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Subscribe to get updates on new products, exclusive offers, and styling tips
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 rounded-lg text-black"
              />
              <Button className="bg-white text-black hover:bg-gray-100 px-8 py-3">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white font-bold">
                  S
                </div>
                <h3 className="text-xl font-semibold">Store</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Your destination for quality products and exceptional style.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">All Products</a></li>
                <li><a href="#" className="hover:text-gray-900">New Arrivals</a></li>
                <li><a href="#" className="hover:text-gray-900">Sale</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900">Size Guide</a></li>
                <li><a href="#" className="hover:text-gray-900">Returns</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Careers</a></li>
                <li><a href="#" className="hover:text-gray-900">Press</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2025 Store. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
