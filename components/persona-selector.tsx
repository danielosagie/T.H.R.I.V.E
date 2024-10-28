import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PersonaData } from '@/types/types'

interface PersonaSelectorProps {
  personas: PersonaData[]
  selectedPersona: PersonaData | null
  onPersonaSelect: (personaId: string) => void
}

export function PersonaSelector({ personas, selectedPersona, onPersonaSelect }: PersonaSelectorProps) {
  return (
    <Select
      value={selectedPersona?.id}
      onValueChange={onPersonaSelect}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select persona">
          {selectedPersona?.name || "Select persona"}
        </SelectValue>
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
