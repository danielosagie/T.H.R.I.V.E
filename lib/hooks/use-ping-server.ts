"use client"

import { useEffect } from "react"

const DEFAULT_INTERVAL = 14 * 60 * 1000 // 14 minutes in milliseconds

export function usePingServer(interval: number = DEFAULT_INTERVAL) {
  useEffect(() => {
    const pingServer = async () => {
      try {
        await fetch('/api/ping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        console.error('Failed to ping server:', error)
      }
    }

    // Initial ping
    pingServer()

    // Set up interval
    const intervalId = setInterval(pingServer, interval)

    // Cleanup
    return () => clearInterval(intervalId)
  }, [interval])
} 