"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StarMainPage } from "@/components/star-main-page"

export default function StarClient() {
  const router = useRouter()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load saved experiences from localStorage
    const loadExperiences = () => {
      const savedExperiences = localStorage.getItem('starExperiences')
      if (savedExperiences) {
        setExperiences(JSON.parse(savedExperiences))
      }
      setIsLoading(false)
    }

    loadExperiences()
  }, [])

  const handleAddNew = () => {
    router.push('/starinput')
  }

  const handleEditExperience = (id: number) => {
    // Save the current experience ID to edit
    localStorage.setItem('editExperienceId', id.toString())
    router.push('/starinput')
  }

  const handleExportSelected = (selectedIds: number[]) => {
    const selectedExperiences = experiences.filter(exp => 
      selectedIds.includes(exp.id)
    )
    // Implement export logic here
    console.log('Exporting:', selectedExperiences)
  }

  const handleDeleteExperience = (id: number) => {
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
      onDelete={handleDeleteExperience}
    />
  )
} 