'use client';

import { usePingServer } from '@/lib/hooks/use-ping-server';

const FOURTEEN_MINUTES_MS = 14 * 60 * 1000; // 840000

export function ServerPing() {
  usePingServer();
  return null;
}
