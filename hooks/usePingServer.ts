'use client';

import { useEffect, useCallback } from 'react';

export const usePingServer = () => {
  const FIVE_MINUTES = 5 * 60 * 1000 // 5 minutes in milliseconds
  
  const pingServer = useCallback(async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ping`
      console.log('Pinging server at:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Server ping failed with status:', response.status)
        return false
      }

      const data = await response.json()
      console.log('Server ping successful:', data)
      return true
    } catch (error) {
      console.error('Server ping failed:', error)
      return false
    }
  }, [])

  useEffect(() => {
    // Initial ping
    pingServer()

    // Set up interval for subsequent pings every 5 minutes
    const interval = setInterval(pingServer, FIVE_MINUTES)

    // Cleanup on unmount
    return () => {
      clearInterval(interval)
    }
  }, [pingServer])

  return { pingServer }
}
