"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DownloadIcon } from 'lucide-react'
import { Footer } from "@/components/footer"
import { ExperienceCard } from "@/components/experience-card"
import { PersonaData } from '@/types/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { PersonaSelector } from '@/components/persona-selector'
import { ControlBar } from '@/components/control-bar'

export default function ViewPageClient() {
  const [personas, setPersonas] = useState<PersonaData[]>([])
  const [selectedPersona, setSelectedPersona] = useState<PersonaData | null>(null)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [format, setFormat] = useState<'bullet' | 'card'>('bullet')
  const [lastAutoSave, setLastAutoSave] = useState<string>('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const newCardId = searchParams.get('newCardId')

  useEffect(() => {
    const storedPersonas = localStorage.getItem('personas')
    if (storedPersonas) {
      const parsedPersonas = JSON.parse(storedPersonas)
      setPersonas(parsedPersonas)

      const lastSelectedId = localStorage.getItem('lastSelectedPersonaId')
      if (newCardId) {
        const newCard = parsedPersonas.find((p: PersonaData) => p.id === newCardId)
        if (newCard) {
          setSelectedPersona(newCard)
          localStorage.setItem('lastSelectedPersonaId', newCard.id)
        }
      } else if (lastSelectedId) {
        const lastSelected = parsedPersonas.find((p: PersonaData) => p.id === lastSelectedId)
        if (lastSelected) {
          setSelectedPersona(lastSelected)
        }
      } else if (parsedPersonas.length > 0) {
        setSelectedPersona(parsedPersonas[0])
        localStorage.setItem('lastSelectedPersonaId', parsedPersonas[0].id)
      }
    }
  }, [newCardId])

  const handlePersonaSelect = (personaId: string) => {
    const selected = personas.find(p => p.id === personaId)
    if (selected) {
      setSelectedPersona(selected)
      localStorage.setItem('lastSelectedPersonaId', selected.id)
    }
  }

  const handleModeChange = (newMode: 'view' | 'edit') => {
    setMode(newMode)
  }

  const handleExport = () => {
    console.log("Exporting...")
    // Implement export functionality here
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setLastAutoSave(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
      // Perform your autosave logic here
    }, 60000) // Autosave every minute

    return () => clearInterval(interval)
  }, [])

  const renderContent = () => {
    if (personas.length === 0) {
      return (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">No Experience Cards Found</h3>
          <Button onClick={() => router.push('/experience-card-builder')}>
            Create Experience Card
          </Button>
        </div>
      )
    }

    return (
      <ExperienceCard
        initialData={selectedPersona}
        persona={selectedPersona}
        format={format}
        mode={mode}
        onEdit={updateAutoSaveTimestamp}
      />
    )
  }

  const updateAutoSaveTimestamp = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    setLastAutoSave(`${hours}:${minutes}`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/assets/logo.svg" alt="THRIVE Toolkit Logo" width={24} height={24} />
              <span className="font-semibold">THRIVE Toolkit</span>
            </Link>
            <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">Experience Card</h1>
            <div className="w-6 h-6" /> {/* Placeholder for symmetry */}
          </div>
          <div className="flex justify-between items-center">
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'view' | 'edit')}>
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="view">View</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Last autosave at {lastAutoSave}</span>
              <PersonaSelector
                personas={personas}
                selectedPersona={selectedPersona}
                onPersonaSelect={handlePersonaSelect}
              />
              <Button variant="outline" onClick={handleExport}>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-4">
        <ControlBar
          format={format}
          onFormatChange={setFormat}
        />
      </div>
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      <Footer />
    </div>
  )
}
