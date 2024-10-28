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
    const selected = personas.find(p => p.id === personaId);
    if (selected) {
      setSelectedPersona(selected);
      localStorage.setItem('lastSelectedPersonaId', selected.id);
      
      // Also update personas in localStorage if needed
      const updatedPersonas = personas.map(p => 
        p.id === selected.id ? selected : p
      );
      localStorage.setItem('personas', JSON.stringify(updatedPersonas));
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
    <div className="flex flex-col w-full min-h-screen">
      <header className="border-b w-full border-gray-300">
        <div className="container mx-auto px-4 py-4">
          {/* Top row - Logo and Title */}
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/assets/logo.svg" alt="THRIVE Toolkit Logo" width={24} height={24} />
              <span className="font-semibold text-sm sm:text-base">THRIVE Toolkit</span>
            </Link>
            <h1 className="text-lg sm:text-2xl font-bold">Experience Card</h1>
            <div className="w-6 h-6 hidden sm:block"></div>
          </div>

          {/* Controls row - with full width separation */}
          <div className="w-full flex flex-col sm:flex-row sm:justify-between items-center space-y-4 sm:space-y-0">
            {/* Left group */}
            <div className="w-full sm:w-auto flex justify-between sm:justify-start items-center ">
              <Tabs value={mode} onValueChange={(value) => setMode(value as 'view' | 'edit')}>
                <TabsList className="h-10">
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="view">View</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="block sm:hidden">
                <PersonaSelector
                  personas={personas}
                  selectedPersona={selectedPersona}
                  onPersonaSelect={handlePersonaSelect}
                  className="w-[180px]"
                />
              </div>
            </div>

            {/* Right group */}
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <span className="hidden sm:inline text-sm text-gray-500">
                Last autosave at {lastAutoSave}
              </span>
              <div className="hidden sm:block">
                <PersonaSelector
                  personas={personas}
                  selectedPersona={selectedPersona}
                  onPersonaSelect={handlePersonaSelect}
                  className="w-[180px]"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleExport} 
                className="w-full sm:w-auto"
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Control bar with horizontal tabs */}
      <div className="w-full ">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center my-4">
            <h2 className="text-xl font-semibold">View Output</h2>
            <Tabs 
              value={format} 
              onValueChange={(value) => setFormat(value as 'bullet' | 'card')}
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
        </div>
      </div>

      <main className="flex-grow w-full">
        <div className="container mx-auto px-4 py-8">
          {renderContent()}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
