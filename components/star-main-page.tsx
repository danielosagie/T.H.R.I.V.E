/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
/* eslint-disable */

"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Plus, X, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

interface Experience {
  id: number
  title: string
  company: string
  type: 'work' | 'volunteer' | 'school'
  dateRange: {
    startMonth: string
    startYear: string
    endMonth: string
    endYear: string
  }
  bullets: string[]
  selected: boolean
  gradient: string
}

interface StarMainPageProps {
  experiences: Experience[]
  onAddNew: () => void
  onEdit: (id: number) => void
  onExport: (selectedIds: number[]) => void
  onDelete: (id: number) => void
}

const generateGradient = () => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
    'linear-gradient(135deg, #b721ff 0%, #21d4fd 100%)',
    'linear-gradient(135deg, #fd6585 0%, #0d25b9 100%)',
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  ]
  return gradients[Math.floor(Math.random() * gradients.length)]
}

const defaultExperience: Experience = {
  id: Date.now(),
  title: '',
  company: '',
  type: 'work',
  dateRange: {
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: ''
  },
  bullets: [],
  selected: false,
  gradient: generateGradient()
}

export function StarMainPage({ 
  experiences: propExperiences,
  onAddNew,
  onEdit,
  onExport,
  onDelete 
}: StarMainPageProps) {
  const [experiences, setExperiences] = useState<Experience[]>(propExperiences)
  const [activeTab, setActiveTab] = useState<'all' | 'work' | 'volunteer' | 'school'>('all')
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setExperiences(propExperiences)
  }, [propExperiences])

  const filteredExperiences = experiences.filter(exp => 
    activeTab === 'all' ? true : exp.type === activeTab
  )

  const selectedCount = experiences.filter(exp => exp.selected).length

  const handleAddNew = () => {
    const newExperience = {
      ...defaultExperience,
      id: Date.now(),
      gradient: generateGradient()
    }
    localStorage.setItem('newExperience', JSON.stringify(newExperience))
    router.push('/starinput')
  }

  const handleEdit = useCallback((id: number) => {
    try {
      const experiences = JSON.parse(localStorage.getItem('starExperiences') || '[]')
      const experienceToEdit = experiences.find((exp: Experience) => exp.id === id)
      if (experienceToEdit && !experienceToEdit.gradient) {
        experienceToEdit.gradient = generateGradient()
      }
      localStorage.setItem('editExperience', JSON.stringify(experienceToEdit))
      router.push(`/starinput/edit/${id}`)
    } catch (error) {
      console.error('Navigation error:', error)
      toast.error('Failed to navigate to edit page. Please try again.')
    }
  }, [router])

  const handleDelete = (id: number) => {
    const updatedExperiences = experiences.filter(exp => exp.id !== id)
    setExperiences(updatedExperiences)
    localStorage.setItem('starExperiences', JSON.stringify(updatedExperiences))
  }

  const toggleExperience = (id: number) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, selected: !exp.selected } : exp
    ))
  }

  const formatDate = (month: string, year: string) => {
    return month && year ? `${month} ${year}` : 'Present'
  }

  const handleExport = () => {
    if (isExporting) {
      const selectedIds = experiences.filter(exp => exp.selected).map(exp => exp.id)
      onExport(selectedIds)
    } else {
      setIsExporting(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/assets/logo.svg" alt="THRIVE Toolkit Logo" width={24} height={24} />
              <span className="font-semibold">THRIVE Toolkit</span>
            </Link>
          </div>
          
          <h1 className="text-xl font-semibold">STAR Bullets</h1>
          
          <Button 
            variant={isExporting ? "secondary" : "default"} 
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? `${selectedCount} Experiences Selected` : "Start Export"}
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Your STAR Experiences</h2>
            <div className="flex justify-between items-center">
              <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => 
                setActiveTab(value as "work" | "volunteer" | "school" | "all")
              }>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="work">Work</TabsTrigger>
                  <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
                  <TabsTrigger value="school">School</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Experience
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredExperiences.map((experience) => (
              <Card 
                key={experience.id} 
                className={`p-4 ${
                  experience.selected ? "border-primary" : "border-light-gray"
                } hover:border-primary transition-colors duration-200`}
              >
                <div className="relative">
                  <div 
                    className="w-16 h-16 rounded-lg mb-4" 
                    style={{ background: experience.gradient }}
                  />
                  {isExporting ? (
                    <div 
                      className="absolute top-2 right-2 cursor-pointer"
                      onClick={() => toggleExperience(experience.id)}
                    >
                      <div className={`w-4 h-4 rounded border ${
                        experience.selected ? "bg-primary border-primary" : "border-gray-400"
                      }`} />
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(experience.id)}
                        disabled={isNavigating}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(experience.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <h4 className="font-semibold truncate">{experience.title}</h4>
                <p className="text-neutral-500 text-sm truncate">{experience.company}</p>
                <p className="text-neutral-400 text-xs mt-1">
                  {formatDate(experience.dateRange.startMonth, experience.dateRange.startYear)} - {' '}
                  {formatDate(experience.dateRange.endMonth, experience.dateRange.endYear)}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {isExporting && (
          <div className="fixed bottom-8 right-8">
            <Button variant="secondary" onClick={() => setIsExporting(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel Export
            </Button>
          </div>
        )}
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p className="text-sm text-neutral-500">Designed by Georgia Tech Research Institute</p>
          <div className="space-x-4">
            <Link href="/feedback" className="text-sm text-neutral-500 hover:underline">
              Give Us Feedback
            </Link>
            <Link href="/privacy" className="text-sm text-neutral-500 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}