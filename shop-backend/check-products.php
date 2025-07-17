<?php
echo "🔍 Checking Products in Database\n";
echo "================================\n";

try {    
    require_once __DIR__ . '/vendor/autoload.php';                                               
    $app = require_once __DIR__ . '/bootstrap/app.php';                          
                                       
    // Boot the application                           
    $app->boot();                                          
    
    echo "✅ Laravel app booted successfully\n";
                                      
    $products = \App\Models\Product::all(['id', 'name', 'images']);              
    echo "Total Products: " . $products->count() . "\n\n";
    
    if ($products->count() > 0) {
        foreach($products as $product) {
            echo "ID: {$product->id}\n";
            echo "Name: {$product->name}\n";
            echo "Images: " . ($product->images ? json_encode($product->images) : 'null') . "\n";
            echo "---\n";
        }
    } else {
        echo "❌ No products found in database\n";
        echo "Creating a test product...\n";
        
        $product = \App\Models\Product::create([
            'name' => 'Test Product for Image Upload',
            'category_id' => 1,
            'price' => 29.99,
            'current_price' => 24.99,
            'description' => 'Test product for debugging image upload',
            'size' => 'M',
            'status' => 'active'
        ]);
        
        echo "✅ Test product created with ID: {$product->id}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>
