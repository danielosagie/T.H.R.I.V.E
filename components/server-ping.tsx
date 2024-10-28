'use client';

import { usePingServer } from '@/hooks/usePingServer';

const FOURTEEN_MINUTES_MS = 14 * 60 * 1000; // 840000

export function ServerPing() {
  usePingServer(FOURTEEN_MINUTES_MS);
  return null;
}
