"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    // Simulate chart loading
    const timer = setTimeout(() => {
      setChartLoaded(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { 
      title: "Total Sales", 
      value: "$15,420", 
      change: "+12%", 
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
      title: "New Orders", 
      value: "128", 
      change: "+28%", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-blue-600">
          <path d="M5 7.5V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2h-3.5"></path>
          <path d="M14 2v4"></path>
          <path d="M10 2v4"></path>
          <path d="M2 10h20"></path>
          <path d="M5 14v6"></path>
          <path d="M2 17h6"></path>
        </svg>
      ),
      bgColor: "from-blue-50 to-blue-100/60",
      textColor: "text-blue-600"
    },
    { 
      title: "Customers", 
      value: "3,240", 
      change: "+4%", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-violet-600">
          <path d="M14 19a6 6 0 0 0-12 0"></path>
          <circle cx="8" cy="9" r="4"></circle>
          <path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8"></path>
        </svg>
      ),
      bgColor: "from-violet-50 to-violet-100/60",
      textColor: "text-violet-600" 
    },
    { 
      title: "Inventory", 
      value: "1,240", 
      change: "-2%", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-amber-600">
          <path d="M2 13h3c1 0 1 .7 2.25 1.5C8.63 15.5 9 16 10 16h4c1 0 1.38-.5 2.73-1.5C18 13.76 18 13 19 13h3"></path>
          <path d="M8 13v5c0 1 0 2 2 2h4c2 0 2-1 2-2v-5"></path>
          <path d="M2 10h20"></path>
          <path d="M2 6h20"></path>
          <path d="M2 2h20"></path>
        </svg>
      ),
      bgColor: "from-amber-50 to-amber-100/60",
      textColor: "text-amber-600"
    },
  ];

  const recentOrders = [
    { id: "#ORD-7245", customer: "John Smith", date: "Today, 2:30 PM", status: "Completed", total: "$129.99" },
    { id: "#ORD-7244", customer: "Emily Johnson", date: "Today, 11:15 AM", status: "Processing", total: "$89.50" },
    { id: "#ORD-7243", customer: "Michael Brown", date: "Yesterday", status: "Completed", total: "$245.00" },
    { id: "#ORD-7242", customer: "Sarah Wilson", date: "Yesterday", status: "Shipped", total: "$74.99" },
    { id: "#ORD-7241", customer: "David Lee", date: "Jun 15, 2025", status: "Completed", total: "$199.99" },
  ];

  const topProducts = [
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
    }
  ];

  return (
    <div className="flex min-h-screen bg-muted/20 relative overflow-hidden">
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
              onClick={() => setActiveMenu(item.id)}
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Welcome back, Admin</h1>
                <p className="text-muted-foreground">Here's what's happening with your store today.</p>
              </div>
              <div className="flex gap-2">
                <Button className="group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 mr-2 group-hover:scale-110 transition-transform">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                  Add Product
                </Button>
              </div>
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {stats.map((stat, i) => (
              <Card 
                key={i} 
                className="overflow-hidden hover:shadow-md transition-all animate-slide-up group hover:-translate-y-1" 
                style={{animationDelay: `${i * 0.1}s`}}
              >
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                        <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className="size-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xl shadow-sm transition-all group-hover:shadow-md">
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
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
                  <Button variant="outline" size="sm">
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
              <CardContent className="px-0 md:px-2 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-border/40 [&>th]:px-4 [&>th]:py-3 text-sm font-medium text-muted-foreground">
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/50 transition-colors group [&>td]:px-4 [&>td]:py-3 text-sm">
                          <td className="font-medium text-primary">
                            {order.id}
                          </td>
                          <td>
                            {order.customer}
                          </td>
                          <td className="text-muted-foreground">
                            {order.date}
                          </td>
                          <td>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                              order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              <span className={`mr-1 size-1.5 rounded-full ${
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
                <Button variant="ghost" size="sm" className="text-sm gap-1 hover:text-primary transition-colors">
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
                  <Button variant="outline" size="sm" className="size-9 p-0">
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
                <Button variant="ghost" size="sm" className="text-sm gap-1 hover:text-primary transition-colors">
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
        </div>
      </main>
    </div>
  );
}
