"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const router = useRouter();

  // Animation effect when component mounts
  useEffect(() => {
    setIsInView(true);
  }, []);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call for authentication
    setTimeout(() => {
      if (credentials.username === "admin" && credentials.password === "admin123") {
        toast.success("Login successful! Welcome to the admin dashboard");
        router.push("/admin/dashboard");
      } else {
        toast.error("Invalid username or password. Try admin/admin123");
      }
      setIsLoading(false);
    }, 1500);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/30 p-4">
      <header className="container mx-auto py-4">
        <a href="/" className="flex items-center gap-2 w-fit">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold">S</div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">ShopApp</h1>
        </a>
      </header>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card 
            className={`overflow-hidden border-primary/20 shadow-lg shadow-primary/5 transition-all duration-700 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="bg-gradient-to-r from-primary to-purple-600 h-2"></div>
            <CardHeader className="space-y-2 text-center">
              <div className="flex justify-center mb-2">
                <div className="size-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-8 w-8 animate-pulse-slow">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <path d="M7 7h.01"></path>
                    <path d="M17 7h.01"></path>
                    <path d="M7 17h.01"></path>
                    <path d="M17 17h.01"></path>
                  </svg>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Admin Login</CardTitle>
              <CardDescription>Enter your credentials to access the dashboard</CardDescription>
            </CardHeader>          <CardContent className="py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 group">
                <Label 
                  htmlFor="username" 
                  className="text-sm group-focus-within:text-primary transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-focus-within:text-primary">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Username
                </Label>
                <div className="relative">
                  <Input 
                    id="username"
                    name="username" 
                    type="text"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={handleChange}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 hover:border-primary/50 pl-9"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>
              
              <div className="space-y-2 group">
                <Label 
                  htmlFor="password"
                  className="text-sm group-focus-within:text-primary transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-focus-within:text-primary">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Password
                </Label>
                <div className="relative">
                  <Input 
                    id="password"
                    name="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 hover:border-primary/50 pl-9 pr-10"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <button 
                    type="button" 
                    onClick={togglePasswordVisibility} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                        <line x1="2" x2="22" y1="2" y2="22"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="relative w-4 h-4">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="peer h-4 w-4 opacity-0 absolute"
                    />
                    <div className="absolute inset-0 border rounded bg-background peer-checked:bg-primary/10 peer-checked:border-primary transition-colors"></div>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="absolute inset-0 m-auto text-primary opacity-0 peer-checked:opacity-100 transition-opacity"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <Label htmlFor="remember" className="text-xs font-medium cursor-pointer select-none">Remember me</Label>
                </div>
                <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
              </div>
              
              <Button 
                type="submit" 
                className="w-full group bg-gradient-to-r from-primary to-purple-600 hover:opacity-95 transition-opacity mt-4" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" x2="3" y1="12" y2="12"></line>
                  </svg>
                )}
                {isLoading ? "Authenticating..." : "Sign In to Admin"}
              </Button>
              
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Demo Account</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-center text-muted-foreground">
                <div className="flex flex-col items-center border rounded px-3 py-2">
                  <span>Username</span>
                  <code className="font-mono bg-muted/50 px-1 rounded text-primary">admin</code>
                </div>
                <div className="flex flex-col items-center border rounded px-3 py-2">
                  <span>Password</span>
                  <code className="font-mono bg-muted/50 px-1 rounded text-primary">admin123</code>
                </div>
              </div>
            </form>
          </CardContent>
          
          <Separator />
          <CardFooter className="flex justify-between p-4 text-sm">
            <a href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Back to store
            </a>
            <span className="text-muted-foreground">ShopApp © 2025</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
