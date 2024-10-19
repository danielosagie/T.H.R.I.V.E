import type { Metadata } from 'next';
import ExportPageClient from './ExportPageClient';

export const metadata: Metadata = {
  title: 'Export Page',
  description: 'Export your data',
}

export default function ExportPage() {
  return <ExportPageClient />
}
