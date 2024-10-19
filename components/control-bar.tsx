'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ControlBarProps {
  format: 'card' | 'bullet'
  onFormatChange: (format: 'card' | 'bullet') => void
}

export function ControlBar({ format, onFormatChange }: ControlBarProps) {
  return (
    <div className="flex justify-between items-center my-4">
      <h2 className="text-xl font-semibold">View Output</h2>
      <Tabs value={format} onValueChange={(value) => onFormatChange(value as 'card' | 'bullet')}>
        <TabsList>
          <TabsTrigger value="card">Card Format</TabsTrigger>
          <TabsTrigger value="bullet">Bullet Format</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}