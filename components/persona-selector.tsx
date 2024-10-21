import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PersonaData } from '@/types/types'

interface PersonaSelectorProps {
  personas: PersonaData[]
  selectedPersona: PersonaData | null
  onPersonaSelect: (personaId: string) => void
}

export function PersonaSelector({ personas, selectedPersona, onPersonaSelect }: PersonaSelectorProps) {
  if (personas.length === 0) {
    return null;
  }

  return (
    <Select onValueChange={onPersonaSelect} value={selectedPersona?.id || ''}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a persona" />
      </SelectTrigger>
      <SelectContent>
        {personas.map((persona) => (
          <SelectItem key={persona.id} value={persona.id}>
            {persona.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
