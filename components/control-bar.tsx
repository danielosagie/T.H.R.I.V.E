'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ControlBarProps {
  format: 'card' | 'bullet'
  onFormatChange: (format: 'card' | 'bullet') => void
}

export function ControlBar({ format, onFormatChange }: ControlBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-4">
      <h2 className="text-xl font-semibold mb-2 sm:mb-0">View Output</h2>
      <Tabs value={format} onValueChange={onFormatChange}>
        <TabsList className="flex-col sm:flex-row h-auto sm:h-10">
          <TabsTrigger 
            value="card" 
            className="w-full sm:w-auto"
          >
            Card Format
          </TabsTrigger>
          <TabsTrigger 
            value="bullet" 
            className="w-full sm:w-auto"
          >
            Bullet Format
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
