"use client"

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const ExperienceCardBuilderComponent = dynamic(
  () => import('@/components/pages-experience-card-builder').then((mod) => mod.ExperienceCardBuilderComponent),
  { ssr: false }
)

export default function InputPage() {
  const router = useRouter()

  const handleCardCreated = (newCardId: string) => {
    router.push(`/view?newCardId=${newCardId}`)
  }

  return <ExperienceCardBuilderComponent onCardCreated={handleCardCreated} />
}
