<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdminNotificationsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admin_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // order_created, order_updated, etc.
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Store order details, links, etc.
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->unsignedBigInteger('related_id')->nullable(); // order_id, user_id, etc.
            $table->string('related_type')->nullable(); // Order, User, etc.
            $table->string('action_url')->nullable(); // Link to view/confirm order
            $table->string('priority')->default('normal'); // low, normal, high, urgent
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['is_read', 'created_at']);
            $table->index(['type', 'created_at']);
            $table->index(['related_id', 'related_type']);
        });
    }    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_notifications');
    }
}
