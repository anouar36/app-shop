// BAZAR Product Landing Page - Adventure Style Design with Cookie Support
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, Heart, Share2, ShoppingCart, Truck, Shield, RefreshCw, Clock, 
  ChevronLeft, ChevronRight, Search, Menu, X, MapPin, Phone, Mail, 
  User, ArrowLeft, Plus, Minus, Check
} from "lucide-react";
import Link from "next/link";

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

// Helper function to safely format price
const formatPrice = (price) => {
  // Convert price to a number if it's not already
  const numericPrice = typeof price === 'number' ? price : parseFloat(price || 0);
  // Handle NaN case
  return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('details');
  const [guestManager, setGuestManager] = useState(null);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Initialize Guest Data Manager
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const manager = new GuestDataManager();
      setGuestManager(manager);
      
      // Save this product to recently viewed
      if (params.id) {
        manager.saveRecentlyViewed(parseInt(params.id));
      }
      
      // Check if product is in wishlist
      const wishlist = manager.getWishlist();
      setIsFavorite(wishlist.includes(parseInt(params.id)));
    }
  }, [params.id]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/products/${params.id}`);
        
        if (response.ok) {
          const productData = await response.json();
          
          // Process the product data
          const processedProduct = {
            ...productData,
            price: parseFloat(productData.current_price || productData.price || 0),
            originalPrice: parseFloat(productData.price || 0),
            images: productData.images || [productData.image] || [],
            rating: parseFloat(productData.rating || 4.5),
            totalReviews: parseInt(productData.reviews_count || 0),
            sizes: productData.sizes ? productData.sizes.split(',') : ['S', 'M', 'L', 'XL'],
            colors: productData.colors ? productData.colors.split(',') : ['Black', 'White', 'Gray'],
            features: productData.features ? productData.features.split('\n') : [
              'High quality materials',
              'Comfortable fit',
              'Durable construction',
              'Easy care instructions'
            ]
          };
          
          setProduct(processedProduct);
          
          // Set default selections
          if (processedProduct.sizes && processedProduct.sizes.length > 0) {
            setSelectedSize(processedProduct.sizes[0]);
          }
          if (processedProduct.colors && processedProduct.colors.length > 0) {
            setSelectedColor(processedProduct.colors[0]);
          }
          
          toast.success('Product loaded successfully');
        } else {
          toast.error('Product not found');
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Error loading product');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  // Load cart count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
      const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(totalItems);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  const getProductImage = (imageUrl, index = 0) => {
    if (imageUrl && !imageUrl.startsWith('http')) {
      return `${API_BASE_URL.replace('/api', '')}/${imageUrl}`;
    }
    return imageUrl || '/placeholder.jpg';
  };
  const addToCart = () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    
    try {
      const cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          quantity: quantity,
          selectedSize,
          selectedColor
        });
      }
      
      // Save to localStorage
      localStorage.setItem('shopping_cart', JSON.stringify(cart));
      
      // Save to cookies if guest manager is available
      if (guestManager) {
        guestManager.saveCart(cart);
      }
      
      setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
      
      toast.success(`Added ${quantity} item(s) to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error adding to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleFavorite = () => {
    if (guestManager && product) {
      if (isFavorite) {
        guestManager.removeFromWishlist(product.id);
        setIsFavorite(false);
        toast.info('Removed from favorites');
      } else {
        guestManager.addToWishlist(product.id);
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <Button onClick={() => router.push('/')} className="bg-black hover:bg-gray-800">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BAZAR Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">BAZAR</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">Home</Link>
              <Link href="/shop" className="text-gray-700 hover:text-gray-900 font-medium">Shop</Link>
              <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium">About</Link>
              <Link href="/contact" className="text-gray-700 hover:text-gray-900 font-medium">Contact</Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <Search className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-900" />
              <Heart className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-900" />
              <Link href="/checkout" className="relative">
                <ShoppingCart className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-900" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-gray-700">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.category?.name || 'Product'}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>
      </div>      {/* Main Product Section - Responsive Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
          
          {/* Product Images - Responsive Size */}
          <div className="md:col-span-1 lg:col-span-7 space-y-3">
            {/* Main Image with Zoom on Hover - Responsive Height */}
            <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-white rounded-lg overflow-hidden shadow-sm relative group">
              <img
                src={getProductImage(product.images[selectedImageIndex] || product.image)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 cursor-zoom-in"
              />
              {/* Zoom Indicator */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  Hover to zoom
                </div>
              </div>
            </div>
            
            {/* Thumbnail Images - Responsive Grid */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {product.images.slice(0, 6).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-white rounded-md overflow-hidden border-2 transition-all group ${
                      selectedImageIndex === index ? 'border-black' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getProductImage(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>          {/* Product Details - Responsive Layout */}
          <div className="md:col-span-1 lg:col-span-5 space-y-4 lg:space-y-6">
            
            {/* Product Title & Rating - Responsive */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.totalReviews} Reviews)
                </span>
              </div>
            </div>

            {/* Price - Responsive */}
            <div className="flex items-center space-x-3">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                ₺{formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-lg sm:text-xl text-gray-500 line-through">
                  ₺{formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Available Colors - Responsive */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Available Color</h3>
                <div className="flex items-center space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedColor === color ? 'border-gray-900' : 'border-gray-300'
                      } ${
                        color.toLowerCase() === 'black' ? 'bg-black' :
                        color.toLowerCase() === 'white' ? 'bg-white' :
                        color.toLowerCase() === 'gray' ? 'bg-gray-400' :
                        color.toLowerCase() === 'blue' ? 'bg-blue-500' :
                        color.toLowerCase() === 'red' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity - Responsive */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-3 sm:px-4 py-2 border-x border-gray-300 min-w-[50px] text-center text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Available Sizes - Responsive */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Available Size</h3>
                <div className="flex items-center flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 border rounded-md text-sm font-medium transition-all hover:scale-105 ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons - Responsive */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={addToCart}
                disabled={isAddingToCart}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 text-sm sm:text-base font-medium transition-all hover:scale-[1.02]"
              >
                {isAddingToCart ? 'Adding...' : 'ADD TO CART'}
              </Button>              
              <Button
                variant="outline"
                onClick={toggleFavorite}
                className="w-full border-gray-300 hover:bg-gray-50 py-3 text-sm sm:text-base font-medium transition-all hover:scale-[1.02]"
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                {isFavorite ? 'REMOVE FROM WISHLIST' : 'ADD TO WISHLIST'}
              </Button>
            </div>

            {/* Product Info - Responsive */}
            <div className="border-t pt-4 lg:pt-6">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-medium">PRD{product.id}24AA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tags:</span>
                  <span className="font-medium">{product.category?.name || 'Product'}, Fashion, {product.colors?.[0] || 'Style'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Share:</span>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded transition-all hover:scale-110">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges - Responsive */}
            <div className="border-t pt-4 lg:pt-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Truck className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600 mb-1 sm:mb-2" />
                  <span className="text-xs text-gray-600">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600 mb-1 sm:mb-2" />
                  <span className="text-xs text-gray-600">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center">
                  <RefreshCw className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600 mb-1 sm:mb-2" />
                  <span className="text-xs text-gray-600">Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>        {/* Product Tabs - Compact */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              {[
                { id: 'details', label: 'Details' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'discussion', label: 'Discussion' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-all hover:scale-105 ${
                    selectedTab === tab.id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-6">
            {selectedTab === 'details' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 text-sm">{product.description}</p>
                {product.features && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div>
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Reviews</h3>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 ${
                            star <= Math.floor(product.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-2xl font-bold">{product.rating}</span>
                    <span className="text-gray-600">out of 5</span>
                  </div>
                  <p className="text-gray-600">({product.totalReviews} Reviews)</p>
                </div>
              </div>
            )}

            {selectedTab === 'discussion' && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Discussion</h3>
                <p className="text-gray-600">Join the conversation about this product</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BAZAR Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                  <span className="text-black font-bold text-sm">B</span>
                </div>
                <span className="text-xl font-bold">BAZAR</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted destination for quality products and exceptional shopping experience.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/products" className="hover:text-white">Products</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/shipping" className="hover:text-white">Shipping Info</Link></li>
                <li><Link href="/returns" className="hover:text-white">Returns</Link></li>
                <li><Link href="/support" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  +90 (212) 123-4567
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  info@bazar.com
                </li>
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Istanbul, Turkey
                </li>
              </ul>
            </div>
          </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 BAZAR. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
