<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Report extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'type',
        'category',
        'filters',
        'data',
        'description',
        'status',
        'format',
        'file_path',
        'file_size',
        'generated_at',
        'expires_at',
        'user_id',
        'template_id',
    ];

    protected $casts = [
        'filters' => 'array',
        'data' => 'array',
        'generated_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $dates = [
        'generated_at',
        'expires_at',
        'deleted_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ReportTemplate::class);
    }

    // Scopes
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
                ->orWhere('expires_at', '>', now());
        });
    }

    // Accessors
    public function getFileSizeFormattedAttribute(): string
    {
        if (!$this->file_size) {
            return '0 B';
        }

        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function getIsDownloadableAttribute(): bool
    {
        return $this->status === 'completed'
            && $this->file_path
            && !$this->is_expired
            && file_exists(storage_path('app/' . $this->file_path));
    }

    // Methods
    public function markAsCompleted(string $filePath, int $fileSize): void
    {
        $this->update([
            'status' => 'completed',
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'generated_at' => now(),
            'expires_at' => now()->addDays(30), // Expira em 30 dias
        ]);
    }

    public function markAsFailed(): void
    {
        $this->update([
            'status' => 'failed',
            'generated_at' => now(),
        ]);
    }

    public function deleteFile(): void
    {
        if ($this->file_path && file_exists(storage_path('app/' . $this->file_path))) {
            unlink(storage_path('app/' . $this->file_path));
        }
    }
}
