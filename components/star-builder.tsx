"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Copy, Download, Pencil, RefreshCw, FileText } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Recommendations from "./recommendations"
import { useToast } from "@/components/ui/use-toast"
import { RecommendationsSkeleton } from "./recommendations-skeleton"
import { BulletsSkeleton } from "./bullets-skeleton"

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
  experienceType: "work" | "volunteer" | "school" | null
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
  activeSection: "situation" | "task" | "actions" | "results"
  isGenerating: boolean
  lastSaved: string
}

const initialState: StarBuilderState = {
  currentStep: 0,
  experienceType: null,
  basicInfo: {
    company: "",
    position: "",
    industry: "",
    dateRange: {
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: ""
    }
  },
  starContent: {
    situation: "",
    task: "",
    actions: "",
    results: ""
  },
  recommendations: null,
  generatedBullets: [],
  activeSection: "situation",
  isGenerating: false,
  lastSaved: ""
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

export function StarBuilderComponent() {
  const [state, setState] = useState<StarBuilderState>(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("starBuilderState")
      return savedState ? JSON.parse(savedState) : initialState
    }
    return initialState
  })
  const [industrySearch, setIndustrySearch] = useState("''")
  const { toast } = useToast()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("starBuilderState", JSON.stringify(state))
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [state])

  const handleExperienceTypeSelect = useCallback((type: "work" | "volunteer" | "school") => {
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
    handleNext()
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/star/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...state.basicInfo,
          ...state.starContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate recommendations")
      }

      const data = await response.json()
      setState(prev => ({
        ...prev,
        recommendations: data.recommendations,
        isGenerating: false
      }))

      toast({
        title: "Success",
        description: "Your STAR recommendations have been generated.",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error generating recommendations:", error)
      setState(prev => ({ ...prev, isGenerating: false }))
      handleBack()
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        duration: 2000,
        variant: "destructive",
      })
    }
  }, [state.basicInfo, state.starContent, toast, handleNext, handleBack])

  const handleGenerateBullets = useCallback(async () => {
    setState(prev => ({ ...prev, isGenerating: true }))
    handleNext()

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/star/bullets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...state.basicInfo,
          ...state.starContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate bullets")
      }

      const data = await response.json()
      setState(prev => ({
        ...prev,
        generatedBullets: data.bullets || [],
        isGenerating: false
      }))

      toast({
        title: "Success",
        description: "Your bullets have been generated successfully.",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error generating bullets:", error)
      setState(prev => ({ ...prev, isGenerating: false }))
      handleBack()
      toast({
        title: "Error",
        description: "Failed to generate bullets. Please try again.",
        duration: 2000,
        variant: "destructive",
      })
    }
  }, [state.basicInfo, state.starContent, toast, handleNext, handleBack])

  const handleEditInput = useCallback(() => {
    toast({
      title: "Editing Experience",
      description: "Returning to the Add Experience step...",
      duration: 2000,
    })
    setState(prev => ({ ...prev, currentStep: 1 }))
  }, [toast])

  const handleCopyBullets = useCallback(() => {
    navigator.clipboard.writeText(state.generatedBullets.join("'\n'"))
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
          onClick={() => handleExperienceTypeSelect("work")}
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
          onClick={() => handleExperienceTypeSelect("volunteer")}
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
          onClick={() => handleExperienceTypeSelect("school")}
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
            placeholder="The company was experiencing a decline in client retention due to inefficiencies project management and communication."
          />
        </div>
        
        <div>
          <Label htmlFor="task">Task</Label>
          <Textarea 
            id="task" 
            name="task" 
            value={state.starContent.task} 
            onChange={handleInputChange}
            placeholder="My role was to analyze the current processes and recommend improvements enhance client satisfaction streamline operations."
          />
        </div>
        
        <div>
          <Label htmlFor="actions">Actions</Label>
          <Textarea 
            id="actions" 
            name="actions" 
            value={state.starContent.actions} 
            onChange={handleInputChange}
            placeholder="Conducted in-depth data analysis, facilitated workshops with teams, and introduced new tools to track client engagement project timelines."
          />
        </div>
        
        <div>
          <Label htmlFor="results">Result</Label>
          <Textarea 
            id="results" 
            name="results" 
            value={state.starContent.results} 
            onChange={handleInputChange}
            placeholder="Increased client retention by 15% over 6 months and reduced project completion time 20%."
          />
        </div>
        
        <Button onClick={handleGenerateRecommendations} disabled={state.isGenerating}>
          {state.isGenerating ? "'Generating...'" : "Generate Recommendations"}
        </Button>
      </div>
    </div>
  )

  const renderRecommendations = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">AI Recommendations</h2>
      <Recommendations 
        llmResponse={state.recommendations} 
        onGenerateBullets={handleGenerateBullets}
        isLoading={state.isGenerating}
      />
    </div>
  )

  const renderGeneratedBullets = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Generated Bullets</h2>
      {state.isGenerating ? (
        <BulletsSkeleton />
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  {state.basicInfo.position} at {state.basicInfo.company}
                </p>
                <Textarea 
                  className="min-h-[200px]"
                  value={state.generatedBullets.join("\n")}
                  onChange={(e) => setState(prev => ({ 
                    ...prev, 
                    generatedBullets: e.target.value.split("\n") 
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

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
    <div className="min-h-screen bg-white flex flex-col dark:bg-neutral-950">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/assets/logo.svg" alt="THRIVE Toolkit Logo" width={24} height={24} />
              <span className="font-semibold">THRIVE Toolkit</span>
            </Link>
            <h2 className="text-2xl font-bold">Building Your STAR Bullets</h2>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Last saved: {state.lastSaved}
            </div>
          </div>
          <div className="flex justify-between mt-4 px-8">
            {steps.map((step, index) => (
              <div key={index} className={`text-center ${index === state.currentStep ? "'text-primary font-bold'" : "'text-muted-foreground'"}`}>
                <div className="text-sm">{step.title}</div>
                <div className="mt-2 h-1 bg-neutral-100 dark:bg-neutral-800">
                  <div 
                    className={`h-full bg-primary transition-all duration-300 ease-in-out ${
                      index <= state.currentStep ? "'w-full'" : "'w-0'"
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
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Designed by Georgia Tech Research Institute
          </div>
          <div className="space-x-4">
            <Link href="/feedback" className="text-sm text-neutral-500 hover:underline dark:text-neutral-400">
              Give Us Feedback
            </Link>
            <Link href="/privacy" className="text-sm text-neutral-500 hover:underline dark:text-neutral-400">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}