"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StarMainPage } from "@/components/star-main-page"
import { Experience } from '@/types/types'

export default function StarClient() {
  const router = useRouter()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadExperiences = () => {
      try {
        const savedData = localStorage.getItem('starBuilderState')
        console.log('Raw saved data:', savedData)
        
        if (savedData) {
          const parsed = JSON.parse(savedData)
          const experience = {
            id: Date.now(),
            title: parsed.basicInfo.position,
            company: parsed.basicInfo.company,
            type: parsed.experienceType || 'work',
            dateRange: parsed.basicInfo.dateRange,
            bullets: parsed.generatedBullets || [],
            starContent: parsed.starContent || {
              situation: '',
              task: '',
              actions: '',
              results: ''
            },
            selected: false,
            gradient: `linear-gradient(135deg, ${getRandomColor()} 0%, ${getRandomColor()} 100%)`
          }
          
          setExperiences([experience])
        }
      } catch (error) {
        console.error('Error loading experiences:', error)
        setExperiences([])
      } finally {
        setIsLoading(false)
      }
    }

    loadExperiences()
  }, [])

  const getRandomColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
      '#D4A5A5', '#9B9B9B', '#A8E6CF', '#DCEDC1', '#FFD3B6'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const handleAddNew = () => {
    router.push('/star/builder')
  }

  const handleEditExperience = (id: number) => {
    router.push(`/star/builder/${id}`)
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