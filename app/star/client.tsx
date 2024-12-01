"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StarMainPage } from "@/components/star-main-page"
import { Experience } from '@/types/types'
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function StarClient() {
  const router = useRouter()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load all saved STAR experiences from localStorage
    const savedExperiences = localStorage.getItem('starExperiences')
    const savedBuilderState = localStorage.getItem('starBuilderState')
    
    if (savedExperiences) {
      try {
        const parsedExperiences = JSON.parse(savedExperiences)
        // Sort experiences by id (creation date), most recent first
        const sortedExperiences = parsedExperiences.sort((a: Experience, b: Experience) => {
          return b.id - a.id // Sort by ID (timestamp) in descending order
        })
        
        setExperiences(sortedExperiences)
      } catch (error) {
        console.error('Error parsing saved experiences:', error)
      }
    }

    // Clear the builder state after loading experiences
    if (savedBuilderState) {
      localStorage.removeItem('starBuilderState')
    }
    
    setIsLoading(false)
  }, [])

  const getRandomColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
      '#D4A5A5', '#9B9B9B', '#A8E6CF', '#DCEDC1', '#FFD3B6'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const handleAddNew = () => {
    // Clear any existing builder state
    localStorage.removeItem('starBuilderData')
    router.push('/starinput')
  }

  const handleEditExperience = (experienceId: number) => {
    console.log('Editing experience:', experienceId) // Debug log
    router.push(`/star/edit/${experienceId}`)
  }

  const handleExportSelected = (selectedIds: number[]) => {
    const selectedExperiences = experiences.filter(exp => 
      selectedIds.includes(exp.id)
    )
    // Implement export logic here
    console.log('Exporting:', selectedExperiences)
  }

  const handleDelete = (id: number) => {
    const updatedExperiences = experiences.filter(exp => exp.id !== id)
    setExperiences(updatedExperiences)
    localStorage.setItem('starExperiences', JSON.stringify(updatedExperiences))
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <StarMainPage 
      experiences={experiences}
      onAddNew={handleAddNew}
      onEdit={handleEditExperience}
      onExport={handleExportSelected}
      onDelete={handleDelete}
    />
  )
} 