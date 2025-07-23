<?php
// Simple PHP script to display products from database
// File: display-products.php

// Database configuration - update these with your actual database settings
$host = 'localhost';
$dbname = 'ayoube_db'; // Based on your project structure
$username = 'root';
$password = '';

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Fetch all products from database
    $stmt = $pdo->prepare("SELECT * FROM products ORDER BY id ASC");
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count
    $totalProducts = count($products);
    
} catch (PDOException $e) {
    $error = "Database connection failed: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products Database Display</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .stats {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }
        
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            padding: 30px;
        }
        
        .product-card {
            background: white;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: all 0.3s ease;
            border: 1px solid #e9ecef;
        }
        
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .product-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(45deg, #f8f9fa, #e9ecef);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3em;
            color: #667eea;
            position: relative;
            overflow: hidden;
        }
        
        .product-image::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .product-info {
            padding: 20px;
        }
        
        .product-id {
            background: #667eea;
            color: white;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 10px;
        }
        
        .product-name {
            font-size: 1.3em;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
            line-height: 1.4;
        }
        
        .product-price {
            font-size: 1.8em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .product-description {
            color: #666;
            font-size: 0.9em;
            line-height: 1.5;
            margin-bottom: 15px;
        }
        
        .product-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 15px;
            border-top: 1px solid #e9ecef;
        }
        
        .product-category {
            background: #f8f9fa;
            color: #666;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8em;
        }
        
        .product-date {
            font-size: 0.8em;
            color: #999;
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 20px;
            margin: 20px;
            border-radius: 10px;
            border: 1px solid #f5c6cb;
        }
        
        .no-products {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        
        .no-products h2 {
            font-size: 2em;
            margin-bottom: 10px;
        }
        
        .db-info {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            margin: 20px;
            border-radius: 10px;
            border: 1px solid #c3e6cb;
        }
        
        .table-view {
            margin: 20px;
            overflow-x: auto;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        th {
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #e9ecef;
        }
        
        tr:hover {
            background: #f8f9fa;
        }
        
        .view-toggle {
            text-align: center;
            padding: 20px;
        }
        
        .toggle-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.3s ease;
        }
        
        .toggle-btn:hover {
            background: #5a67d8;
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            .products-grid {
                grid-template-columns: 1fr;
                padding: 20px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .stat-number {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛍️ Products Database</h1>
            <p>Complete product catalog from your database</p>
        </div>
        
        <?php if (isset($error)): ?>
            <div class="error">
                <strong>Error:</strong> <?php echo htmlspecialchars($error); ?>
                <br><br>
                <strong>Common solutions:</strong>
                <ul>
                    <li>Make sure XAMPP MySQL is running</li>
                    <li>Check database name (currently set to 'ayoube_db')</li>
                    <li>Verify database credentials</li>
                    <li>Ensure the products table exists</li>
                </ul>
            </div>
        <?php else: ?>
            <div class="db-info">
                <strong>✅ Database Connection Successful!</strong>
                <br>Connected to: <?php echo htmlspecialchars($dbname); ?>
                <br>Host: <?php echo htmlspecialchars($host); ?>
            </div>
            
            <div class="stats">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number"><?php echo $totalProducts; ?></div>
                        <div class="stat-label">Total Products</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number"><?php echo count(array_unique(array_column($products, 'category_id'))); ?></div>
                        <div class="stat-label">Categories</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number"><?php echo number_format(array_sum(array_column($products, 'price')), 2); ?></div>
                        <div class="stat-label">Total Value ($)</div>
                    </div>
                </div>
            </div>
            
            <div class="view-toggle">
                <button class="toggle-btn" onclick="toggleView()">Switch to Table View</button>
            </div>
            
            <?php if (empty($products)): ?>
                <div class="no-products">
                    <h2>📦 No Products Found</h2>
                    <p>Your products table is empty. Add some products to see them here!</p>
                </div>
            <?php else: ?>
                <!-- Grid View -->
                <div id="gridView" class="products-grid">
                    <?php foreach ($products as $product): ?>
                        <div class="product-card">
                            <div class="product-image">
                                <?php if (!empty($product['image'])): ?>
                                    <img src="<?php echo htmlspecialchars($product['image']); ?>" 
                                         alt="<?php echo htmlspecialchars($product['name']); ?>"
                                         style="width: 100%; height: 100%; object-fit: cover;">
                                <?php else: ?>
                                    🛍️
                                <?php endif; ?>
                            </div>
                            
                            <div class="product-info">
                                <div class="product-id">#<?php echo $product['id']; ?></div>
                                <div class="product-name"><?php echo htmlspecialchars($product['name']); ?></div>
                                <div class="product-price">$<?php echo number_format($product['price'], 2); ?></div>
                                <div class="product-description">
                                    <?php echo htmlspecialchars(substr($product['description'] ?? 'No description available', 0, 100)); ?>
                                    <?php if (strlen($product['description'] ?? '') > 100): ?>...<?php endif; ?>
                                </div>
                                
                                <div class="product-meta">
                                    <div class="product-category">
                                        Category: <?php echo $product['category_id'] ?? 'N/A'; ?>
                                    </div>
                                    <div class="product-date">
                                        <?php echo date('M j, Y', strtotime($product['created_at'] ?? 'now')); ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <!-- Table View -->
                <div id="tableView" class="table-view" style="display: none;">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($products as $product): ?>
                                <tr>
                                    <td><strong>#<?php echo $product['id']; ?></strong></td>
                                    <td><?php echo htmlspecialchars($product['name']); ?></td>
                                    <td><strong>$<?php echo number_format($product['price'], 2); ?></strong></td>
                                    <td><?php echo $product['category_id'] ?? 'N/A'; ?></td>
                                    <td>
                                        <?php echo htmlspecialchars(substr($product['description'] ?? 'No description', 0, 60)); ?>
                                        <?php if (strlen($product['description'] ?? '') > 60): ?>...<?php endif; ?>
                                    </td>
                                    <td><?php echo date('M j, Y', strtotime($product['created_at'] ?? 'now')); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>

    <script>
        function toggleView() {
            const gridView = document.getElementById('gridView');
            const tableView = document.getElementById('tableView');
            const toggleBtn = document.querySelector('.toggle-btn');
            
            if (gridView.style.display === 'none') {
                gridView.style.display = 'grid';
                tableView.style.display = 'none';
                toggleBtn.textContent = 'Switch to Table View';
            } else {
                gridView.style.display = 'none';
                tableView.style.display = 'block';
                toggleBtn.textContent = 'Switch to Grid View';
            }
        }
        
        // Add some interactive effects
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.product-card');
            
            cards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-10px) scale(1.02)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
        });
    </script>
</body>
</html>
