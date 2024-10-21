'use client'

import React from 'react'
import { Tag } from './tag'
import { Textarea } from "@/components/ui/textarea"

interface SectionProps {
  title: string
  children: React.ReactNode
}

export function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-4 bg-[#1E1A1A] p-4 rounded">
      {title && <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>}
      {children}
    </div>
  )
}
