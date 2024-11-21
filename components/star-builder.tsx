"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Copy, Download, Pencil, RefreshCw, FileText, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Recommendations from "./recommendations"
import { RecommendationsSkeleton } from "./recommendations-skeleton"
import { BulletsSkeleton } from "./bullets-skeleton"
import { IndustrySelect } from "./industry-select"
import { SectionRecommendations } from "./section-recommendations"
import { getRandomRecommendations } from "@/lib/sample-data"

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
  recommendations: {
    situation?: Recommendation[]
    task?: Recommendation[]
    action?: Recommendation[]
    result?: Recommendation[]
  }
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
  recommendations: {
    situation: [],
    task: [],
    action: [],
    result: []
  },
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

const simulateRecommendations = () => ({
  situation: [
    {
      title: "Specificity in Context",
      subtitle: "Provide detailed background information",
      original_content: "Our company was facing financial difficulties",
      examples: [
        {
          content: "Our mid-sized tech startup, with 50 employees and $5M in annual revenue, was facing a cash flow crisis due to rapid expansion and delayed client payments",
          explanation: "Added specific details about company size, industry, and nature of the financial problem"
        }
      ]
    }
  ],
  task: [
    {
      title: "Clear Objective",
      subtitle: "Define your role and goals precisely",
      original_content: "I had to fix the problem",
      examples: [
        {
          content: "As the Financial Operations Manager, I was tasked with reducing accounts receivable by 30% within 3 months",
          explanation: "Added role, specific goal, and timeframe"
        }
      ]
    }
  ],
  action: [
    {
      title: "Action Detail",
      subtitle: "Specify the steps taken",
      original_content: "I implemented new processes",
      examples: [
        {
          content: "Developed and implemented an automated payment reminder system, reducing manual follow-up time by 75%",
          explanation: "Added specific action and quantifiable impact"
        }
      ]
    }
  ],
  result: [
    {
      title: "Measurable Impact",
      subtitle: "Quantify the outcomes",
      original_content: "We improved our finances",
      examples: [
        {
          content: "Reduced accounts receivable by 45% in 2 months, exceeding target by 15% and improving cash flow by $2.1M",
          explanation: "Added specific metrics and timeframe"
        }
      ]
    }
  ]
})

interface Example {
  content: string
  explanation: string
}

interface Recommendation {
  title: string
  subtitle: string
  original_content: string
  examples: Example[]
}

const StarBuilder: React.FC = () => {
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<StarBuilderState>(() => {
    const storedData = localStorage.getItem('starBuilderData')
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      return {
        ...initialState,
        ...parsedData,
        currentStep: parsedData.currentStep || 0
      }
    }
    return initialState
  })

  const [industrySearch, setIndustrySearch] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('starBuilderData', JSON.stringify({
        experienceType: state.experienceType,
        basicInfo: state.basicInfo,
        starContent: state.starContent,
        recommendations: state.recommendations,
        generatedBullets: state.generatedBullets,
        activeSection: state.activeSection,
        lastSaved: new Date().toLocaleString()
      }))
    }
  }, [state, mounted])

  const handleSimulateData = useCallback(() => {
    setState(prev => ({
      ...prev,
      isGenerating: true
    }))

    try {
      // Use test data immediately
      const recommendations = getRandomRecommendations()
      setState(prev => ({
        ...prev,
        recommendations,
        isGenerating: false
      }))
    } catch (error) {
      console.error('Error loading test data:', error)
      setState(prev => ({
        ...prev,
        isGenerating: false
      }))
    }
  }, [])

  const handleRegenerateRecommendations = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      recommendations: {
        situation: [],
        task: [],
        action: [],
        result: []
      }
    }))

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/star/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: state.basicInfo.company,
          position: state.basicInfo.position,
          industry: state.basicInfo.industry,
          situation: state.starContent.situation,
          task: state.starContent.task,
          actions: state.starContent.actions,
          results: state.starContent.results
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate recommendations')
      }

      const data = await response.json()
      setState(prev => ({
        ...prev,
        recommendations: data.recommendations,
        isGenerating: false
      }))
    } catch (error) {
      console.error('Error generating recommendations using test data:', error)
      // Load test data on error
      
      setState(prev => ({
        ...prev,
        recommendations: getRandomRecommendations(),
        isGenerating: false
      }))
    
    }
  }, [state.basicInfo, state.starContent])

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

  const handleGenerateBullets = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      isGenerating: true,
      currentStep: prev.currentStep + 1,
      generatedBullets: [] // Clear existing bullets
    }))

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate_star_bullets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          basic_info: state.basicInfo,
          star_content: state.starContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate bullets")
      }

      const data = await response.json()
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generatedBullets: data.bullets || []
      }))
    } catch (error) {
      console.error("Error generating bullets:", error)
      setState(prev => ({ 
        ...prev, 
        isGenerating: false
      }))
    }
  }, [state.basicInfo, state.starContent])

  const handleEditInput = useCallback(() => {
    // toast({
    //   title: "Editing Experience",
    //   description: "Returning to the Add Experience step...",
    //   duration: 2000,
    // })
    setState(prev => ({ ...prev, currentStep: 1 }))
  }, [])

  const handleCopyBullets = useCallback(() => {
    if (state.generatedBullets.length > 0) {
      navigator.clipboard.writeText(state.generatedBullets.join('\n\n'))
      // Remove toast notification - no feedback needed for now
    }
  }, [state.generatedBullets])

  const handleRegenerateBullets = useCallback(() => {
    setState(prev => ({
      ...prev,
      isGenerating: true
    }))

    // Simulate API call with test data
    setTimeout(() => {
      const recommendations = getRandomRecommendations();
      // Combine all recommendations into bullets
      const bullets = [
        ...recommendations.situation.map(r => r.title),
        ...recommendations.task.map(r => r.title),
        ...recommendations.action.map(r => r.title),
        ...recommendations.result.map(r => r.title)
      ];

      setState(prev => ({
        ...prev,
        isGenerating: false,
        generatedBullets: bullets
      }))
    }, 2000)
  }, [])

  const handleAddExperience = useCallback(() => {
    // toast({
    //   title: "Experience Added",
    //   description: "Your experience has been saved successfully.",
    //   duration: 2000,
    // })
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }))
  }, [])

  const formatDate = useCallback((month: string, year: string) => {
    if (!month || !year) return ""
    return `${month} ${year}`
  }, [])

  const handleDownloadBullets = useCallback(() => {
    if (state.generatedBullets.length > 0) {
      const content = state.generatedBullets.join('\n\n')
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${state.basicInfo.company}_${state.basicInfo.position}_bullets.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [state.generatedBullets, state.basicInfo])

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

  const renderStarInputForm = useCallback(() => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Reflect on your experiences</h2>
        <h3 className="text-xl font-semibold">Work Experiences</h3>
        <p className="text-gray-600">
          Using the STAR format below, complete the following for each work experience.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={state.basicInfo.company}
                onChange={handleInputChange}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={state.basicInfo.position}
                onChange={handleInputChange}
                placeholder="Enter position title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <IndustrySelect
                value={state.basicInfo.industry}
                onChange={(value) => setState(prev => ({
                  ...prev,
                  basicInfo: { ...prev.basicInfo, industry: value }
                }))}
                industriesByCategory={industriesByCategory}
              />
            </div>
          </div>

    
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={state.basicInfo.dateRange.startMonth}
                  onValueChange={(value) => setState(prev => ({
                    ...prev,
                    basicInfo: {
                      ...prev.basicInfo,
                      dateRange: { ...prev.basicInfo.dateRange, startMonth: value }
                    }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={state.basicInfo.dateRange.startYear}
                  onValueChange={(value) => setState(prev => ({
                    ...prev,
                    basicInfo: {
                      ...prev.basicInfo,
                      dateRange: { ...prev.basicInfo.dateRange, startYear: value }
                    }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={state.basicInfo.dateRange.endMonth}
                  onValueChange={(value) => setState(prev => ({
                    ...prev,
                    basicInfo: {
                      ...prev.basicInfo,
                      dateRange: { ...prev.basicInfo.dateRange, endMonth: value }
                    }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={state.basicInfo.dateRange.endYear}
                  onValueChange={(value) => setState(prev => ({
                    ...prev,
                    basicInfo: {
                      ...prev.basicInfo,
                      dateRange: { ...prev.basicInfo.dateRange, endYear: value }
                    }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="situation">Situation</Label>
            <Textarea
              id="situation"
              name="situation"
              value={state.starContent.situation}
              onChange={handleInputChange}
              placeholder="Describe the situation..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task">Task</Label>
            <Textarea
              id="task"
              name="task"
              value={state.starContent.task}
              onChange={handleInputChange}
              placeholder="What was your task..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actions">Actions</Label>
            <Textarea
              id="actions"
              name="actions"
              value={state.starContent.actions}
              onChange={handleInputChange}
              placeholder="What actions did you take..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="results">Results</Label>
            <Textarea
              id="results"
              name="results"
              value={state.starContent.results}
              onChange={handleInputChange}
              placeholder="What were the results..."
            />
          </div>
        </div>
      </div>
    )
  }, [state.basicInfo, state.starContent, handleInputChange])

  const renderRecommendations = useCallback(() => {
    return (
      <div className="space-y-4">
        
        {state.isGenerating ? (
          <RecommendationsSkeleton />
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Review and Submit</h3>
            <p className="text-gray-600">
              See the STAR recommendations below and make any edits if necessary. 
              Once you are happy with your STAR information, select Generate Bullets for your resume bullet content.
            </p>
            <div className="h-px bg-gray-200 my-6"></div>

            <div className="bg-gray-50 rounded-md p-4 space-y-5">
              <h4 className="text-md text-gray-700 font-semibold">Experience Details</h4>
                
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="company" className="text-sm font-normal text-gray-700">Company</Label>
                  <Input id="company" name="company" value={state.basicInfo.company} onChange={handleInputChange} placeholder="Enter company name" />
                </div>
                <div>
                  <Label htmlFor="position" className="text-sm font-normal text-gray-700">Position Title</Label>
                  <Input id="position" name="position" value={state.basicInfo.position} onChange={handleInputChange} placeholder="Enter position title" />
                </div>
                <div>
                  <Label htmlFor="industry" className="text-sm font-normal text-gray-700">Industry</Label>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-normal text-gray-700">Start Date</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={state.basicInfo.dateRange.startMonth}
                      onValueChange={(value) => setState(prev => ({
                        ...prev,
                        basicInfo: {
                          ...prev.basicInfo,
                          dateRange: { ...prev.basicInfo.dateRange, startMonth: value }
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={state.basicInfo.dateRange.startYear}
                      onValueChange={(value) => setState(prev => ({
                        ...prev,
                        basicInfo: {
                          ...prev.basicInfo,
                          dateRange: { ...prev.basicInfo.dateRange, startYear: value }
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-normal text-gray-700">End Date</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={state.basicInfo.dateRange.endMonth}
                      onValueChange={(value) => setState(prev => ({
                        ...prev,
                        basicInfo: {
                          ...prev.basicInfo,
                          dateRange: { ...prev.basicInfo.dateRange, endMonth: value }
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={state.basicInfo.dateRange.endYear}
                      onValueChange={(value) => setState(prev => ({
                        ...prev,
                        basicInfo: {
                          ...prev.basicInfo,
                          dateRange: { ...prev.basicInfo.dateRange, endYear: value }
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <h4 className="text-md text-gray-700 font-semibold">AI Recommendations</h4>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="situation" className="text-gray-700">Situation</Label>
                  <div className="space-y-4">
                    <Textarea 
                      id="situation" 
                      name="situation" 
                      value={state.starContent.situation} 
                      onChange={handleInputChange}
                      placeholder="The company was experiencing a decline in client retention..."
                    />
                    <SectionRecommendations 
                      section="situation"
                      recommendations={state.recommendations?.situation}
                      isLoading={state.isGenerating}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task" className="text-gray-700">Task</Label>
                  <div className="space-y-4">
                  <Textarea 
                    id="task" 
                    name="task" 
                    value={state.starContent.task} 
                    onChange={handleInputChange}
                    placeholder="My role was to analyze the current processes..."
                  />
                  <SectionRecommendations 
                    section="task"
                    recommendations={state.recommendations?.task}
                    isLoading={state.isGenerating}
                  />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actions" className="text-gray-700">Actions</Label>

                  <div className="space-y-4">
                    <Textarea 
                      id="actions" 
                      name="actions" 
                      value={state.starContent.actions} 
                      onChange={handleInputChange}
                      placeholder="Conducted in-depth data analysis..."
                    />
                    <SectionRecommendations 
                      section="action"
                      recommendations={state.recommendations?.action}
                      isLoading={state.isGenerating}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="results" className="text-gray-700">Result</Label>

                  <div className="space-y-4">
                    <Textarea 
                      id="results" 
                      name="results" 
                      value={state.starContent.results} 
                      onChange={handleInputChange}
                      placeholder="Increased client retention by 15%..."
                    />
                    <SectionRecommendations 
                      section="result"
                      recommendations={state.recommendations?.result}
                      isLoading={state.isGenerating}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button 
                  variant="outline"
              onClick={handleSimulateData}
              className="flex items-center gap-2"
              disabled={state.isGenerating}
            >
              <Sparkles className="h-4 w-4" />
              Load Test Data
            </Button>
            <Button 
              onClick={handleRegenerateRecommendations} 
              className="flex items-center gap-2"
              disabled={state.isGenerating}
            >
              {state.isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerate Recommendations
                </>
              )}
            </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }, [state.recommendations, handleSimulateData, handleRegenerateRecommendations, state.isGenerating])

  const renderGeneratedBullets = useCallback(() => {
    if (!mounted) return null

    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Edit Your Input</h2>
          <p className="text-gray-600">If you want to make edits to your input, click below to go back to form.</p>
          
          <Card className="relative hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleEditInput}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{state.basicInfo.position || 'Position'}</h3>
                  <p className="text-gray-500">{state.basicInfo.company || 'Company'}</p>
                </div>
                <div className="h-full flex flex-col justify-between items-end space-y-4">
                  <Pencil className="h-4 w-4" />
                  <p className="text-sm text-gray-500">
                    {formatDate(state.basicInfo.dateRange.startMonth, state.basicInfo.dateRange.startYear)} - {' '}
                    {formatDate(state.basicInfo.dateRange.endMonth, state.basicInfo.dateRange.endYear) || 'Present'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {state.isGenerating ? (
          <BulletsSkeleton />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Review Generated Output</h2>
                <p className="text-gray-600">
                  See the STAR Bullets content below and make any edits if necessary. 
                  Once you are happy with your information, click Complete Add Experience to save this experience
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopyBullets}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Textarea 
                    className="min-h-[200px]"
                    value={state.generatedBullets.join("\n")}
                    onChange={(e) => setState(prev => ({ 
                      ...prev, 
                      generatedBullets: e.target.value.split("\n").filter(Boolean)
                    }))}
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
              <Button 
                  variant="outline" 
                  onClick={handleSimulateData}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Load Test Data
                </Button>
            </div>
          </div>
        )}
      </div>
    )
  }, [mounted, state, handleEditInput, handleCopyBullets, handleRegenerateBullets, handleAddExperience, formatDate, handleSimulateData])

  const renderExport = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Export Your Work</h2>
      <div className="bg-gray-100 p-4 rounded space-y-5">
        <Card className="relative hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleEditInput}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{state.basicInfo.position || 'Position'}</h3>
                <p className="text-gray-500">{state.basicInfo.company || 'Company'}</p>
              </div>
              <div className="h-full flex flex-col justify-between items-end space-y-4">
                <Pencil className="h-4 w-4" />
                <p className="text-sm text-gray-500">
                  {formatDate(state.basicInfo.dateRange.startMonth, state.basicInfo.dateRange.startYear)} - {' '}
                  {formatDate(state.basicInfo.dateRange.endMonth, state.basicInfo.dateRange.endYear) || 'Present'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleEditInput}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{state.basicInfo.position || 'Position'}</h3>
                <p className="text-gray-500">{state.basicInfo.company || 'Company'}</p>
              </div>
              <div className="h-full flex flex-col justify-between items-end space-y-4">
                <Pencil className="h-4 w-4" />
                <p className="text-sm text-gray-500">
                  {formatDate(state.basicInfo.dateRange.startMonth, state.basicInfo.dateRange.startYear)} - {' '}
                  {formatDate(state.basicInfo.dateRange.endMonth, state.basicInfo.dateRange.endYear) || 'Present'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Button onClick={handleDownloadBullets}>
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

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center w-full justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <div className="h-px w-4 bg-gray-300 mx-2" />}
            <div 
              className={`
                ${index <= state.currentStep 
                  ? 'font-bold border-b-2 border-primary' 
                  : 'font-normal text-gray-500'
                }
                cursor-pointer
              `}
              onClick={() => handleStepClick(index)}
            >
              {step.title}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const handleRestart = useCallback(() => {
    if (window.confirm('Are you sure you want to restart? This will clear all your progress.')) {
      localStorage.removeItem('starBuilderData')
      setState({
        ...initialState,
        lastSaved: "Not saved yet"
      })
    }
  }, [])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.currentStep > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [state.currentStep])

  const handleGenerateRecommendations = useCallback(async () => {
    // First move to next step and show loading state
    setState(prev => ({
      ...prev,
      isGenerating: true,
      currentStep: prev.currentStep + 1,
      recommendations: {
        situation: [],
        task: [],
        action: [],
        result: []
      }
    }))

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/star/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          basic_info: state.basicInfo,
          star_content: state.starContent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate recommendations')
      }

      const data = await response.json()
      setState(prev => ({
        ...prev,
        recommendations: data.recommendations,
        isGenerating: false
      }))
    } catch (error) {
      console.error('Error generating recommendations:', error)
      // Keep user on the page, just show error state
      setState(prev => ({
        ...prev,
        isGenerating: false
      }))
    }
  }, [state.basicInfo, state.starContent])

  if (!mounted) {
    return null
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
            <Button 
              variant="ghost" 
              onClick={handleRestart}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              Restart
            </Button>
          </div>
          <div className="flex justify-between mt-4 px-8">
            {renderStepIndicator()}
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
                <Button 
                  onClick={state.currentStep === 1 ? handleGenerateRecommendations : handleGenerateBullets}
                  disabled={state.isGenerating}
                >
                  {state.isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      {state.currentStep !== 3 && <Sparkles className="mr-2 h-4 w-4" />}
                      {state.currentStep === 1 && "Generate Recommendations"}
                      {state.currentStep === 2 && "Generate Bullets"}
                      {state.currentStep === 3 && (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Save Experience
                        </>
                      )}
                    </>
                  )}
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

export default StarBuilder