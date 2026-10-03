<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('requirement_submissions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('requirement_id')
                ->constrained('requirements')
                ->onDelete('cascade');

            $table->foreignId('submitted_by')
                ->constrained('users')
                ->onDelete('cascade');

            $table->text('submission_text')->nullable();

            $table->string('file_path')->nullable();

            $table->enum('status', [
                'Submitted',
                'Verified',
                'Rejected'
            ])->default('Submitted');

            $table->timestamp('submitted_at')->nullable();

            $table->timestamp('verified_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requirement_submissions');
    }
};