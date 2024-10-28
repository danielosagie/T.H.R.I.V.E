'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ControlBarProps {
  format: 'bullet' | 'card'
  onFormatChange: (value: string) => void
}

export function ControlBar({ format, onFormatChange }: ControlBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-4">
      <h2 className="text-xl font-semibold mb-2 sm:mb-0">View Output</h2>
      <Tabs 
        value={format} 
        onValueChange={onFormatChange}
      >
        <TabsList className="h-10">
          <TabsTrigger value="card">
            <span className="hidden sm:inline">Card Format</span>
            <span className="sm:hidden">Card</span>
          </TabsTrigger>
          <TabsTrigger value="bullet">
            <span className="hidden sm:inline">Bullet Format</span>
            <span className="sm:hidden">Bullet</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
