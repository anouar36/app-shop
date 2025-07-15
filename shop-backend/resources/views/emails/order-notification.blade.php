<x-mail::message>
# 🛍️ New Order Received - {{ $orderNumber }}

Dear Admin,

A new order has been placed on your e-commerce platform. Here are the details:

## 📋 Order Information
- **Order Number:** {{ $orderNumber }}
- **Order Date:** {{ $order->created_at->format('M d, Y H:i') }}
- **Customer Type:** {{ $customerType }}
- **Payment Method:** {{ ucfirst($order->payment_method) }} ({{ $order->method_payment }})
- **Payment Status:** {{ ucfirst($order->payment_status) }}
- **Order Status:** {{ ucfirst($order->status) }}

## 👤 Customer Details
- **Name:** {{ $order->client_name }} {{ $order->client_lastname }}
- **Email:** {{ $order->email }}
- **Phone:** {{ $order->phone }}
@if($order->client_id)
- **Account ID:** {{ $order->client_id }}
@else
- **Account:** Guest Customer (No Account)
@endif

## 🛒 Product Information
- **Product:** {{ $productName }}
- **Price:** {{ $productPrice }}
@if($order->products_id)
- **Product ID:** {{ $order->products_id }}
@endif

## 📅 Delivery Information
@if($order->date_arrival)
- **Expected Delivery:** {{ \Carbon\Carbon::parse($order->date_arrival)->format('M d, Y') }}
@else
- **Expected Delivery:** Not specified
@endif

## 💳 Payment Details
@if($order->payment_method === 'cod')
- **Payment:** Cash on Delivery (Pending payment upon delivery)
@else
- **Payment:** Online Payment
@if($order->payment_code)
- **Payment Code:** {{ $order->payment_code }}
@endif
@if($order->payment_date)
- **Payment Date:** {{ \Carbon\Carbon::parse($order->payment_date)->format('M d, Y H:i') }}
@endif
@endif

<x-mail::button :url="config('app.url') . '/admin'">
View in Admin Dashboard
</x-mail::button>

## 🚀 Next Steps
1. Review the order details in your admin dashboard
2. Verify product availability
3. Process the order for fulfillment
@if($order->payment_method === 'cod')
4. Arrange delivery and collect payment
@else
4. Prepare the order for shipping
@endif

Thank you for using our e-commerce platform!

Best regards,<br>
{{ config('app.name') }} System
</x-mail::message>
