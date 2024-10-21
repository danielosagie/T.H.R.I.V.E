import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PersonaData } from '@/types/types'

interface PersonaSelectorProps {
  personas: PersonaData[]
  selectedPersona: PersonaData | null
  onPersonaSelect: (personaId: string) => void
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ personas, selectedPersona, onPersonaSelect }) => {
  return (
    <Select onValueChange={onPersonaSelect} value={selectedPersona?.id}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a persona" />
      </SelectTrigger>
      <SelectContent>
        {personas
          .filter((persona): persona is PersonaData & { id: string } => persona.id !== undefined)
          .map((persona) => (
            <SelectItem key={persona.id} value={persona.id}>
              {persona.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}
