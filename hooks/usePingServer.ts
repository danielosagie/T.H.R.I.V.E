'use client';

import { useEffect } from 'react';

export function usePingServer(interval: number = 840000) {
  useEffect(() => {
    const pingServer = async () => {
      try {
        const response = await fetch('/api/ping');
        if (!response.ok) {
          console.warn('Server ping failed:', response.status);
        }
      } catch (error) {
        console.error('Error pinging server:', error);
      }
    };

    pingServer();
    const intervalId = setInterval(pingServer, interval);
    return () => clearInterval(intervalId);
  }, [interval]);
}
