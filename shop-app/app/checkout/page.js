"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Handle scroll effect for the header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
      toast.success("Payment successful! Your order has been placed.");
      setIsProcessing(false);
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <header className={`border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur transition-all duration-300 ${scrolled ? 'shadow-sm py-2' : 'py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold">S</div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 ml-2">ShopApp</h1>
            </a>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-sm font-medium hover:underline underline-offset-4 hover:text-primary transition-colors">Home</a>
            <a href="/#products-section" className="text-sm font-medium hover:underline underline-offset-4 hover:text-primary transition-colors">Products</a>
            <a href="/#" className="text-sm font-medium hover:underline underline-offset-4 hover:text-primary transition-colors">Categories</a>
          </nav>
          
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-primary/10" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-fade-in h-6 w-6">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M4 6h16"></path>
                  <path d="M4 12h16"></path>
                  <path d="M4 18h16"></path>
                </svg>
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div 
          className={`md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg transform transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <nav className="flex flex-col p-4 gap-2 animate-fade-down">
            <a 
              href="/" 
              className="text-sm font-medium p-2 hover:bg-primary/10 rounded-md hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="/#products-section" 
              className="text-sm font-medium p-2 hover:bg-primary/10 rounded-md hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </a>
            <a 
              href="/#" 
              className="text-sm font-medium p-2 hover:bg-primary/10 rounded-md hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </a>
          </nav>
        </div>
      </header>      
      <main className="container mx-auto px-4 py-8 md:py-12 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Checkout</h1>
          <p className="text-muted-foreground mb-6">Complete your purchase</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-primary/20 shadow-lg shadow-primary/5 animate-slide-up" style={{animationDelay: '0.1s'}}>
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-5 w-5">
                      <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h16a2 2 0 0 1 1.2.4"></path>
                      <path d="M2 10h20"></path>
                      <path d="M7 15h.01"></path>
                      <path d="M11 15h2"></path>
                      <path d="m16.5 13.5-1 1"></path>
                      <path d="m19.5 10.5-1 1"></path>
                      <path d="m16.5 10.5 3 3"></path>
                    </svg>
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                      <Label htmlFor="firstName" className="text-sm group-focus-within:text-primary transition-colors">First Name</Label>
                      <Input 
                        id="firstName" 
                        className="focus:ring-2 focus:ring-primary/20 transition-shadow hover:border-primary/50" 
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <Label htmlFor="lastName" className="text-sm group-focus-within:text-primary transition-colors">Last Name</Label>
                      <Input 
                        id="lastName" 
                        className="focus:ring-2 focus:ring-primary/20 transition-shadow hover:border-primary/50" 
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="address" className="text-sm group-focus-within:text-primary transition-colors">Address</Label>
                    <Input 
                      id="address" 
                      className="focus:ring-2 focus:ring-primary/20 transition-shadow hover:border-primary/50" 
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                      <Label htmlFor="city" className="text-sm group-focus-within:text-primary transition-colors">City</Label>
                      <Input 
                        id="city" 
                        className="focus:ring-2 focus:ring-primary/20 transition-shadow hover:border-primary/50" 
                        placeholder="New York"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <Label htmlFor="postalCode" className="text-sm group-focus-within:text-primary transition-colors">Postal Code</Label>
                      <Input 
                        id="postalCode" 
                        className="focus:ring-2 focus:ring-primary/20 transition-shadow hover:border-primary/50" 
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="country" className="text-sm group-focus-within:text-primary transition-colors">Country</Label>
                    <Input 
                      id="country" 
                      className="focus:ring-2 focus:ring-primary/20 transition-shadow hover:border-primary/50" 
                      placeholder="United States"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20 shadow-lg shadow-primary/5 animate-slide-up" style={{animationDelay: '0.2s'}}>
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-5 w-5">
                      <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                      <line x1="2" x2="22" y1="10" y2="10"></line>
                    </svg>
                    Payment Method
                  </CardTitle>
                  <CardDescription>Choose your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div 
                          className={`border rounded-xl p-4 h-24 flex flex-col justify-center items-center gap-2 cursor-pointer transition-all hover:shadow-md ${paymentMethod === "creditCard" 
                            ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md shadow-primary/10" 
                            : "border-input hover:border-primary/50"}`}
                          onClick={() => setPaymentMethod("creditCard")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-6 w-6 transition-transform ${paymentMethod === "creditCard" ? "text-primary scale-110" : ""}`}>
                            <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                            <line x1="2" x2="22" y1="10" y2="10"></line>
                          </svg>
                          <span className={`text-sm font-medium transition-colors ${paymentMethod === "creditCard" ? "text-primary" : ""}`}>Credit Card</span>
                        </div>
                      </div>
                      
                      <div>
                        <div 
                          className={`border rounded-xl p-4 h-24 flex flex-col justify-center items-center gap-2 cursor-pointer transition-all hover:shadow-md ${paymentMethod === "paypal" 
                            ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md shadow-primary/10" 
                            : "border-input hover:border-primary/50"}`}
                          onClick={() => setPaymentMethod("paypal")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-6 w-6 transition-transform ${paymentMethod === "paypal" ? "text-primary scale-110" : ""}`}>
                            <path d="M7 11.5h2a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H7z"></path>
                            <path d="M13 7.5h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2z"></path>
                            <path d="M4 18.5h14"></path>
                            <path d="M6 18.5v-4"></path>
                            <path d="M16 18.5v-4"></path>
                          </svg>
                          <span className={`text-sm font-medium transition-colors ${paymentMethod === "paypal" ? "text-primary" : ""}`}>PayPal</span>
                        </div>
                      </div>
                      
                      <div>
                        <div 
                          className={`border rounded-xl p-4 h-24 flex flex-col justify-center items-center gap-2 cursor-pointer transition-all hover:shadow-md ${paymentMethod === "applePay" 
                            ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md shadow-primary/10" 
                            : "border-input hover:border-primary/50"}`}
                          onClick={() => setPaymentMethod("applePay")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-6 w-6 transition-transform ${paymentMethod === "applePay" ? "text-primary scale-110" : ""}`}>
                            <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path>
                            <path d="M10 2c1 .5 2 2 2 5"></path>
                          </svg>
                          <span className={`text-sm font-medium transition-colors ${paymentMethod === "applePay" ? "text-primary" : ""}`}>Apple Pay</span>
                        </div>
                      </div>
                    </div>
                    
                    {paymentMethod === "creditCard" && (
                      <div className="space-y-4 mt-6 animate-fade-down">
                        <div className="space-y-2 group">
                          <Label htmlFor="cardName" className="text-sm group-focus-within:text-primary transition-colors">Name on Card</Label>
                          <Input 
                            id="cardName" 
                            placeholder="John Smith" 
                            className="focus:ring-2 focus:ring-primary/20 transition-shadow hover:border-primary/50" 
                          />
                        </div>
                        <div className="space-y-2 group">
                          <Label htmlFor="cardNumber" className="text-sm group-focus-within:text-primary transition-colors">Card Number</Label>
                          <Input 
                            id="cardNumber" 
                            placeholder="4242 4242 4242 4242" 
                            className="focus:ring-2 focus:ring-primary/20 transition-shadow hover:border-primary/50" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2 group">
                            <Label htmlFor="expDate" className="text-sm group-focus-within:text-primary transition-colors">Expiration Date</Label>
                            <Input 
                              id="expDate" 
                              placeholder="MM/YY" 
                              className="focus:ring-2 focus:ring-primary/20 transition-shadow hover:border-primary/50" 
                            />
                          </div>
                          <div className="space-y-2 group">
                            <Label htmlFor="cvv" className="text-sm group-focus-within:text-primary transition-colors">CVV</Label>
                            <Input 
                              id="cvv" 
                              placeholder="123" 
                              className="focus:ring-2 focus:ring-primary/20 transition-shadow hover:border-primary/50" 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {paymentMethod === "paypal" && (
                      <div className="border rounded-md p-4 mt-6 bg-muted/30 text-center animate-fade-down">
                        <p>You will be redirected to PayPal to complete your payment</p>
                      </div>
                    )}
                    
                    {paymentMethod === "applePay" && (
                      <div className="border rounded-md p-4 mt-6 bg-muted/30 text-center animate-fade-down">
                        <p>You will complete your payment using Apple Pay</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
              <div>
              <Card className="border-primary/20 shadow-lg shadow-primary/5 animate-slide-up sticky top-24" style={{animationDelay: '0.3s'}}>
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-5 w-5">
                      <circle cx="8" cy="21" r="1"></circle>
                      <circle cx="19" cy="21" r="1"></circle>
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                    </svg>
                    Order Summary
                  </CardTitle>
                  <CardDescription>3 items in your cart</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3 group hover:border-primary/30 hover:bg-muted/20 transition-colors cursor-pointer">
                      <div className="flex gap-4">
                        <div className="h-16 w-16 rounded-md overflow-hidden relative">
                          <img 
                            src="/products/clothing.jpg" 
                            alt="Classic T-Shirt" 
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                          <p className="font-medium group-hover:text-primary transition-colors">Classic T-Shirt</p>
                          <p className="text-xs text-muted-foreground">Size: Medium • Color: Blue</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="font-bold">$29.99</p>
                            <div className="flex items-center text-xs bg-muted rounded-full px-2 py-0.5">
                              <button className="hover:text-primary">-</button>
                              <span className="mx-2 font-medium">1</span>
                              <button className="hover:text-primary">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3 group hover:border-primary/30 hover:bg-muted/20 transition-colors cursor-pointer">
                      <div className="flex gap-4">
                        <div className="h-16 w-16 rounded-md overflow-hidden relative">
                          <img 
                            src="/products/clothing.jpg" 
                            alt="Designer Jeans" 
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                          <p className="font-medium group-hover:text-primary transition-colors">Designer Jeans</p>
                          <p className="text-xs text-muted-foreground">Size: 32 • Color: Dark Blue</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="font-bold">$89.99</p>
                            <div className="flex items-center text-xs bg-muted rounded-full px-2 py-0.5">
                              <button className="hover:text-primary">-</button>
                              <span className="mx-2 font-medium">1</span>
                              <button className="hover:text-primary">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3 group hover:border-primary/30 hover:bg-muted/20 transition-colors cursor-pointer">
                      <div className="flex gap-4">
                        <div className="h-16 w-16 rounded-md overflow-hidden relative">
                          <img 
                            src="/products/accessories.jpg" 
                            alt="Leather Wallet" 
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                          <p className="font-medium group-hover:text-primary transition-colors">Leather Wallet</p>
                          <p className="text-xs text-muted-foreground">Color: Brown</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="font-bold">$39.99</p>
                            <div className="flex items-center text-xs bg-muted rounded-full px-2 py-0.5">
                              <button className="hover:text-primary">-</button>
                              <span className="mx-2 font-medium">1</span>
                              <button className="hover:text-primary">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-2">
                      <div className="relative">
                        <Input 
                          placeholder="Promo code" 
                          className="pr-20 focus:ring-2 focus:ring-primary/20 transition-shadow hover:border-primary/50"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="absolute right-1 top-1 h-7 hover:text-primary hover:border-primary transition-colors"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-2 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span>Subtotal</span>
                        <span>$159.97</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Shipping</span>
                        <span>$12.00</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Tax</span>
                        <span>$17.28</span>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Total</span>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">$189.25</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity" 
                    onClick={handleSubmit} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : "Complete Payment"}
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  <span className="text-sm text-muted-foreground">Secure checkout</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                    <path d="M7 10v12"></path>
                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                  </svg>
                  <span className="text-sm text-muted-foreground">100% Satisfaction Guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                    <path d="m4.6 13.11 5.79-3.21c1.89-1.05 4.79 1.78 3.71 3.71l-3.22 5.81C8.8 23.16.79 15.23 4.6 13.11Z"></path>
                    <path d="m10.5 9.5-1-2.29C9.2 6.48 8.8 6 8 6H4.5C2.79 6 2 6.5 2 8.5a7.71 7.71 0 0 0 2 4.83"></path>
                    <path d="M8 15h8"></path>
                    <path d="M12.5 3v2.5"></path>
                    <path d="M16 3v4"></path>
                    <path d="M19.5 3v6"></path>
                  </svg>
                  <span className="text-sm text-muted-foreground">Fast Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
