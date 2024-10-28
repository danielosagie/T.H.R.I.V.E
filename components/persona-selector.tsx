import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PersonaData } from '@/types/types'

interface PersonaSelectorProps {
  personas: PersonaData[]
  selectedPersona: PersonaData | null
  onPersonaSelect: (personaId: string) => void
  className?: string
}

export function PersonaSelector({ personas, selectedPersona, onPersonaSelect, className }: PersonaSelectorProps) {
  return (
    <Select
      value={selectedPersona?.id}
      onValueChange={onPersonaSelect}
    >
      <SelectTrigger className={className}>
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
