'use client'

import React from 'react'

interface TagProps {
  children: React.ReactNode
}

export function Tag({ children }: TagProps) {
  return (
    <span className="inline-block bg-neutral-700 text-neutral-200 rounded-sm px-3 py-1 text-sm font-semibold mr-2 mb-2">
      {children}
    </span>
  )
}