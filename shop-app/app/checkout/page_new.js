"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API_BASE_URL = 'http://127.0.0.1:8001/api';

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1); // Start at Cart step
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState('ziraat');
  const [orderTotal, setOrderTotal] = useState(0);
  const [customerData, setCustomerData] = useState({
    client_name: '',
    client_lastname: '', 
    email: '',
    phone: '',
    delivery_address: ''
  });
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Fetch real cart data from localStorage and validate with backend
  useEffect(() => {
    const fetchCartData = async () => {
      setLoading(true);
      try {
        // Get cart from localStorage
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
                quantity: item.quantity || 1,
                image: product.image || product.images?.[0] || '/api/placeholder/50/50',
                category: product.category?.name || 'Product'
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
        
        // Calculate total
        const total = validProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setOrderTotal(total);

      } catch (error) {
        console.error('Error loading cart data:', error);
        toast.error('Failed to load cart data');
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const steps = [
    { id: 1, name: "Cart", completed: currentStep > 1, current: currentStep === 1 },
    { id: 2, name: "Addresses", completed: currentStep > 2, current: currentStep === 2 },
    { id: 3, name: "Payment", completed: currentStep > 3, current: currentStep === 3 },
    { id: 4, name: "Confirm", completed: false, current: currentStep === 4 }
  ];

  // Update payment cards to include real payment methods
  const paymentCards = [
    {
      id: 'ziraat',
      bank: 'Ziraat Bankası',
      cardNumber: '****1234',
      cardHolder: 'Card Holder',
      expiry: '12/25',
      selected: true
    },
    {
      id: 'is',
      bank: 'T. İş Bankası',
      cardNumber: '****5678',
      cardHolder: 'Card Holder',
      expiry: '03/26',
      selected: false
    }
  ];

  const handleCardSelection = (cardId) => {
    setSelectedCard(cardId);
  };

  const handleCustomerDataChange = (field, value) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

    // Recalculate total
    const total = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setOrderTotal(total);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
    
    // Update localStorage
    localStorage.setItem('shopping_cart', JSON.stringify(
      updatedCart.map(item => ({ id: item.id, quantity: item.quantity }))
    ));

    // Recalculate total
    const total = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setOrderTotal(total);

    if (updatedCart.length === 0) {
      toast.info('Your cart is now empty');
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      return cartItems.length > 0;
    }
    if (currentStep === 2) {
      return customerData.client_name && customerData.client_lastname && 
             customerData.email && customerData.phone && customerData.delivery_address;
    }
    if (currentStep === 3) {
      return selectedCard;
    }
    return true;
  };

  const processOrder = async () => {
    if (!validateStep()) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsProcessingOrder(true);
    
    try {
      // Create orders for each product in cart
      const orderPromises = cartItems.map(async (item) => {
        const orderData = {
          products_id: item.id,
          client_name: customerData.client_name,
          client_lastname: customerData.client_lastname,
          email: customerData.email,
          phone: customerData.phone,
          delivery_address: customerData.delivery_address,
          method_payment: selectedCard === 'ziraat' ? 'Ziraat Bankası' : 'T. İş Bankası',
          payment_method: 'online', // Since using card payment
          quantity: item.quantity,
          special_instructions: `Order placed via checkout - ${item.quantity}x ${item.name}`
        };

        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create order');
        }

        return await response.json();
      });

      const orderResults = await Promise.all(orderPromises);
      
      // Clear cart
      localStorage.removeItem('shopping_cart');
      setCartItems([]);
      setOrderTotal(0);
      
      toast.success(`Successfully placed ${orderResults.length} order(s)!`);
      
      // Move to confirmation step or redirect
      setCurrentStep(4);
      
      // Optional: Redirect to order confirmation page after delay
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);

    } catch (error) {
      console.error('Order processing error:', error);
      toast.error(error.message || 'Failed to process order. Please try again.');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      if (currentStep === 1) {
        toast.error('Your cart is empty. Add some products first!');
      } else if (currentStep === 2) {
        toast.error('Please fill in all delivery information');
      } else if (currentStep === 3) {
        toast.error('Please select a payment method');
      }
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      processOrder();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    step.completed ? 'bg-green-500 border-green-500 text-white' :
                    step.current ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-gray-200 border-gray-300 text-gray-500'
                  }`}>
                    {step.completed ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    step.current ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Back Button */}
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}

            {/* Step 1: Cart */}
            {currentStep === 1 && (
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Shopping Cart</CardTitle>
                  <p className="text-gray-600">Review your items before checkout</p>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading your cart...</p>
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                      <p className="text-gray-600 mb-4">Add some products to get started</p>
                      <Button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-700">
                        Continue Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.category}</p>
                              <p className="text-lg font-bold text-green-600">₺{item.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 p-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Customer Information */}
            {currentStep === 2 && (
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Delivery Information</CardTitle>
                  <p className="text-gray-600">Please provide your contact and delivery details</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client_name">First Name *</Label>
                      <Input
                        id="client_name"
                        value={customerData.client_name}
                        onChange={(e) => handleCustomerDataChange('client_name', e.target.value)}
                        placeholder="Enter your first name"
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
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery_address">Delivery Address *</Label>
                    <textarea
                      id="delivery_address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      value={customerData.delivery_address}
                      onChange={(e) => handleCustomerDataChange('delivery_address', e.target.value)}
                      placeholder="Enter your full delivery address"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment Method */}
            {currentStep === 3 && (
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Payment Method</CardTitle>
                  <p className="text-gray-600">Choose your preferred payment option</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paymentCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => handleCardSelection(card.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedCard === card.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedCard === card.id ? 'border-green-500 bg-green-500' : 'border-gray-300'
                          }`}>
                            {selectedCard === card.id && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{card.bank}</div>
                            <div className="text-xs text-gray-500">Card ending in: {card.cardNumber}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-900">{card.cardHolder}</div>
                          <div className="text-xs text-gray-500">Expires: {card.expiry}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Card Button */}
                  <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add new card
                    </div>
                  </button>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Order Confirmation */}
            {currentStep === 4 && (
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-green-600">Order Confirmed!</CardTitle>
                  <p className="text-gray-600">Thank you for your purchase</p>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your order has been placed successfully!</h3>
                  <p className="text-gray-600 mb-4">You will receive a confirmation email shortly.</p>
                  <Button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-700">
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-sm sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <div className="w-6 h-6 bg-green-100 rounded mr-3 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  Order Summary
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">{cartItems.length} item(s) in your cart</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-gray-600 border-b pb-2">
                    <span>Product name</span>
                    <div className="flex space-x-8">
                      <span>Qty</span>
                      <span>Price</span>
                    </div>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        </div>
                        <div className="flex items-center space-x-8">
                          <span className="text-sm text-gray-600">x{item.quantity}</span>
                          <span className="text-sm font-medium text-gray-900">₺{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">₺{orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-4">
                <Button 
                  onClick={handleNext}
                  disabled={isProcessingOrder}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isProcessingOrder ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : currentStep === 1 ? 'Proceed to Checkout' : 
                      currentStep === 2 ? 'Choose Payment' :
                      currentStep === 3 ? 'Place Order' : 'Complete'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
