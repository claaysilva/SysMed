<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CacheMiddleware
{
  /**
   * Handle an incoming request.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  \Closure  $next
   * @param  int  $minutes Cache duration in minutes (default: 60)
   * @return mixed
   */
  public function handle(Request $request, Closure $next, int $minutes = 60)
  {
    // Only cache GET requests
    if (!$request->isMethod('GET')) {
      return $next($request);
    }

    // Generate cache key based on route and query parameters
    $cacheKey = $this->generateCacheKey($request);

    // Try to get cached response
    $cachedResponse = Cache::get($cacheKey);

    if ($cachedResponse) {
      Log::info("Cache hit for key: {$cacheKey}");

      return response($cachedResponse['content'])
        ->withHeaders($cachedResponse['headers'])
        ->header('X-Cache-Status', 'HIT');
    }

    // Get response from next middleware/controller
    $response = $next($request);

    // Only cache successful responses
    if ($response->getStatusCode() === 200) {
      $cacheData = [
        'content' => $response->getContent(),
        'headers' => $response->headers->all(),
      ];

      Cache::put($cacheKey, $cacheData, now()->addMinutes($minutes));

      Log::info("Cache stored for key: {$cacheKey} (TTL: {$minutes} minutes)");

      $response->header('X-Cache-Status', 'MISS');
    }

    return $response;
  }

  /**
   * Generate a unique cache key for the request
   */
  private function generateCacheKey(Request $request): string
  {
    $url = $request->url();
    $queryParams = $request->query();

    // Sort query parameters to ensure consistent cache keys
    ksort($queryParams);

    // Include user ID in cache key for user-specific data
    $userId = $request->user() ? $request->user()->id : 'guest';

    $keyData = [
      'url' => $url,
      'params' => $queryParams,
      'user' => $userId,
    ];

    return 'api_cache:' . md5(serialize($keyData));
  }
}
