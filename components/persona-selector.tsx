import React, { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns'
import { PersonaData } from '@/types/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface PersonaSelectorProps {
  onPersonaSelect: (persona: PersonaData) => void
}

export function PersonaSelector({ onPersonaSelect }: PersonaSelectorProps) {
  const [personas, setPersonas] = useLocalStorage<PersonaData[]>('generatedPersonas', [])
  const [selectedPersonaId, setSelectedPersonaId] = useLocalStorage<string | null>('selectedPersonaId', null)

  useEffect(() => {
    if (personas.length > 0 && !selectedPersonaId) {
      setSelectedPersonaId(personas[0].id)
      onPersonaSelect(personas[0])
    }
  }, [personas, selectedPersonaId, onPersonaSelect, setSelectedPersonaId])

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersonaId(personaId)
    const selectedPersona = personas.find(p => p.id === personaId)
    if (selectedPersona) {
      onPersonaSelect(selectedPersona)
    }
  }

  if (personas.length === 0) {
    return null
  }

  return (
    <Select value={selectedPersonaId || undefined} onValueChange={handlePersonaSelect}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a persona" />
      </SelectTrigger>
      <SelectContent>
        {personas.map((persona) => (
          <SelectItem key={persona.id} value={persona.id}>
            {persona.name} - {format(new Date(persona.timestamp), 'MMM d, HH:mm')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
