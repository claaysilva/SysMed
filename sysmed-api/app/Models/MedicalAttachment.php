<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class MedicalAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'medical_record_id',
        'uploaded_by',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'file_extension',
        'category',
        'title',
        'description',
        'document_date',
        'visibility',
        'allowed_users',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes'
    ];

    protected $casts = [
        'document_date' => 'date',
        'allowed_users' => 'array',
        'reviewed_at' => 'datetime'
    ];

    protected $appends = [
        'category_label',
        'visibility_label',
        'status_label',
        'file_size_human',
        'download_url',
        'is_image',
        'is_pdf'
    ];

    // Relacionamentos
    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Accessors
    protected function categoryLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->category) {
                'exam_result' => 'Resultado de Exame',
                'image' => 'Imagem Médica',
                'report' => 'Relatório',
                'prescription' => 'Receita',
                'referral' => 'Encaminhamento',
                'consent' => 'Termo de Consentimento',
                'other' => 'Outros',
                default => 'Não especificado'
            }
        );
    }

    protected function visibilityLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->visibility) {
                'public' => 'Público',
                'private' => 'Privado',
                'restricted' => 'Restrito',
                default => 'Não especificado'
            }
        );
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->status) {
                'pending' => 'Pendente',
                'approved' => 'Aprovado',
                'rejected' => 'Rejeitado',
                default => 'Não especificado'
            }
        );
    }

    protected function fileSizeHuman(): Attribute
    {
        return Attribute::make(
            get: function () {
                $bytes = $this->file_size;
                $units = ['B', 'KB', 'MB', 'GB'];

                for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
                    $bytes /= 1024;
                }

                return round($bytes, 2) . ' ' . $units[$i];
            }
        );
    }

    protected function downloadUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->file_path ? Storage::url($this->file_path) : null
        );
    }

    protected function isImage(): Attribute
    {
        return Attribute::make(
            get: fn() => str_starts_with($this->file_type, 'image/')
        );
    }

    protected function isPdf(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->file_type === 'application/pdf'
        );
    }

    // Scopes
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByVisibility($query, $visibility)
    {
        return $query->where('visibility', $visibility);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeImages($query)
    {
        return $query->where('file_type', 'like', 'image/%');
    }

    public function scopePdfs($query)
    {
        return $query->where('file_type', 'application/pdf');
    }

    public function scopeAccessibleBy($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('visibility', 'public')
                ->orWhere('uploaded_by', $userId)
                ->orWhere(function ($q2) use ($userId) {
                    $q2->where('visibility', 'restricted')
                        ->whereJsonContains('allowed_users', $userId);
                });
        });
    }

    // Métodos auxiliares
    public function approve($reviewerId = null, $notes = null): bool
    {
        return $this->update([
            'status' => 'approved',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'review_notes' => $notes
        ]);
    }

    public function reject($reviewerId = null, $notes = null): bool
    {
        return $this->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'review_notes' => $notes
        ]);
    }

    public function canBeAccessedBy($userId): bool
    {
        if ($this->visibility === 'public') {
            return true;
        }

        if ($this->uploaded_by === $userId) {
            return true;
        }

        if (
            $this->visibility === 'restricted' &&
            in_array($userId, $this->allowed_users ?? [])
        ) {
            return true;
        }

        return false;
    }

    public function delete()
    {
        // Remove arquivo físico ao deletar registro
        if ($this->file_path && Storage::exists($this->file_path)) {
            Storage::delete($this->file_path);
        }

        return parent::delete();
    }

    public function getFileIcon(): string
    {
        if ($this->is_image) return '🖼️';
        if ($this->is_pdf) return '📄';

        return match ($this->file_extension) {
            'doc', 'docx' => '📝',
            'xls', 'xlsx' => '📊',
            'ppt', 'pptx' => '📊',
            'txt' => '📄',
            'zip', 'rar' => '📦',
            default => '📎'
        };
    }
}
