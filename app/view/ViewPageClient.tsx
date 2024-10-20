"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { ExperienceCard } from "@/components/experience-card"
import axios from 'axios'
import { format as formatDate } from 'date-fns'
import { PersonaSelector } from "@/components/persona-selector"
import { PersonaData } from '@/types/types'

const transformPersonaData = (parsedPersona: any): PersonaData => {
  if (typeof parsedPersona === 'object' && !Array.isArray(parsedPersona)) {
    // Handle the API response format
    return {
      id: parsedPersona.persona_id || String(Date.now()),
      name: parsedPersona.name || `${parsedPersona.firstName} ${parsedPersona.lastName}`,
      summary: parsedPersona.summary || '',
      qualificationsAndEducation: transformSection(parsedPersona.qualificationsandeducation),
      skills: transformSection(parsedPersona.skills),
      goals: transformSection(parsedPersona.goals),
      strengths: transformSection(parsedPersona.strengths),
      lifeExperiences: transformSection(parsedPersona.lifeexperiences),
      valueProposition: transformSection(parsedPersona.valueproposition),
      nextSteps: transformSection(parsedPersona.nextsteps),
      timestamp: parsedPersona.timestamp || Date.now()
    };
  } else if (typeof parsedPersona === 'string') {
    // Handle the string format (if still needed)
    const sections = parsedPersona.split('\n\n')
    const extractSection = (title: string) => {
      const section = sections.find(s => s.startsWith(`**${title}:**`))
      return section ? section.replace(`**${title}:**`, '').trim() : ''
    }
    const extractList = (title: string) => {
      const section = extractSection(title)
      return section ? section.split('\n').map(item => item.trim().replace(/^[-•]\s*/, '')) : []
    }

    return {
      id: String(Date.now()),
      name: extractSection('Name'),
      summary: extractSection('Career Journey'),
      qualificationsAndEducation: [
        ...extractList('Education'),
        ...extractList('Additional Training'),
        ...extractList('Field of Study')
      ],
      skills: [
        ...extractList('Technical Skills'),
        ...extractList('Creative Skills'),
        ...extractList('Other Skills')
      ],
      goals: extractList('Career Goals'),
      strengths: [], // Infer strengths from other sections if possible
      lifeExperiences: [
        ...extractList('Work Experiences'),
        ...extractList('Volunteer Experiences'),
        ...extractList('Military Life Experiences')
      ],
      valueProposition: [], // Infer value proposition from other sections if possible
      nextSteps: [], // Infer next steps from career goals if possible
      timestamp: Date.now() // Add this line
    }
  } else {
    // Handle unexpected format
    console.error('Unexpected persona format:', parsedPersona);
    return {
      id: String(Date.now()),
      name: 'Unknown',
      summary: '',
      qualificationsAndEducation: [],
      skills: [],
      goals: [],
      strengths: [],
      lifeExperiences: [],
      valueProposition: [],
      nextSteps: [],
      timestamp: Date.now() // Add this line
    };
  }
};

const transformSection = (section: any[]): { main: string; detail1?: string; detail2?: string }[] => {
  if (!Array.isArray(section)) return [];
  return section.map(item => {
    if (typeof item === 'object') {
      return {
        main: item.main || '',
        detail1: item.detail1,
        detail2: item.detail2
      };
    }
    return { main: item };
  });
};

export default function ViewPageClient() {
  const [cards, setCards] = useState<PersonaData[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [format, setFormat] = useState<'card' | 'bullet'>('card')
  const [selectedPersona, setSelectedPersona] = useState<PersonaData | undefined>(undefined)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const generatedPersona = localStorage.getItem('generatedPersona')
        console.log('Generated Persona from localStorage:', generatedPersona)
        if (generatedPersona) {
          try {
            const parsedPersona = JSON.parse(generatedPersona)
            console.log('Parsed Persona:', parsedPersona)
            const transformedPersona = transformPersonaData(parsedPersona)
            console.log('Transformed Persona:', transformedPersona)
            setCards([transformedPersona])
            setSelectedCardId(transformedPersona.id)
            setSelectedPersona(transformedPersona)
          } catch (parseError) {
            console.error('Error parsing persona:', parseError)
            setError('Failed to parse generated persona. Please try again.')
          }
          localStorage.removeItem('generatedPersona') // Clear after use
        } else {
          console.log('No generated persona in localStorage, fetching from API')
          const response = await axios.get('https://tcard-vercel.onrender.com/get_all_personas')
          console.log('API Response:', response.data)
          const transformedCards = response.data.map(transformPersonaData)
          setCards(transformedCards)
          if (transformedCards.length > 0) {
            setSelectedCardId(transformedCards[0].id)
          }
        }
      } catch (err) {
        console.error('Error fetching cards:', err)
        setError('Failed to load cards. Please try again later.')
      }
    }

    fetchData()
  }, [])

  const handleCardSelect = (id: string) => {
    setSelectedCardId(id)
  }

  const handlePersonaSelect = (persona: PersonaData) => {
    setSelectedPersona(persona)
    setSelectedCardId(persona.id)
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        {selectedCardId === null ? (
          <>
            <h1 className="text-3xl font-bold mb-6">Your Experience Cards</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <div key={card.id} className="p-4 border rounded flex flex-col h-full">
                  <h2 className="text-xl font-semibold mb-2">{card.name || `Experience Card ${card.id}`}</h2>
                  <p className="text-gray-600 mb-4 flex-grow">{card.summary}</p>
                  <div className="flex flex-col items-center">
                    <Button className="mb-2 w-full" onClick={() => handleCardSelect(card.id)}>View Details</Button>
                    <p className="text-xs text-gray-400">
                      {formatDate(new Date(card.timestamp), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/" passHref>
              <Button className="mt-8" variant="outline">Back to Home</Button>
            </Link>
          </>
        ) : (
          <ExperienceCard 
            initialData={cards.find(card => card.id === selectedCardId)} 
            persona={selectedPersona}
            format={format} 
            onPersonaSelect={handlePersonaSelect}
            onBackToCards={() => setSelectedCardId(null)}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}
