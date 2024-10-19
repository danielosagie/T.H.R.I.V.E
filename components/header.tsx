'use client'

import React from 'react'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DownloadIcon } from 'lucide-react'
import Image from 'next/image'

interface HeaderProps {
  mode: 'edit' | 'view'
  onModeChange: (mode: 'edit' | 'view') => void
  lastAutoSave: string
  onExport: () => void
}

export function Header({ mode, onModeChange, lastAutoSave, onExport }: HeaderProps) {
  return (
    <div className="space-y-4 pb-4 border-b border-gray-300">
      <div className="flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="THRIVE Toolkit Logo" width={24} height={24} />
          <span className="font-semibold">THRIVE Toolkit</span>
        </Link>
        <h1 className="text-2xl font-bold">Experience Card</h1>
        <div className="w-6 h-6" /> {/* Placeholder for symmetry */}
      </div>
      <div className="flex justify-between items-center">
        <Tabs value={mode} onValueChange={(value) => onModeChange(value as 'edit' | 'view')}>
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="view">View</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Last autosave at {lastAutoSave}</span>
          <Select defaultValue="alice_vuong_v3">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alice_vuong_v3">alice_vuong_v3</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onExport}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}