"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import "./print.css";

export default function InvoicePage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchTodayOrders();
    }
  }, [mounted, selectedDate]);

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    
    if (!token || !userData) {
      toast.error("Please login to access admin dashboard");
      router.push('/admin');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      toast.error("Invalid user data. Please login again.");
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    toast.success("Logged out successfully!");
    router.push('/admin');
  };
  const fetchTodayOrders = async () => {
    setIsLoading(true);
    
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // Create date filter for the API in YYYY-MM-DD format
      const dateFilter = selectedDate;
      
      // Use the date filter to get orders from the selected date
      const response = await fetch(`http://127.0.0.1:8001/api/admin/orders?date=${dateFilter}&per_page=100&sort_by=created_at&sort_order=desc`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data);
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        return;
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("Connection error while fetching orders");
    }
    
    setIsLoading(false);
  };

  // Calculate subtotal (total before tax)
  const calculateSubtotal = () => {
    return orders.reduce((sum, order) => {
      // Remove currency symbol and convert to number
      const amount = parseFloat(order.total.replace(/[^0-9.-]+/g, ""));
      return sum + amount;
    }, 0);
  };

  // Calculate TVA (20%)
  const calculateTVA = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.20;
  };

  // Calculate total with tax
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tva = calculateTVA();
    return subtotal + tva;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  const handlePrint = () => {
    window.print();
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-[210mm] mx-auto p-4 md:p-8 bg-white shadow-lg print:shadow-none">
        {/* Non-printable controls */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <div>
            <h1 className="text-2xl font-bold">Daily Orders Invoice</h1>
            <p className="text-muted-foreground">Generate and print invoices for orders</p>
          </div>
          <div className="flex gap-4">
            <div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button variant="default" onClick={handlePrint}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print Invoice
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Back to Dashboard
            </Button>
          </div>
        </div>
        
        {/* Printable Invoice */}
        <div className="print:text-black">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-bold mb-1">INVOICE</h1>
              <p className="text-sm text-muted-foreground">Invoice Number: {generateInvoiceNumber()}</p>
              <p className="text-sm text-muted-foreground">Date: {format(new Date(selectedDate), 'dd/MM/yyyy')}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold mb-1">ShopApp Inc.</h2>
              <p className="text-sm">123 Commerce Street</p>
              <p className="text-sm">Paris, 75001</p>
              <p className="text-sm">France</p>
              <p className="text-sm">VAT: FR123456789</p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : orders.length > 0 ? (
            <>
              {/* Invoice Table */}
              <table className="w-full border-collapse mb-8">
                <thead>
                  <tr className="border-b-2 border-gray-300 text-left">
                    <th className="py-2 px-1">Order #</th>
                    <th className="py-2 px-1">Customer</th>
                    <th className="py-2 px-1">Date</th>
                    <th className="py-2 px-1">Product</th>
                    <th className="py-2 px-1 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-200">
                      <td className="py-2 px-1 font-medium">{order.order_number}</td>
                      <td className="py-2 px-1">
                        <div>{order.customer}</div>
                        <div className="text-xs text-gray-500">{order.customer_email}</div>
                      </td>
                      <td className="py-2 px-1">{order.date_creation}</td>
                      <td className="py-2 px-1">{order.product_name}</td>
                      <td className="py-2 px-1 text-right font-medium">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Invoice Summary */}
              <div className="flex justify-end">
                <div className="w-60 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal (HT):</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA (20%):</span>
                    <span>{formatCurrency(calculateTVA())}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total (TTC):</span>
                    <span className="font-bold">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
              
              {/* Invoice Footer */}
              <div className="mt-16 text-center text-sm text-gray-500">
                <p className="mb-1">Thank you for your business</p>
                <p>This invoice confirms that all orders listed above were processed through our system.</p>
                <p>Each order is identified by a unique reference number to prevent confusion.</p>
              </div>
              
              <div className="mt-8 text-xs text-gray-400 print:text-gray-600 border-t pt-2">
                <div className="flex justify-between">
                  <span>Generated on: {format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <h3 className="text-xl font-medium mb-2">No orders found for {format(new Date(selectedDate), 'dd/MM/yyyy')}</h3>
              <p className="text-muted-foreground">Try selecting a different date or ensure orders have been placed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
