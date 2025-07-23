@component('mail::message')
# 📊 Processing Orders Report

Hello Admin,

Your AI agent has detected **{{ $ordersCount }} orders** with status "processing" and has automatically generated a detailed Excel report for you.

## 📈 Report Summary

@component('mail::panel')
**Orders Summary:**
- **Total Orders:** {{ $ordersCount }}
- **Total Value:** {{ $totalValue }}
- **Average Order Value:** {{ $averageValue }}
- **Orders with Delivery Address:** {{ $reportSummary['orders_with_location'] }}
- **Generated:** {{ $generatedAt }}
@endcomponent

## 📋 Report Contents

The attached Excel file contains the following information for each order:

- ✅ **Order Price** - Total amount for each order
- ✅ **Product Name** - Detailed product information
- ✅ **Client Location** - Delivery address when available
- ✅ **Client Name** - Full customer name
- ✅ **Order Creation Date** - When the order was placed
- ✅ **Payment Method** - How customer will pay
- ✅ **Contact Information** - Customer email and phone
- ✅ **Special Instructions** - Any customer notes
- ✅ **Delivery Notes** - Delivery-specific information

## 💰 Payment Methods Breakdown

@if(isset($reportSummary['payment_methods']) && count($reportSummary['payment_methods']) > 0)
@foreach($reportSummary['payment_methods'] as $method => $count)
- **{{ ucfirst($method) }}:** {{ $count }} orders
@endforeach
@else
- No payment method data available
@endif

## 🎯 Next Steps

1. **Download** the attached Excel file
2. **Review** order details and customer information
3. **Process** orders for fulfillment
4. **Contact** customers if needed
5. **Update** order statuses as you progress

@component('mail::button', ['url' => config('app.url') . '/admin/dashboard'])
View Admin Dashboard
@endcomponent

---

**🤖 AI Agent Information:**
- This report was automatically generated when 5+ orders reached "processing" status
- The AI agent monitors your orders continuously
- Reports are sent only when the threshold is reached
- All customer data is included for easy processing

@component('mail::subcopy')
This automated report helps you stay on top of orders that need immediate attention. 
The Excel file contains all the information you need to efficiently process customer orders.
@endcomponent

Thanks,<br>
{{ config('app.name') }} AI Agent
@endcomponent
