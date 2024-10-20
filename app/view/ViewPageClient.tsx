"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Footer } from "@/components/footer"
import { ExperienceCard } from "@/components/experience-card"
import axios from 'axios'
import { format as formatDate } from 'date-fns'
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
    // Handle the string format
    const sections = parsedPersona.split('\n\n')
    const extractSection = (title: string) => {
      const section = sections.find(s => s.startsWith(`**${title}:**`))
      return section ? section.replace(`**${title}:**`, '').trim() : ''
    }
    const extractList = (title: string) => {
      const section = extractSection(title)
      return section ? section.split('\n').map(item => ({ main: item.trim().replace(/^[-•]\s*/, '') })) : []
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
      timestamp: Date.now()
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
      timestamp: Date.now()
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
    const selected = cards.find(card => card.id === id)
    if (selected) {
      setSelectedPersona(selected)
    }
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
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src="/assets/logo.svg" alt="THRIVE Toolkit Logo" width={20} height={20} className="sm:w-6 sm:h-6" />
            <h1 className="text-sm sm:text-xl font-bold ml-2">THRIVE Toolkit</h1>
          </Link>
          <h2 className="text-lg sm:text-2xl font-bold text-center">Experience Card</h2>
          {cards.length > 0 && (
            <Select onValueChange={handleCardSelect} value={selectedCardId || undefined}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a card" />
              </SelectTrigger>
              <SelectContent>
                {cards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name || `Card ${card.id.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {cards.length === 0 ? (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">No Experience Cards Found</h3>
            <p className="mb-6">Create your first Experience Card to get started!</p>
            <Link href="/input" passHref>
              <Button>Create Experience Card</Button>
            </Link>
          </div>
        ) : selectedCardId === null ? (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Select an Experience Card</h3>
            <p className="mb-6">Choose a card from the dropdown above to view or edit.</p>
            <Link href="/input" passHref>
              <Button>Create New Experience Card</Button>
            </Link>
          </div>
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
