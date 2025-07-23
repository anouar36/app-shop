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
        window.location.href = '/orders/confirmation';
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            
            {/* Back Button */}
            <button 
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Addresses
            </button>

            {/* Registered Cards Section */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <div className="w-6 h-6 bg-gray-100 rounded mr-3 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  Registered cards
                </CardTitle>
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
                          <div className="text-xs text-gray-500">Son dört hane: {card.cardNumber}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-900">{card.cardHolder}</div>
                        <div className="text-xs text-gray-500">Son kullanma tarihi: {card.expiry}</div>
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
                  Alışveriş Özeti
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">{cartItems.length} item in your cart</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-gray-600 border-b pb-2">
                    <span>Product name</span>
                    <div className="flex space-x-8">
                      <span>Portion</span>
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
                          <span className="text-sm text-gray-600">{item.portion}</span>
                          <span className="text-sm font-medium text-gray-900">{item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Toplam:</span>
                    <span className="text-lg font-bold text-gray-900">₺{orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-4">
                <Button 
                  onClick={handleNext}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Review your order
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
