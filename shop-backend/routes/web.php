<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'Shop API is running']);
});

Route::get('/login', function () {
    return response()->json(['message' => 'Please use /api/admin/login or /api/client/login']);
})->name('login');
