<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Notification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: bold;
        }
        
        .header .order-number {
            font-size: 18px;
            opacity: 0.9;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            margin-top: 10px;
        }
        
        .priority-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .priority-high {
            background: #ff6b6b;
            color: white;
        }
        
        .priority-urgent {
            background: #e74c3c;
            color: white;
            animation: pulse 2s infinite;
        }
        
        .priority-normal {
            background: #3498db;
            color: white;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .content {
            padding: 30px;
        }
        
        .alert-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 25px;
            text-align: center;
        }
        
        .alert-box h3 {
            color: #856404;
            margin-bottom: 5px;
        }
        
        .alert-box p {
            color: #856404;
            margin: 0;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section h2 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 20px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 8px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
                gap: 15px;
            }
        }
        
        .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        
        .info-item strong {
            color: #2c3e50;
            display: block;
            margin-bottom: 5px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-item span {
            color: #34495e;
            font-size: 16px;
        }
        
        .product-details {
            background: linear-gradient(45deg, #f8f9fa, #e9ecef);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .amount-highlight {
            background: #d5f4e6;
            color: #27ae60;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 18px;
        }
        
        .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-new {
            background: #d4edda;
            color: #155724;
        }
        
        .action-buttons {
            text-align: center;
            margin: 30px 0;
        }
        
        .btn {
            display: inline-block;
            padding: 14px 28px;
            margin: 0 10px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
        }
        
        .btn-secondary {
            background: linear-gradient(45deg, #95a5a6, #7f8c8d);
            color: white;
        }
        
        .quick-actions {
            background: #e8f4fd;
            border: 1px solid #3498db;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .quick-actions h3 {
            color: #2980b9;
            margin-bottom: 15px;
        }
        
        .quick-actions ul {
            list-style: none;
            padding: 0;
        }
        
        .quick-actions li {
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
        }
        
        .quick-actions li:before {
            content: "→";
            position: absolute;
            left: 0;
            color: #3498db;
            font-weight: bold;
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            padding: 25px;
            text-align: center;
        }
        
        .footer p {
            margin: 5px 0;
            opacity: 0.8;
        }
        
        .footer .timestamp {
            font-size: 12px;
            opacity: 0.6;
        }
        
        .contact-info {
            background: #34495e;
            padding: 15px;
            margin-top: 15px;
            border-radius: 6px;
        }
        
        .contact-info h4 {
            margin-bottom: 10px;
            color: #ecf0f1;
        }
        
        .contact-info p {
            margin: 5px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header" style="position: relative;">
            @if($urgencyLevel === 'urgent')
                <div class="priority-badge priority-urgent">🔥 URGENT</div>
            @elseif($urgencyLevel === 'high')
                <div class="priority-badge priority-high">⚡ HIGH PRIORITY</div>
            @else
                <div class="priority-badge priority-normal">📋 NORMAL</div>
            @endif
            
            <h1>🛒 New Order Received!</h1>
            <div class="order-number">Order #{{ $order->id }}</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Alert Box -->
            <div class="alert-box">
                <h3>⚡ Action Required</h3>
                <p>A new order has been placed and requires your immediate attention.</p>
            </div>
            
            <!-- Customer Information -->
            <div class="section">
                <h2>👤 Customer Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Customer Name</strong>
                        <span>{{ $customerName }}</span>
                    </div>
                    <div class="info-item">
                        <strong>Email Address</strong>
                        <span>{{ $order->email }}</span>
                    </div>
                    <div class="info-item">
                        <strong>Phone Number</strong>
                        <span>{{ $order->phone }}</span>
                    </div>
                    <div class="info-item">
                        <strong>Customer Type</strong>
                        <span>{{ $order->client_id ? 'Registered User' : 'Guest Customer' }}</span>
                    </div>
                </div>
            </div>
            
            <!-- Product & Order Details -->
            <div class="section">
                <h2>🛍️ Order Details</h2>
                <div class="product-details">
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Product</strong>
                            <span>{{ $productName }}</span>
                        </div>
                        <div class="info-item">
                            <strong>Total Amount</strong>
                            <span class="amount-highlight">${{ $totalAmount }}</span>
                        </div>
                        <div class="info-item">
                            <strong>Payment Method</strong>
                            <span>{{ ucfirst(str_replace('_', ' ', $order->payment_method)) }}</span>
                        </div>
                        <div class="info-item">
                            <strong>Order Status</strong>
                            <span class="status-badge status-{{ $order->status }}">{{ ucfirst($order->status) }}</span>
                        </div>
                        <div class="info-item">
                            <strong>Order Date</strong>
                            <span>{{ $formattedDate }}</span>
                        </div>
                        <div class="info-item">
                            <strong>Payment Status</strong>
                            <span class="status-badge status-{{ $order->payment_status }}">{{ ucfirst($order->payment_status) }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="action-buttons">
                <a href="{{ $actionUrl }}" class="btn btn-primary">📋 View Order Details</a>
                <a href="{{ $dashboardUrl }}" class="btn btn-secondary">🏠 Go to Dashboard</a>
            </div>
            
            <!-- Quick Actions -->
            <div class="quick-actions">
                <h3>🚀 Quick Actions Available</h3>
                <ul>
                    <li>Review and confirm the order</li>
                    <li>Update order status</li>
                    <li>Contact customer if needed</li>
                    <li>Process payment (if COD)</li>
                    <li>Prepare for shipping</li>
                </ul>
            </div>
            
            <!-- Contact Customer -->
            @if($order->email || $order->phone)
            <div class="section">
                <h2>📞 Contact Customer</h2>
                <div class="info-grid">
                    @if($order->email)
                    <div class="info-item">
                        <strong>Send Email</strong>
                        <span><a href="mailto:{{ $order->email }}?subject=Order #{{ $order->id }} Update">{{ $order->email }}</a></span>
                    </div>
                    @endif
                    @if($order->phone)
                    <div class="info-item">
                        <strong>Call Customer</strong>
                        <span><a href="tel:{{ $order->phone }}">{{ $order->phone }}</a></span>
                    </div>
                    @endif
                </div>
            </div>
            @endif
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <h4>Ayoube Shop Admin Panel</h4>
            <p>This is an automated notification from your e-commerce system.</p>
            <p>Please log in to your admin dashboard to manage this order.</p>
            
            <div class="contact-info">
                <h4>Need Help?</h4>
                <p>Admin Email: {{ config('mail.from.address') }}</p>
                <p>Dashboard: <a href="{{ $dashboardUrl }}" style="color: #3498db;">{{ $dashboardUrl }}</a></p>
            </div>
            
            <p class="timestamp">Generated on {{ now()->format('F j, Y \a\t g:i A T') }}</p>
        </div>
    </div>
</body>
</html>
