<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')->get();
        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
            'current_price' => 'required|numeric|min:0',
            'size' => 'nullable|string',
            'status' => 'sometimes|in:active,blocked',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Keep for backward compatibility
        ]);

        // Set default status if not provided
        if (!isset($validated['status'])) {
            $validated['status'] = 'active';
        }

        // Handle multiple images upload
        if ($request->hasFile('images')) {
            $uploadedImages = $request->file('images');
            $imagesPaths = [];
            
            if (is_array($uploadedImages) && count($uploadedImages) > 0) {
                // Process each uploaded image
                foreach ($uploadedImages as $index => $image) {
                    $imageName = time() . '_' . $index . '_' . $image->getClientOriginalName();
                    $image->move(public_path('images/products'), $imageName);
                    $imagesPaths[] = 'images/products/' . $imageName;
                }
                
                // Set the images array
                $validated['images'] = $imagesPaths;
                
                // Set the first image as the main image for backward compatibility
                $validated['image'] = $imagesPaths[0] ?? null;
            }
        } elseif ($request->hasFile('image')) {
            // Handle single image upload for backward compatibility
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('images/products'), $imageName);
            $validated['image'] = 'images/products/' . $imageName;
            // Also set as single-item images array
            $validated['images'] = ['images/products/' . $imageName];
        }

        $product = Product::create($validated);
        return response()->json($product->load('category'), 201);     
    }

    public function show(Product $product)
    {
        return response()->json($product->load('category'));
    }

    public function update(Request $request, Product $product)
    {
        // Debug logging
        \Log::info('🐛 Product Update Request:', [
            'product_id' => $product->id,
            'request_method' => $request->method(),
            'has_files' => $request->hasFile('images'),
            'files_count' => $request->hasFile('images') ? count($request->file('images')) : 0,
            'request_data' => $request->except(['images']),
        ]);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'price' => 'sometimes|numeric|min:0',
            'description' => 'sometimes|string',
            'current_price' => 'sometimes|numeric|min:0',
            'size' => 'nullable|string',
            'status' => 'sometimes|in:active,blocked',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        \Log::info('✅ Validation passed for product update');

        // Handle multiple images upload
        if ($request->hasFile('images')) {
            $uploadedImages = $request->file('images');
            $imagesPaths = [];
            
            \Log::info('📁 Processing images upload:', [
                'images_count' => is_array($uploadedImages) ? count($uploadedImages) : 1,
                'images_type' => gettype($uploadedImages)
            ]);
            
            if (is_array($uploadedImages) && count($uploadedImages) > 0) {
                // Delete old images if they exist
                if ($product->images && is_array($product->images)) {
                    foreach ($product->images as $oldImage) {
                        $oldImagePath = public_path($oldImage);
                        if (file_exists($oldImagePath)) {
                            unlink($oldImagePath);
                            \Log::info('🗑️ Deleted old image:', ['path' => $oldImage]);
                        }
                    }
                }
                
                // Also delete the old single image field if it exists
                if ($product->image && file_exists(public_path($product->image))) {
                    unlink(public_path($product->image));
                    \Log::info('🗑️ Deleted old single image:', ['path' => $product->image]);
                }
                
                // Process each uploaded image
                foreach ($uploadedImages as $index => $image) {
                    $imageName = time() . '_' . $index . '_' . $image->getClientOriginalName();
                    $destinationPath = public_path('images/products');
                    
                    // Ensure directory exists
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                        \Log::info('📁 Created images directory:', ['path' => $destinationPath]);
                    }
                    
                    $image->move($destinationPath, $imageName);
                    $imagesPaths[] = 'images/products/' . $imageName;
                    
                    \Log::info('📸 Image uploaded successfully:', [
                        'index' => $index,
                        'original_name' => $image->getClientOriginalName(),
                        'saved_name' => $imageName,
                        'path' => 'images/products/' . $imageName
                    ]);
                }
                
                // Set the images array
                $validated['images'] = $imagesPaths;
                
                // Set the first image as the main image for backward compatibility
                $validated['image'] = $imagesPaths[0] ?? null;
                
                \Log::info('✅ All images processed successfully:', [
                    'images_count' => count($imagesPaths),
                    'images_paths' => $imagesPaths,
                    'main_image' => $validated['image']
                ]);
            }
        }

        $product->update($validated);
        
        \Log::info('🎉 Product updated successfully:', [
            'product_id' => $product->id,
            'updated_fields' => array_keys($validated),
            'has_images' => isset($validated['images']),
            'images_count' => isset($validated['images']) ? count($validated['images']) : 0
        ]);
        
        return response()->json($product->load('category'));
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }
}
