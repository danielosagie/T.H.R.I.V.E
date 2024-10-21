'use client'

import React, { useState } from 'react'
import { Section } from './section'
import { TagInput } from 'emblor'
import { PersonaData } from '@/types/types'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ExperienceCardProps {
  initialData: PersonaData | null
  persona: PersonaData | null
  format: 'card' | 'bullet'
  mode: 'view' | 'edit'
  onEdit: () => void
}

export function ExperienceCard({ initialData, persona, format, mode, onEdit }: ExperienceCardProps) {
  const [data, setData] = useState<PersonaData>(persona || initialData || {
    name: '',
    summary: '',
    goals: [],
    nextSteps: [],
    lifeExperiences: [],
    qualificationsAndEducation: [],
    skills: [],
    strengths: [],
    valueProposition: []
  } as PersonaData)

  if (!data) {
    return (
      <div className="text-center text-white">
        <h3 className="text-xl font-semibold mb-4">No Card Selected</h3>
        <p>Please select a card from the dropdown above to view its content.</p>
      </div>
    )
  }

  const parseTags = (content: string | string[]): string[] => {
    if (typeof content === 'string') {
      return content.split(', ').filter(Boolean)
    }
    return content.flatMap(item => item.split(', ')).filter(Boolean)
  }

  const handleDataChange = (newData: Partial<PersonaData>) => {
    setData(prevData => ({ ...prevData, ...newData }))
    onEdit()
  }

  const renderContent = (title: string, content: string | string[], isNameSummary = false) => {
    if (mode === 'view') {
      return (
        <Section title={isNameSummary ? '' : title}>
          {isNameSummary ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">{data.name}</h2>
              <p className="text-white">{data.summary}</p>
            </>
          ) : format === 'bullet' ? (
            <ul className="list-disc list-inside text-white">
              {parseTags(content).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            parseTags(content).map((item, index) => (
              <span key={index} className="inline-block bg-white text-black rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
                {item}
              </span>
            ))
          )}
        </Section>
      )
    } else if (mode === 'edit') {
      if (isNameSummary) {
        return (
          <Section title="">
            <Input
              value={data.name}
              onChange={(e) => handleDataChange({ name: e.target.value })}
              className="mb-2 bg-white text-black"
              placeholder="Name"
            />
            <Textarea
              value={data.summary}
              onChange={(e) => handleDataChange({ summary: e.target.value })}
              className="w-full bg-white text-black p-2 rounded"
              placeholder="Summary"
            />
          </Section>
        )
      }
      return (
        <Section title={title}>
          <TagInput
            tags={parseTags(content).map((text, id) => ({ id: id.toString(), text }))}
            setTags={(newTags) => {
              handleDataChange({ [title.toLowerCase().replace(/\s+/g, '')]: newTags.map(tag => tag.text) })
            }}
            placeholder="Add a tag"
            styleClasses={{
              input: 'w-full bg-white text-black p-2 rounded',
              tag: 'bg-white text-black border border-gray-300',
              tagText: 'text-black',
              tagDeleteButton: 'text-black',
            }}
          />
        </Section>
      )
    }
  }

  return (
    <div className="bg-[#272B32] p-6 rounded-lg shadow">
      <div className={`grid ${format === 'card' ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
        <div className={format === 'card' ? 'col-span-2' : ''}>
          {renderContent("Name and Summary", '', true)}
        </div>
        {renderContent("Goals", data.goals)}
        {renderContent("Next Steps", data.nextSteps)}
        {renderContent("Life Experiences", data.lifeExperiences)}
        {renderContent("Qualifications and Education", data.qualificationsAndEducation)}
        {renderContent("Skills", data.skills)}
        {renderContent("Strengths", data.strengths)}
        {renderContent("Value Proposition", data.valueProposition)}
      </div>
    </div>
  )
}
