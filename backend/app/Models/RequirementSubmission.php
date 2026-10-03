<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequirementSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'requirement_id',
        'submitted_by',
        'submission_text',
        'file_path',
        'status',
        'submitted_at',
        'verified_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function requirement(): BelongsTo
    {
        return $this->belongsTo(
            Requirement::class
        );
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'submitted_by'
        );
    }
}