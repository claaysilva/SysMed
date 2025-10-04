<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

trait OptimizedQueries
{
  /**
   * Scope para adicionar índices de busca otimizada
   */
  public function scopeSearch(Builder $query, string $term): Builder
  {
    if (empty($term)) {
      return $query;
    }

    // Use MATCH AGAINST para busca full-text quando disponível
    // Caso contrário, use LIKE
    $columns = $this->getSearchableColumns();

    if (empty($columns)) {
      return $query;
    }

    return $query->where(function (Builder $subQuery) use ($term, $columns) {
      foreach ($columns as $column) {
        $subQuery->orWhere($column, 'LIKE', "%{$term}%");
      }
    });
  }

  /**
   * Scope para paginação otimizada
   */
  public function scopeOptimizedPaginate(Builder $query, int $perPage = 15, array $columns = ['*'])
  {
    // Usar cursor pagination para grandes datasets
    if ($this->shouldUseCursorPagination()) {
      return $query->cursorPaginate($perPage, $columns);
    }

    return $query->paginate($perPage, $columns);
  }

  /**
   * Scope para eager loading otimizado
   */
  public function scopeWithOptimized(Builder $query, array $relations): Builder
  {
    $optimizedRelations = [];

    foreach ($relations as $relation) {
      if (is_string($relation)) {
        // Adicionar select específico para relações
        $optimizedRelations[$relation] = function ($q) {
          $q->select($this->getRelationColumns($relation));
        };
      } else {
        $optimizedRelations = array_merge($optimizedRelations, $relation);
      }
    }

    return $query->with($optimizedRelations);
  }

  /**
   * Scope para ordenação otimizada
   */
  public function scopeOptimizedOrder(Builder $query, string $column, string $direction = 'asc'): Builder
  {
    // Verificar se a coluna tem índice
    if ($this->hasIndex($column)) {
      return $query->orderBy($column, $direction);
    }

    // Log warning se ordenação por coluna não indexada
    \Log::warning("Ordering by non-indexed column: {$column} on " . get_class($this));

    return $query->orderBy($column, $direction);
  }

  /**
   * Busca com cache inteligente
   */
  public static function cachedFind($id, $minutes = 60)
  {
    $cacheKey = static::class . "_find_{$id}";

    return cache()->remember($cacheKey, now()->addMinutes($minutes), function () use ($id) {
      return static::find($id);
    });
  }

  /**
   * Busca em lote para evitar N+1
   */
  public static function batchFind(array $ids, array $with = [])
  {
    return static::whereIn('id', $ids)
      ->when(!empty($with), function ($query) use ($with) {
        return $query->with($with);
      })
      ->get()
      ->keyBy('id');
  }

  /**
   * Aggregation otimizada
   */
  public function scopeOptimizedCount(Builder $query, string $column = '*'): int
  {
    // Use approximate count para tabelas grandes
    if ($this->isLargeTable()) {
      return $this->getApproximateCount();
    }

    return $query->count($column);
  }

  /**
   * Chunk processing para grandes datasets
   */
  public static function processInChunks(callable $callback, int $chunkSize = 1000): void
  {
    static::chunk($chunkSize, $callback);
  }

  /**
   * Métodos auxiliares
   */
  protected function getSearchableColumns(): array
  {
    return $this->searchable ?? [];
  }

  protected function shouldUseCursorPagination(): bool
  {
    // Use cursor pagination para tabelas com mais de 10k registros
    return $this->getApproximateCount() > 10000;
  }

  protected function getRelationColumns(string $relation): array
  {
    $method = "get{$relation}Columns";

    if (method_exists($this, $method)) {
      return $this->$method();
    }

    // Colunas padrão para otimização
    return ['id', 'name', 'title', 'created_at'];
  }

  protected function hasIndex(string $column): bool
  {
    // Verificar se a coluna tem índice (implementação simplificada)
    $indexes = $this->indexes ?? [];
    return in_array($column, $indexes);
  }

  protected function isLargeTable(): bool
  {
    return $this->getApproximateCount() > 100000;
  }

  protected function getApproximateCount(): int
  {
    $table = $this->getTable();

    return (int) DB::selectOne("
            SELECT table_rows as count 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = ?
        ", [$table])->count ?? 0;
  }

  /**
   * Cache invalidation helpers
   */
  public function invalidateCache(): void
  {
    $cacheKey = static::class . "_find_{$this->id}";
    cache()->forget($cacheKey);
  }

  protected static function bootOptimizedQueries(): void
  {
    static::saved(function ($model) {
      $model->invalidateCache();
    });

    static::deleted(function ($model) {
      $model->invalidateCache();
    });
  }
}
