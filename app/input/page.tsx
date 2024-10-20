"use client"

import dynamic from 'next/dynamic'

const ExperienceCardBuilderComponent = dynamic(
  () => import('@/components/pages-experience-card-builder').then((mod) => mod.ExperienceCardBuilderComponent),
  { ssr: false }
)

export default function InputPage() {
  return <ExperienceCardBuilderComponent />
}
