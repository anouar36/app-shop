// Adventure-style Shopping Cart Page for BAZAR Store with Cookie Support
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Search, Menu, X, Minus, Plus, Trash2, CreditCard, 
  Shield, Truck, ArrowLeft, Star, ShoppingCart, MapPin, 
  Phone, Mail, User, CheckCircle, Clock, ChevronDown
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

const API_BASE_URL = 'http://127.0.0.1:8001/api';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(15); // Fixed shipping cost
  const [currentStep, setCurrentStep] = useState(1); // 1: Cart, 2: Checkout, 3: Success
  const [customerData, setCustomerData] = useState({
    client_name: '',
    client_lastname: '', 
    email: '',
    phone: '',
    delivery_address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [guestManager, setGuestManager] = useState(null);

  // Initialize Guest Data Manager
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const manager = new GuestDataManager();
      setGuestManager(manager);
      
      // Load saved checkout data
      const savedCheckoutData = manager.getCheckoutData();
      if (savedCheckoutData.client_name) {
        setCustomerData(savedCheckoutData);
      }
      
      // Load saved shipping address
      const savedShipping = manager.getShippingAddress();
      if (savedShipping.delivery_address) {
        setCustomerData(prev => ({ ...prev, ...savedShipping }));
      }
    }
  }, []);

  // Fetch real cart data from localStorage and validate with backend
  useEffect(() => {
    const fetchCartData = async () => {
      setLoading(true);
      try {
        const savedCart = localStorage.getItem('shopping_cart');
        if (!savedCart) {
          setCartItems([]);
          setOrderTotal(0);
          setLoading(false);
          return;
        }

        const cartData = JSON.parse(savedCart);
        if (!Array.isArray(cartData) || cartData.length === 0) {
          setCartItems([]);
          setOrderTotal(0);
          setLoading(false);
          return;
        }

        // Fetch product details from backend to ensure current pricing
        const productPromises = cartData.map(async (item) => {
          try {
            const response = await fetch(`${API_BASE_URL}/products/${item.id}`);
            if (response.ok) {
              const product = await response.json();
              return {
                id: product.id,
                name: product.name,
                price: parseFloat(product.current_price || product.price),
                originalPrice: parseFloat(product.price),
                quantity: item.quantity || 1,
                image: product.image || product.images?.[0] || '/placeholder.jpg',
                category: product.category?.name || 'Product',
                size: product.size || 'One Size'
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching product ${item.id}:`, error);
            return null;
          }
        });

        const validProducts = (await Promise.all(productPromises)).filter(Boolean);
        setCartItems(validProducts);
        
        // Calculate totals
        const itemsSubtotal = validProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxAmount = itemsSubtotal * 0.18; // 18% tax
        const totalAmount = itemsSubtotal + taxAmount + shipping;
        
        setSubtotal(itemsSubtotal);
        setTax(taxAmount);
        setOrderTotal(totalAmount);

      } catch (error) {
        console.error('Error loading cart data:', error);
        toast.error('Failed to load cart data');
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cartItems.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    
    // Update localStorage
    localStorage.setItem('shopping_cart', JSON.stringify(
      updatedCart.map(item => ({ id: item.id, quantity: item.quantity }))
    ));

    // Recalculate totals
    const itemsSubtotal = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = itemsSubtotal * 0.18;
    const totalAmount = itemsSubtotal + taxAmount + shipping;
    
    setSubtotal(itemsSubtotal);
    setTax(taxAmount);
    setOrderTotal(totalAmount);
  };
  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
    
    // Update localStorage
    localStorage.setItem('shopping_cart', JSON.stringify(
      updatedCart.map(item => ({ id: item.id, quantity: item.quantity }))
    ));

    // Update cookies
    if (guestManager) {
      guestManager.saveCart(updatedCart.map(item => ({ id: item.id, quantity: item.quantity })));
    }

    // Recalculate totals
    const itemsSubtotal = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = itemsSubtotal * 0.18;
    const totalAmount = itemsSubtotal + taxAmount + shipping;
    
    setSubtotal(itemsSubtotal);
    setTax(taxAmount);
    setOrderTotal(totalAmount);
  };

  const getProductImage = (product) => {
    if (product.image) {
      return `http://127.0.0.1:8001/${product.image}`;
    }
    return "/placeholder.jpg";
  };

  const handleCustomerDataChange = (field, value) => {
    setCustomerData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Save to cookies for guest users
      if (guestManager) {
        guestManager.saveCheckoutData(updated);
        
        // Save shipping address separately
        if (field === 'delivery_address') {
          guestManager.saveShippingAddress({ delivery_address: value });
        }
      }
        return updated;
    });
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setCurrentStep(2);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Basic validation
    if (!customerData.client_name || !customerData.email || !customerData.phone || !customerData.delivery_address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessingOrder(true);

    try {
      const orderData = {
        client_name: customerData.client_name,
        client_lastname: customerData.client_lastname,
        email: customerData.email,
        phone: customerData.phone,
        delivery_address: customerData.delivery_address,
        status: 'pending',
        total_price: orderTotal,
        order_items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Order placed successfully!');
        
        // Clear cart
        localStorage.removeItem('shopping_cart');
        setCartItems([]);
        setOrderTotal(0);
        setCurrentStep(3);
        
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessingOrder(false);
    }
  };

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
              <Link href="/products" className="text-gray-700 hover:text-gray-900 font-medium">Products</Link>
              <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium">About</Link>
              <Link href="/contact" className="text-gray-700 hover:text-gray-900 font-medium">Contact</Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <Search className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-900" />
              <Heart className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-900" />
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-900" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Step 1: Shopping Cart */}
        {currentStep === 1 && (
          <>
            {/* Breadcrumb */}
            <nav className="mb-8">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-gray-700">Home</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">Shopping Cart</span>
              </div>
            </nav>

            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
              <p className="text-gray-600">Review your items and proceed to checkout</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Add some products to get started</p>
                <Button onClick={() => window.location.href = '/'} className="bg-black hover:bg-gray-800 text-white">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b">
                      <h2 className="text-lg font-semibold text-gray-900">Cart Items ({cartItems.length})</h2>
                    </div>
                    
                    <div className="divide-y">
                      {cartItems.map((item) => (
                        <div key={item.id} className="p-6">
                          <div className="flex items-start space-x-4">
                            {/* Product Image */}
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                              <img 
                                src={getProductImage(item)} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                  <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                                  <p className="text-sm text-gray-500">Size: {item.size}</p>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-gray-400 hover:text-red-500 p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <div className="flex items-center justify-between mt-4">
                                {/* Quantity Controls */}
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                    className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                                
                                {/* Price */}
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900">₺{(item.price * item.quantity).toFixed(2)}</div>
                                  {item.originalPrice > item.price && (
                                    <div className="text-sm text-gray-500 line-through">₺{(item.originalPrice * item.quantity).toFixed(2)}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm sticky top-24">
                    <div className="px-6 py-4 border-b">
                      <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">₺{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (18%)</span>
                        <span className="font-medium">₺{tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium">₺{shipping.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>₺{orderTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="px-6 pb-6">
                      <Button 
                        onClick={proceedToCheckout}
                        className="w-full bg-black hover:bg-gray-800 text-white py-3"
                      >
                        Proceed to Checkout
                      </Button>
                      
                      <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-1" />
                          Secure Checkout
                        </div>
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-1" />
                          Free Returns
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 2: Checkout Form */}
        {currentStep === 2 && (
          <>
            {/* Back Button */}
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Cart
            </button>

            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
              <p className="text-gray-600">Complete your order details</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Contact Information
                    </h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client_name">First Name *</Label>
                        <Input
                          id="client_name"
                          value={customerData.client_name}
                          onChange={(e) => handleCustomerDataChange('client_name', e.target.value)}
                          placeholder="Enter your first name"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="client_lastname">Last Name *</Label>
                        <Input
                          id="client_lastname"
                          value={customerData.client_lastname}
                          onChange={(e) => handleCustomerDataChange('client_lastname', e.target.value)}
                          placeholder="Enter your last name"
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerData.email}
                        onChange={(e) => handleCustomerDataChange('email', e.target.value)}
                        placeholder="Enter your email address"
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => handleCustomerDataChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Delivery Address
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <Label htmlFor="delivery_address">Full Address *</Label>
                    <textarea
                      id="delivery_address"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      rows="4"
                      value={customerData.delivery_address}
                      onChange={(e) => handleCustomerDataChange('delivery_address', e.target.value)}
                      placeholder="Enter your full delivery address including street, city, postal code"
                      required
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Method
                    </h2>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                        paymentMethod === 'credit-card' ? 'border-black bg-gray-50' : 'border-gray-200'
                      }`}
                      onClick={() => setPaymentMethod('credit-card')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            paymentMethod === 'credit-card' ? 'border-black bg-black' : 'border-gray-300'
                          }`}>
                            {paymentMethod === 'credit-card' && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                          <CreditCard className="h-5 w-5 text-gray-600" />
                          <span className="font-medium">Credit/Debit Card</span>
                        </div>
                        <div className="flex space-x-2">
                          <div className="text-xs text-gray-500">Visa, Mastercard</div>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                        paymentMethod === 'cash' ? 'border-black bg-gray-50' : 'border-gray-200'
                      }`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          paymentMethod === 'cash' ? 'border-black bg-black' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'cash' && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <span className="font-medium">Cash on Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm sticky top-24">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                  </div>
                  
                  <div className="p-6">
                    {/* Order Items */}
                    <div className="space-y-3 mb-6">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={getProductImage(item)} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                          </div>
                          <div className="text-sm font-medium">₺{(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="mb-4" />
                    
                    {/* Price Breakdown */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span>₺{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (18%)</span>
                        <span>₺{tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span>₺{shipping.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>₺{orderTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleCheckout}
                      disabled={isProcessingOrder}
                      className="w-full bg-black hover:bg-gray-800 text-white py-3"
                    >
                      {isProcessingOrder ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                    
                    <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        SSL Secured
                      </div>
                      <div className="flex items-center">
                        <Truck className="h-3 w-3 mr-1" />
                        Express Delivery
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Order Success */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. Your order has been placed successfully and you will receive a confirmation email shortly.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="text-sm text-gray-600 mb-2">Order Total</div>
                <div className="text-2xl font-bold text-gray-900">₺{orderTotal.toFixed(2)}</div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Continue Shopping
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/orders'}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  View Orders
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BAZAR Footer */}
      <footer className="bg-gray-900 text-white mt-16">
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
