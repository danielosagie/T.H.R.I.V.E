"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { ExperienceCard } from "@/components/experience-card"
import axios from 'axios'
import { useRouter } from 'next/router'
import ErrorPage from 'next/error'

interface PersonaData {
  id: string
  name: string
  summary: string
  goals: string[]
  nextSteps: string[]
  lifeExperiences: string[]
  qualificationsAndEducation: string[]
  skills: string[]
  strengths: string[]
  valueProposition: string[]
}

export default function ViewPage() {
  const router = useRouter();
  const [cards, setCards] = useState<PersonaData[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const generatedPersona = localStorage.getItem('generatedPersona')
        if (generatedPersona) {
          const parsedPersona = JSON.parse(generatedPersona)
          setCards([parsedPersona])
          setSelectedCardId(parsedPersona.id)
          localStorage.removeItem('generatedPersona')
        } else {
          const response = await axios.get('https://tcard-vercel.onrender.com/get_all_personas')
          setCards(response.data)
        }
        setLoading(false)
      } catch (err) {
        console.error('Error fetching cards:', err)
        setError('Failed to load cards. Please try again later.')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (!router.isFallback && !cards.length) {
    return <ErrorPage statusCode={404} />
  }

  const handleCardSelect = (id: string) => {
    setSelectedCardId(id)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        {selectedCardId === null ? (
          <>
            <h1 className="text-3xl font-bold mb-6">Your Experience Cards</h1>
            <div className="space-y-4">
              {cards.map((card) => (
                <div key={card.id} className="p-4 border rounded">
                  <h2 className="text-xl font-semibold">{card.name || `Experience Card ${card.id}`}</h2>
                  <p className="text-gray-600 mt-2">{card.summary}</p>
                  <Button className="mt-2" onClick={() => handleCardSelect(card.id)}>View Details</Button>
                </div>
              ))}
            </div>
            <Link href="/" passHref>
              <Button className="mt-8" variant="outline">Back to Home</Button>
            </Link>
          </>
        ) : (
          <>
            <Button className="mb-4" variant="outline" onClick={() => setSelectedCardId(null)}>Back to Cards</Button>
            <ExperienceCard initialData={cards.find(card => card.id === selectedCardId)} />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
