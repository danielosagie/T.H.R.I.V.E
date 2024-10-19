import ViewPageClient from './ViewPageClient'

export default function ViewPage() {
  return <ViewPageClient />
}

export async function generateStaticParams() {
  return []
}
