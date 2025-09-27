interface RateLimitOptions {
  interval: number
  uniqueTokenPerInterval: number
}

interface RateLimitData {
  count: number
  resetTime: number
}

const cache = new Map<string, RateLimitData>()

export function rateLimit(options: RateLimitOptions) {
  return {
    check: async (limit: number, token: string): Promise<void> => {
      const now = Date.now()
      const key = `${token}`

      const current = cache.get(key)

      if (!current || now > current.resetTime) {
        // Reset or initialize
        cache.set(key, {
          count: 1,
          resetTime: now + options.interval,
        })
        return
      }

      if (current.count >= limit) {
        throw new Error("Rate limit exceeded")
      }

      current.count++
      cache.set(key, current)
    },
  }
}
