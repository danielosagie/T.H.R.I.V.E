"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Plus, X, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

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

export function StarMainPage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'work' | 'volunteer' | 'school'>('all')
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const savedExperiences = localStorage.getItem('starExperiences')
    if (savedExperiences) {
      setExperiences(JSON.parse(savedExperiences))
    }
  }, [])

  const filteredExperiences = experiences.filter(exp => 
    activeTab === 'all' ? true : exp.type === activeTab
  )

  const selectedCount = experiences.filter(exp => exp.selected).length

  const handleAddNew = () => {
    router.push('/starinput')
  }

  const handleEdit = (id: number) => {
    // Find the experience to edit
    const experience = experiences.find(exp => exp.id === id)
    if (experience) {
      // Save the current state to localStorage for editing
      localStorage.setItem('editExperience', JSON.stringify(experience))
      router.push('/starinput')
    }
  }

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
      // Save selected state to localStorage
      localStorage.setItem('starExperiences', JSON.stringify(experiences))
      // Navigate to export page (correct URL)
      router.push('/star-export')
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
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
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