"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Copy, Download, Pencil, RefreshCw, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Recommendations from './recommendations'
import { useToast } from "@/components/ui/use-toast"

interface Industry {
  category: string;
  industries: string[];
}

const industriesByCategory: Industry[] = [
  {
    category: "Technology & Communications",
    industries: [
      "Artificial Intelligence",
      "Big Data & Analytics",
      "Cloud Computing",
      "Cybersecurity",
      "E-commerce",
      "FinTech",
      "Hardware & Electronics",
      "Information Technology",
      "Internet & Digital Media",
      "Software Development",
      "Telecommunications",
    ]
  },
  // ... (all other categories and industries as provided in the previous prompt)
];

interface StarBuilderState {
  currentStep: number
  experienceType: 'work' | 'volunteer' | 'school' | null
  basicInfo: {
    company: string
    position: string
    industry: string
    dateRange: {
      startMonth: string
      startYear: string
      endMonth: string
      endYear: string
    }
  }
  starContent: {
    situation: string
    task: string
    actions: string
    results: string
  }
  recommendations: any
  generatedBullets: string[]
  activeSection: 'situation' | 'task' | 'action' | 'result'
  isGenerating: boolean
  lastSaved: string
}

const initialState: StarBuilderState = {
  currentStep: 0,
  experienceType: null,
  basicInfo: {
    company: '',
    position: '',
    industry: '',
    dateRange: {
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: ''
    }
  },
  starContent: {
    situation: '',
    task: '',
    actions: '',
    results: ''
  },
  recommendations: null,
  generatedBullets: [],
  activeSection: 'situation',
  isGenerating: false,
  lastSaved: ''
}

const steps = [
  { title: "Start Bullets", description: "Choose experience type" },
  { title: "Add Experience", description: "Enter STAR details" },
  { title: "Review Improvements", description: "Check AI suggestions" },
  { title: "Review Bullets", description: "Finalize your bullets" },
  { title: "End Bullets", description: "Export your work" },
]

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

export default function StarBuilder() {
  const [state, setState] = useState<StarBuilderState>(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('starBuilderState')
      return savedState ? JSON.parse(savedState) : initialState
    }
    return initialState
  })
  const [industrySearch, setIndustrySearch] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('starBuilderState', JSON.stringify(state))
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [state])

  const handleExperienceTypeSelect = useCallback((type: 'work' | 'volunteer' | 'school') => {
    setState(prev => ({ ...prev, experienceType: type, currentStep: 1 }))
  }, [])

  const handleNext = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, steps.length - 1) }))
  }, [])

  const handleBack = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 0) }))
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setState(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, [name]: value },
      starContent: { ...prev.starContent, [name]: value }
    }))
  }, [])

  const handleGenerateRecommendations = useCallback(async () => {
    setState(prev => ({ ...prev, isGenerating: true }))
    try {
      const response = await fetch('http://localhost:5000/generate_persona_stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...state.basicInfo,
          ...state.starContent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate recommendations')
      }

      const data = await response.json()
      setState(prev => ({
        ...prev,
        recommendations: data.persona,
        isGenerating: false
      }))

      toast({
        title: "Recommendations Generated",
        description: "Your STAR recommendations have been generated successfully.",
        duration: 2000,
      })
    } catch (error) {
      console.error('Error generating recommendations:', error)
      setState(prev => ({ ...prev, isGenerating: false }))
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        duration: 2000,
      })
    }
  }, [state.basicInfo, state.starContent, toast])

  const handleGenerateBullets = useCallback(async () => {
    setState(prev => ({ ...prev, isGenerating: true }))
    try {
      const response = await fetch('http://localhost:5000/generate_persona_stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...state.basicInfo,
          ...state.starContent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate bullets')
      }

      const data = await response.json()
      setState(prev => ({
        ...prev,
        generatedBullets: data.persona.skills.map((skill: string) => skill.split(',')[0]),
        isGenerating: false
      }))

      toast({
        title: "Bullets Generated",
        description: "Your bullets have been generated successfully.",
        duration: 2000,
      })
    } catch (error) {
      console.error('Error generating bullets:', error)
      setState(prev => ({ ...prev, isGenerating: false }))
      toast({
        title: "Error",
        description: "Failed to generate bullets. Please try again.",
        duration: 2000,
      })
    }
  }, [state.basicInfo, state.starContent, toast])

  const handleEditInput = useCallback(() => {
    toast({
      title: "Editing Experience",
      description: "Returning to the Add Experience step...",
      duration: 2000,
    })
    setState(prev => ({ ...prev, currentStep: 1 }))
  }, [toast])

  const handleCopyBullets = useCallback(() => {
    navigator.clipboard.writeText(state.generatedBullets.join('\n'))
    toast({
      title: "Copied to Clipboard",
      description: "Bullets have been copied to your clipboard.",
      duration: 2000,
    })
  }, [state.generatedBullets, toast])

  const handleRegenerateBullets = useCallback(() => {
    toast({
      title: "Regenerating Bullets",
      description: "Please wait while we generate new bullets...",
      duration: 2000,
    })
    handleGenerateBullets()
  }, [handleGenerateBullets, toast])

  const handleAddExperience = useCallback(() => {
    toast({
      title: "Experience Added",
      description: "Your experience has been saved successfully.",
      duration: 2000,
    })
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }))
  }, [toast])

  const renderExperienceTypeSelection = () => (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center">Which category is your experience in?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="cursor-pointer transition-all hover:scale-105"
          onClick={() => handleExperienceTypeSelect('work')}
        >
          <CardContent className="p-6">
            <div className="h-32 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-white text-xl font-bold">Work</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">Full/part-time jobs</Badge>
              <Badge variant="secondary">Home operations</Badge>
              <Badge variant="secondary">Business management</Badge>
              <Badge variant="secondary">Freelancing</Badge>
              <Badge variant="secondary">Deployments/PCS</Badge>
              <Badge variant="secondary">Crisis management</Badge>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:scale-105"
          onClick={() => handleExperienceTypeSelect('volunteer')}
        >
          <CardContent className="p-6">
            <div className="h-32 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-600">
              <span className="text-white text-xl font-bold">Volunteer</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">Event planning</Badge>
              <Badge variant="secondary">Mentoring</Badge>
              <Badge variant="secondary">Fundraising</Badge>
              <Badge variant="secondary">Community aid</Badge>
              <Badge variant="secondary">Program management</Badge>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:scale-105"
          onClick={() => handleExperienceTypeSelect('school')}
        >
          <CardContent className="p-6">
            <div className="h-32 rounded-lg flex items-center justify-center bg-gradient-to-br from-yellow-500 to-red-600">
              <span className="text-white text-xl font-bold">Education</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">Degrees</Badge>
              <Badge variant="secondary">Certificates</Badge>
              <Badge variant="secondary">Research</Badge>
              <Badge variant="secondary">Self-study</Badge>
              <Badge variant="secondary">Workshops</Badge>
              <Badge variant="secondary">Projects</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderStarInputForm = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reflect on your experiences</h2>
      <h3 className="text-xl font-semibold">Work Experiences</h3>
      <p className="text-gray-600">Using the STAR format below, complete the following for each work experience.</p>
      
      <div className="h-px bg-gray-200 my-6"></div>
      
      <div className="bg-gray-50 bg-opacity-80 rounded-lg p-6 space-y-6">
        <h4 className="text-lg font-semibold">Work Experience 1</h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" value={state.basicInfo.company} onChange={handleInputChange} placeholder="Enter company name" />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Select 
              onValueChange={(value) => setState(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, industry: value } }))}
              value={state.basicInfo.industry}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <Input 
                  placeholder="Search industries..." 
                  value={industrySearch}
                  onChange={(e) => setIndustrySearch(e.target.value)}
                  className="mb-2"
                />
                {industriesByCategory.map((category) => (
                  <React.Fragment key={category.category}>
                    <SelectItem value={category.category} disabled>
                      {category.category}
                    </SelectItem>
                    {category.industries
                      .filter(industry => 
                        industry.toLowerCase().includes(industrySearch.toLowerCase())
                      )
                      .map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))
                    }
                  </React.Fragment>
                ))}
                {industrySearch && !industriesByCategory.some(category => 
                  category.industries.some(industry => 
                    industry.toLowerCase().includes(industrySearch.toLowerCase())
                  )
                ) && (
                  <SelectItem value={industrySearch}>
                    Other: {industrySearch}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="position">Position Title</Label>
            <Input id="position" name="position" value={state.basicInfo.position} onChange={handleInputChange} placeholder="Enter position title" />
          </div>
        </div>
        
        <div>
          <Label>Dates</Label>
          <div className="grid grid-cols-4 gap-4">
            <Select onValueChange={(value) => setState(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, dateRange: { ...prev.basicInfo.dateRange, startMonth: value } } }))}>
              <SelectTrigger>
                <SelectValue placeholder="Start Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setState(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, dateRange: { ...prev.basicInfo.dateRange, startYear: value } } }))}>
              <SelectTrigger>
                <SelectValue placeholder="Start Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setState(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, dateRange: { ...prev.basicInfo.dateRange, endMonth: value } } }))}>
              <SelectTrigger>
                <SelectValue placeholder="End Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setState(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, dateRange: { ...prev.basicInfo.dateRange, endYear: value } } }))}>
              <SelectTrigger>
                <SelectValue placeholder="End Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="situation">Situation</Label>
          <Textarea 
            id="situation" 
            name="situation" 
            value={state.starContent.situation} 
            onChange={handleInputChange}
            placeholder="The company was experiencing a decline in client retention due to inefficiencies in project management and communication."
          />
        </div>
        
        <div>
          <Label htmlFor="task">Task</Label>
          <Textarea 
            id="task" 
            name="task" 
            value={state.starContent.task} 
            onChange={handleInputChange}
            placeholder="My role was to analyze the current processes and recommend improvements to enhance client satisfaction and streamline operations."
          />
        </div>
        
        <div>
          <Label htmlFor="actions">Actions</Label>
          <Textarea 
            id="actions" 
            name="actions" 
            value={state.starContent.actions} 
            onChange={handleInputChange}
            placeholder="Conducted in-depth data analysis, facilitated workshops with teams, and introduced new tools to track client engagement and project timelines."
          />
        </div>
        
        <div>
          <Label htmlFor="results">Result</Label>
          <Textarea 
            id="results" 
            name="results" 
            value={state.starContent.results} 
            onChange={handleInputChange}
            placeholder="Increased client retention by 15% over 6 months and reduced project completion time by 20%."
          />
        </div>
        
        <Button onClick={handleGenerateRecommendations} disabled={state.isGenerating}>
          {state.isGenerating ? 'Generating...' : 'Generate Recommendations'}
        </Button>
      </div>
    </div>
  )

  const renderRecommendations = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Review and Submit</h3>
      <p className="text-gray-600">See the STAR recommendations below and make any edits if necessary. Once you are happy with your STAR information, select Generate Bullets for your resume bullet content.</p>
      <div className="h-px bg-gray-200 my-6"></div>
      
      <Recommendations
        llmResponse={state.recommendations}
        onGenerateBullets={handleGenerateBullets}
      />
    </div>
  )

  const renderGeneratedBullets = () => {
    const calculateDuration = (startMonth: string, startYear: string, endMonth: string, endYear: string) => {
      if (!startMonth || !startYear || !endMonth || !endYear) return ''
      
      const start = new Date(`${startMonth} 1, ${startYear}`)
      const end = new Date(`${endMonth} 1, ${endYear}`)
      
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      
      if (years === 0) {
        return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
      } else if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`
      } else {
        return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
      }
    }

    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Edit Your Input</h2>
          <p className="text-gray-600">If you want to make edits to your input, click below to go back to form.</p>
          
          <Card className="relative">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{state.basicInfo.position}</h3>
                  <p className="text-gray-500">{state.basicInfo.company}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500">
                    {state.basicInfo.dateRange.startMonth} {state.basicInfo.dateRange.startYear} - {' '}
                    {state.basicInfo.dateRange.endMonth} {state.basicInfo.dateRange.endYear}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleEditInput}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit experience</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Review Generated Output</h2>
              <p className="text-gray-600">
                See the STAR Bullets content below and make any edits if necessary. 
                Once you are happy with your information, click Complete Add Experience to save this experience
              </p>
            </div>
            <Button variant="outline" onClick={handleCopyBullets}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="space-y-1">
                  <h3 className="font-semibold">{state.basicInfo.position}</h3>
                  <p className="text-sm text-gray-500">
                    {state.basicInfo.company}, {calculateDuration(
                      state.basicInfo.dateRange.startMonth,
                      state.basicInfo.dateRange.startYear,
                      state.basicInfo.dateRange.endMonth,
                      state.basicInfo.dateRange.endYear
                    )}
                  </p>
                </div>
                <Textarea 
                  className="min-h-[200px]"
                  value={state.generatedBullets.join('\n')}
                  onChange={(e) => setState(prev => ({ ...prev, generatedBullets: e.target.value.split('\n') }))}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button 
              variant="secondary" 
              onClick={handleRegenerateBullets}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate Bullets
            </Button>
            <Button onClick={handleAddExperience}>
              <FileText className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderExport = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Export Your Work</h2>
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="text-xl font-semibold mb-2">{state.basicInfo.position} at {state.basicInfo.company}</h3>
        <p className="text-sm text-gray-500 mb-4">
          {state.basicInfo.dateRange.startMonth} {state.basicInfo.dateRange.startYear} - 
          {state.basicInfo.dateRange.endMonth} {state.basicInfo.dateRange.endYear}
        </p>
        <ul className="list-disc list-inside space-y-2">
          {state.generatedBullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      </div>
      <Button onClick={() => {/* Implement export functionality */}}>
        <Download className="mr-2 h-4 w-4" />
        Export to PDF
      </Button>
    </div>
  )

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 0:
        return renderExperienceTypeSelection()
      case 1:
        return renderStarInputForm()
      case 2:
        return renderRecommendations()
      case 3:
        return renderGeneratedBullets()
      case 4:
        return renderExport()
      default:
        return <div>Step not implemented yet</div>
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="THRIVE Toolkit Logo" width={24} height={24} />
              <h1 className="text-xl font-bold ml-2">THRIVE Toolkit</h1>
            </Link>
            <h2 className="text-2xl font-bold">Building Your STAR Bullets</h2>
            <div className="text-sm text-muted-foreground">
              Last saved: {state.lastSaved}
            </div>
          </div>
          <div className="flex justify-between mt-4 px-8">
            {steps.map((step, index) => (
              <div key={index} className={`text-center ${index === state.currentStep ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                <div className="text-sm">{step.title}</div>
                <div className="mt-2 h-1 bg-muted">
                  <div 
                    className={`h-full bg-primary transition-all duration-300 ease-in-out ${
                      index <= state.currentStep ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {renderCurrentStep()}
          {state.currentStep > 0 && (
            <div className="mt-8 flex justify-between">
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {state.currentStep < steps.length - 1 && (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Designed by Georgia Tech Research Institute
          </div>
          <div className="space-x-4">
            <Link href="/feedback" className="text-sm text-muted-foreground hover:underline">
              Give Us Feedback
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}