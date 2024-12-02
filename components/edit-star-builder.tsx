/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
/* eslint-disable */

"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Copy, Download, Pencil, RefreshCw, FileText, Sparkles, History } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Recommendations from "./recommendations"
import { RecommendationsSkeleton } from "./recommendations-skeleton"
import { BulletsSkeleton } from "./bullets-skeleton"
import { IndustrySelect } from "./industry-select"
import { SectionRecommendations } from "./section-recommendations"
import { getRandomRecommendations } from "@/lib/sample-data"
import { useRouter } from "next/navigation"
import { MinimalTiptapEditor } from '@/components/minimal-tiptap/minimal-tiptap'
import { SectionTwo } from '@/components/minimal-tiptap/components/section/two'
import { SectionFour } from '@/components/minimal-tiptap/components/section/four'
import { Separator } from '@/components/ui/separator'
import StarterKit from '@tiptap/starter-kit'
import Markdown from 'react-markdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEditor } from '@tiptap/react'
import { Bold, Italic, UnderlineIcon, List } from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import { toast } from 'sonner'
import { Toaster } from 'sonner'
import { TailorPositionDialog } from "./tailor-position-dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface Industry {
  category: string;
  industries: string[];
}

const industriesByCategory: Industry[] = [
  {
    category: "Agriculture & Food",
    industries: [
      "Farming & Livestock",
      "AgriTech & Smart Farming",
      "Food & Beverage Production",
      "Food Distribution & Retail",
      "Sustainable Agriculture",
      "Urban Farming & Hydroponics",
    ],
  },
  {
    category: "Technology & Digital",
    industries: [
      "Artificial Intelligence & Machine Learning",
      "Blockchain & Decentralized Technologies",
      "Cloud Computing & Infrastructure",
      "Cybersecurity & Privacy",
      "Data Science & Analytics",
      "Digital Transformation & Automation",
      "E-commerce & Digital Retail",
      "Enterprise Software",
      "Gaming & Interactive Entertainment",
      "Web Development & App Development",
    ],
  },
  {
    category: "Healthcare & Life Sciences",
    industries: [
      "Biotechnology & Pharmaceuticals",
      "Digital Health Tech",
      "Healthcare Services & Administration",
      "Medical Devices & Diagnostics",
      "Public Health & Epidemiology",
      "Telemedicine & Remote Care",
      "Wellness & Preventive Care",
    ],
  },
  {
    category: "Finance & Professional Services",
    industries: [
      "Accounting & Auditing",
      "Banking & Financial Services",
      "Cryptocurrency & Digital Assets",
      "Insurance & Risk Management",
      "Investment Management & Private Equity",
      "Legal Services & Compliance",
      "Real Estate & Property Management",
      "Tax & Advisory Services",
    ],
  },
  {
    category: "Energy & Environmental",
    industries: [
      "Clean Energy & Renewables",
      "Energy Utilities & Infrastructure",
      "Environmental Conservation & Sustainability",
      "Oil & Gas",
      "Recycling & Waste Management",
      "Water Resources & Management",
    ],
  },
  {
    category: "Manufacturing & Industrial",
    industries: [
      "Aerospace & Defense",
      "Automotive & Transportation Equipment",
      "Construction & Building Materials",
      "Consumer Goods Manufacturing",
      "Electronics & Hardware",
      "Industrial Equipment & Machinery",
      "Supply Chain & Logistics",
    ],
  },
  {
    category: "Media & Entertainment",
    industries: [
      "Advertising & Marketing",
      "Content Creation & Distribution",
      "Film & Television Production",
      "Music & Audio Production",
      "Publishing & Digital Media",
      "Streaming Services",
      "Visual Arts & Design",
    ],
  },
  {
    category: "Education & Nonprofit",
    industries: [
      "Early Childhood Education",
      "Higher Education & Research",
      "K-12 Education",
      "Nonprofit & Philanthropy",
      "Online Learning Platforms",
      "Specialized Training & Development",
    ],
  },
  {
    category: "Retail & Consumer Services",
    industries: [
      "Apparel & Fashion",
      "Beauty & Personal Care",
      "Food & Beverage Services",
      "Home Improvement & Furnishings",
      "Luxury Goods & Jewelry",
      "Travel & Hospitality",
    ],
  },
  {
    category: "Transportation & Mobility",
    industries: [
      "Aviation & Airlines",
      "Maritime & Shipping",
      "Public Transportation",
      "Ride Sharing & Mobility Services",
      "Trucking & Freight",
      "Urban Transportation Planning",
    ],
  },
  {
    category: "Government & Public Services",
    industries: [
      "Defense & Military",
      "Emergency Services",
      "Infrastructure Planning & Development",
      "Public Administration & Policy",
      "Space Exploration",
    ],
  },
  {
    category: "Miscellaneous & Emerging Fields",
    industries: [
      "Artificial Reality & Virtual Reality",
      "Consumer Electronics",
      "Esports & Competitive Gaming",
      "Fashion Technology",
      "Pet Care & Services",
      "Social Impact & Community Development",
      "Space Tech & Exploration",
    ],
  },
];

interface StarBuilderState {
  currentStep: number
  experienceType: "work" | "volunteer" | "school" | null
  basicInfo: {
    company: string
    position: string
    industries: string[]
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
    industries: [],
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

const getRandomGradient = () => {
  const hue1 = Math.floor(Math.random() * 360);
  const hue2 = (hue1 + 30) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 80%) 0%, hsl(${hue2}, 70%, 80%) 100%)`;
};
// Define a simpler toolbar button component
const ToolbarButton = ({ 
  onClick,
  isActive,
  icon,
  label
}: {
  onClick: () => void;
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
}) => (
  <Button
    variant="ghost"
    size="sm"
    className={`p-2 ${isActive ? 'bg-muted' : ''}`}
    onClick={onClick}
    title={label}
  >
    {icon}
  </Button>
)

const MinimalEditor = ({ 
  value,
  onChange,
  ...props 
}: {
  value: string;
  onChange: (value: string) => void;
  [key: string]: any;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false
        },
        orderedList: {
          keepAttributes: false,
          keepMarks: false
        },
        heading: false,
        codeBlock: false,
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <MinimalTiptapEditor
        {...props}
        editor={editor as any}
      />
      <div className="shrink-0 overflow-x-auto border-t border-border p-2">
        <div className="flex w-max items-center justify-center gap-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={<Bold className="h-4 w-4" />}
            label="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={<Italic className="h-4 w-4" />}
            label="Italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            icon={<UnderlineIcon className="h-4 w-4" />}
            label="Underline"
          />
          <div className="h-7 w-px bg-border mx-2" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={<List className="h-4 w-4" />}
            label="Bullet List"
          />
        </div>
      </div>
    </>
  )
}

interface EditStarBuilderProps {
  experienceId: number
}

interface EditStarBuilderProps {
  experienceId: number
}

// Define version types and their properties
const VERSION_TYPES = {
  GENERATE: {
    type: 'generate',
    label: 'Generated',
    color: 'bg-blue-100 text-blue-800'
  },
  REGENERATE: {
    type: 'regenerate',
    label: 'Regenerated',
    color: 'bg-purple-100 text-purple-800'
  },
  TAILOR: {
    type: 'tailor',
    label: 'Tailored',
    color: 'bg-green-100 text-green-800'
  }
} as const

type VersionType = keyof typeof VERSION_TYPES

// At the top of the file, add these type declarations
interface Position {
  id: string;
  title: string;
}

interface EditorRef {
  editor: any;
}

const EditStarBuilder = ({ experienceId }: EditStarBuilderProps) => {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<StarBuilderState>(() => {
    if (typeof window !== 'undefined') {
      const savedExperiences = localStorage.getItem('starExperiences')
      if (savedExperiences) {
        const experiences = JSON.parse(savedExperiences)
        const experienceToEdit = experiences.find((exp: any) => exp.id === experienceId)
        if (experienceToEdit) {
          return {
            ...initialState,
            currentStep: 3,
            experienceType: experienceToEdit.type,
            basicInfo: {
              company: experienceToEdit.company,
              position: experienceToEdit.title,
              industries: experienceToEdit.industries,
              dateRange: {
                startMonth: experienceToEdit.dateRange.startMonth,
                startYear: experienceToEdit.dateRange.startYear,
                endMonth: experienceToEdit.dateRange.endMonth,
                endYear: experienceToEdit.dateRange.endYear
              }
            },
            starContent: {
              situation: experienceToEdit.starContent.situation,
              task: experienceToEdit.starContent.task,
              actions: experienceToEdit.starContent.actions,
              results: experienceToEdit.starContent.results
            },
            recommendations: {
              situation: experienceToEdit.recommendations.situation,
              task: experienceToEdit.recommendations.task,
              action: experienceToEdit.recommendations.action,
              result: experienceToEdit.recommendations.result
            },
            generatedBullets: experienceToEdit.bullets,
            activeSection: "situation",
            isGenerating: false,
            lastSaved: new Date().toLocaleString()
          }
        }
      }
    }
    return initialState
  })
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [bulletVersions, setBulletVersions] = useState<BulletVersion[]>(() => {
    if (typeof window !== 'undefined') {
      const savedExperiences = localStorage.getItem('starExperiences')
      if (savedExperiences) {
        const experiences = JSON.parse(savedExperiences)
        const experienceToEdit = experiences.find((exp: any) => exp.id === experienceId)
        if (experienceToEdit) {
          const originalVersion = {
            content: experienceToEdit.bullets,
            timestamp: Date.now(),
            type: 'original',
            label: 'Original Version'
          }
          const savedVersions = localStorage.getItem(`bulletVersions_${experienceId}`)
          return savedVersions ? [originalVersion, ...JSON.parse(savedVersions)] : [originalVersion]
        }
      }
    }
    return []
  })
  const [isVersionSidebarOpen, setIsVersionSidebarOpen] = useState(false)
  const editorRef = useRef<EditorRef>(null)

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

  useEffect(() => {
    const savedState = localStorage.getItem('starBuilderState')
    
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        setState(prev => ({
          ...prev,
          ...parsedState
        }))
      } catch (error) {
        console.error('Error parsing saved state:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Clear any draft state when editing an existing experience
    localStorage.removeItem('starBuilderDraft')
  }, [])

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
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/star/recommendations`
      console.log('Attempting to fetch from:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: state.basicInfo.company,
          position: state.basicInfo.position,
          industry: state.basicInfo.industries?.[0] || '',
          situation: state.starContent.situation,
          task: state.starContent.task,
          actions: state.starContent.actions,
          results: state.starContent.results
        }),
      })

      const responseText = await response.text()
      console.log('Raw response:', responseText)
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseText}`)
      }

      const data = JSON.parse(responseText)
      
      // Transform the recommendations to ensure examples are properly structured
      const transformRecommendations = (section: any[]) => {
        return section.map(item => ({
          ...item,
          examples: item.examples.map((example: any) => ({
            example1: example.example_1 || '',
            example2: example.example_2 || ''
          }))
        }))
      }

      const recommendations = {
        situation: transformRecommendations(data.recommendations.situation || []),
        task: transformRecommendations(data.recommendations.task || []),
        action: transformRecommendations(data.recommendations.action || []),
        result: transformRecommendations(data.recommendations.result || [])
      }

      setState(prev => ({
        ...prev,
        recommendations: recommendations as StarRecommendations,
        isGenerating: false
      }))
    } catch (error) {
      console.error('Error:', error)
      setState(prev => ({
        ...prev,
        isGenerating: false
      }))
      toast.error("Failed to generate recommendations. Please try again later.")
    }
  }, [state.basicInfo, state.starContent])

  const handleExperienceTypeSelect = (type: "work" | "volunteer" | "school") => {
    setState(prev => ({
      ...prev,
      experienceType: type,
      currentStep: 1
    }))
  }

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
    // Validate required fields
    if (!state.basicInfo.company || !state.basicInfo.position) {
      toast.error("Please fill in company and position information")
      return
    }

    if (!state.starContent.situation || !state.starContent.task || 
        !state.starContent.actions || !state.starContent.results) {
      toast.error("Please fill in all STAR content sections")
      return
    }

    setState(prev => ({
      ...prev,
      isGenerating: true,
      currentStep: prev.currentStep + 1,
      generatedBullets: []
    }))

    const requestData = {
      basic_info: {
        company: state.basicInfo.company,
        position: state.basicInfo.position,
        industry: state.basicInfo.industries
      },
      star_content: {
        situation: state.starContent.situation,
        task: state.starContent.task,
        actions: state.starContent.actions,
        results: state.starContent.results
      },
      recommendations: state.recommendations
    }

    console.log('Sending request data:', requestData) // Add logging

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/star/bullets`
      console.log('Attempting to generate bullets from:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const responseText = await response.text()
      console.log('Raw response:', responseText)

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText, responseText)
        throw new Error(`Failed to generate bullets: ${response.status} - ${responseText}`)
      }

      // Extract JSON from the response using regex
      const jsonMatch = responseText.match(/\{[\s\S]*?\}(?=\s*$)/)?.[0] || 
                       responseText.match(/\{\{[\s\S]*?\}\}/)?.[0]?.replace(/\{\{|\}\}/g, '')
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response')
      }

      const data = JSON.parse(jsonMatch)
      
      if (!data.bullets || !Array.isArray(data.bullets)) {
        console.error('Invalid response format:', data)
        throw new Error('Invalid response format from server')
      }

      // Transform bullets into TipTap JSON content
      const formattedContent = {
        type: 'doc',
        content: data.bullets.map(bullet => {
          const cleanBullet = bullet.trim()
            .replace(/^["']|["']$/g, '') // Remove quotes
            .replace(/^- /, '• ') // Replace dash with bullet

          return {
            type: 'paragraph',
            content: [{
              type: 'text',
              text: cleanBullet
            }]
          }
        })
      }

      setState(prev => ({
        ...prev,
        generatedBullets: formattedContent,
        isGenerating: false
      }))

      // Save version with type
      saveBulletVersion(formattedContent, 'GENERATE')
      
      toast.success("Bullets generated successfully!")
    } catch (error) {
      console.error('Error generating bullets:', error)
      setState(prev => ({
        ...prev,
        isGenerating: false
      }))
      
      // Provide more specific error messages
      const errorMessage = error.message.includes('Failed to fetch') 
        ? "Unable to connect to the server. Please check your internet connection."
        : error.message || "Failed to generate bullets. Please try again later."
        
      toast.error(errorMessage)
    }
  }, [state.basicInfo, state.starContent, state.recommendations])

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

  const handleRegenerateBullets = useCallback(async () => {
    setState(prev => ({ ...prev, isGenerating: true }))
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/star/bullets`
      console.log('Attempting to regenerate bullets:', {
        url: apiUrl,
        data: {
          basic_info: state.basicInfo,
          star_content: state.starContent,
          recommendations: state.recommendations
        }
      })
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          basic_info: {
            company: state.basicInfo.company,
            position: state.basicInfo.position,
            industry: state.basicInfo.industries
          },
          star_content: {
            situation: state.starContent.situation,
            task: state.starContent.task,
            actions: state.starContent.actions,
            results: state.starContent.results
          },
          recommendations: state.recommendations
        })
      })

      console.log('Response status:', response.status)
      const responseText = await response.text()
      console.log('Raw response:', responseText)

      if (!response.ok) {
        throw new Error(`Failed to regenerate bullets: ${response.status} ${responseText}`)
      }

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*?\}(?=\s*$)/)?.[0] || 
                       responseText.match(/\{\{[\s\S]*?\}\}/)?.[0]?.replace(/\{\{|\}\}/g, '')
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response')
      }

      const data = JSON.parse(jsonMatch)

      // Format the response bullets
      const formattedBullets = {
        type: 'doc',
        content: data.bullets.map(bullet => ({
          type: 'paragraph',
          content: [{ type: 'text', text: bullet }]
        }))
      }

      setState(prev => ({
        ...prev,
        generatedBullets: formattedBullets,
        isGenerating: false
      }))

      // Save version with type
      saveBulletVersion(formattedBullets, 'REGENERATE')
      
      toast.success("Bullets regenerated successfully!")
    } catch (error) {
      console.error('Error regenerating bullets:', error)
      setState(prev => ({
        ...prev,
        isGenerating: false
      }))
      toast.error("Failed to regenerate bullets. Please check console for details.")
    }
  }, [state.basicInfo, state.starContent, state.recommendations])

  const handleUpdateExperience = useCallback(() => {
    if (!mounted) return
    
    try {
      const savedExperiences = localStorage.getItem('starExperiences')
      if (savedExperiences) {
        const experiences = JSON.parse(savedExperiences)
        const index = experiences.findIndex((exp: any) => exp.id === experienceId)
        
        if (index !== -1) {
          experiences[index] = {
            ...experiences[index],
            id: experienceId, // Preserve the original ID
            title: state.basicInfo.position,
            company: state.basicInfo.company,
            type: state.experienceType,
            dateRange: state.basicInfo.dateRange,
            bullets: state.generatedBullets,
            starContent: state.starContent,
            recommendations: state.recommendations,
            // Preserve the original gradient
            gradient: experiences[index].gradient
          }
          
          localStorage.setItem('starExperiences', JSON.stringify(experiences))
          toast.success("Experience updated successfully!")
          router.push('/star')
        }
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error("Failed to update experience. Please try again.")
    }
  }, [state, experienceId, router, mounted])

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
            <div className="space-y-2 gap-4">
              <Label htmlFor="industries" className="space-y-2">Industries</Label>
              <IndustrySelect
                value={state.basicInfo.industries as any}
                onChange={(value) => {
                  updateState({
                    basicInfo: {
                      ...state.basicInfo,
                      industries: [value]
                    }
                  });
                }}
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
              placeholder="Try to describe the situation - The company was experiencing a decline in client retention due to inefficiencies in project management and communication."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task">Task</Label>
            <Textarea
              id="task"
              name="task"
              value={state.starContent.task}
              onChange={handleInputChange}
                placeholder="What was your task? - My role was to analyze the current processes and recommend improvements to enhance client satisfaction and streamline operations. "
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actions">Actions</Label>
            <Textarea
              id="actions"
              name="actions"
              value={state.starContent.actions}
              onChange={handleInputChange}
               placeholder="What actions did you take? - Conducted in-depth data analysis, facilitated workshops with teams, and introduced new tools to track client engagement and project timelines."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="results">Results</Label>
            <Textarea
              id="results"
              name="results"
              value={state.starContent.results}
              onChange={handleInputChange}
              placeholder="What were the results? - Increased client retention by 15% over 6 months and reduced project completion time by 20%."
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
                  <Label htmlFor="industries" className="text-sm font-normal text-gray-700">Industries</Label>
                  <IndustrySelect
                    value={state.basicInfo.industries as any}
                    onChange={(newValue) => {
                      updateState({
                        basicInfo: {
                          ...state.basicInfo,
                          industries: newValue
                        }
                      });
                    }}
                    industriesByCategory={industriesByCategory}
                  />
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
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Edit Your Experience</h2>
          <p className="text-gray-600">Review and update your experience details below.</p>
          
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

        <div className="space-y-4">
          

          {state.isGenerating ? (
            <BulletsSkeleton />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Review Generated Output</h2>
                  <p className="text-gray-600">
                    See the STAR Bullets content below and make any edits if necessary. 
                    Once you are happy with your information, click Save Experience to save this experience
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  
                  <Button
                    variant="secondary"
                    onClick={handleRegenerateBullets}
                    className="flex items-center"
                    disabled={state.isGenerating}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${state.isGenerating ? 'animate-spin' : ''}`} />
                    {state.isGenerating ? 'Generating...' : 'Regenerate'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleCopyBullets}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>

              <TooltipProvider>
              <div className="group relative flex flex-col justify-between rounded-xl bg-white transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] col-span-3 lg:col-span-1">
                <div className="flex flex-col border border-input shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary h-full min-h-56 w-full rounded-xl">
                  <MinimalTiptapEditor
                    ref={editorRef}
                    value={state.generatedBullets}
                    onChange={(newContent) => {
                      setState(prev => ({ 
                        ...prev, 
                        generatedBullets: newContent 
                      }))
                    }}
                    className="min-h-[200px] p-4"
                  />
                </div>
              </div>
            </TooltipProvider>

              <div className="flex justify-between items-center pt-4">
                <div className="flex justify-between items-center w-full">
                    
                  <TailorPositionDialog 
                    onTailor={handleTailorRegenerateBullets}
                    selectedPosition={selectedPosition}
                    onPositionSelect={setSelectedPosition}
                  />
                  

                  <Button
                    variant="outline"
                    onClick={() => setIsVersionSidebarOpen(true)}
                    className="flex items-center ml-2 gap-2"
                  >
                    
                    <History className="h-4 w-4" />
                    Version History
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }, [mounted, state, handleEditInput, handleCopyBullets, handleRegenerateBullets, selectedPosition, bulletVersions])

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
              `}
            >
              {step.title}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const handleRestart = useCallback(() => {
    const confirmRestart = window.confirm(
      "Are you sure you want to restart? All progress will be lost."
    )
    
    if (confirmRestart) {
      // Only clear the current experience's data
      const experienceId = router.query?.id
      if (experienceId) {
        const savedExperiences = localStorage.getItem('starExperiences')
        if (savedExperiences) {
          const experiences = JSON.parse(savedExperiences)
          const updatedExperiences = experiences.filter(
            (exp: any) => exp.id !== parseInt(experienceId as string)
          )
          localStorage.setItem('starExperiences', JSON.stringify(updatedExperiences))
        }
      }
      
      // Clear current builder state
      localStorage.removeItem('starBuilderState')
      setState(initialState)
    }
  }, [router.query?.id])

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
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/star/recommendations`
      console.log('Attempting to fetch from:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          company: state.basicInfo.company,
          position: state.basicInfo.position,
          industry: state.basicInfo.industries?.[0] || '',
          situation: state.starContent.situation,
          task: state.starContent.task,
          actions: state.starContent.actions,
          results: state.starContent.results
        }),
      })

      const responseText = await response.text()
      console.log('Raw response:', responseText)
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseText}`)
      }

      const data = JSON.parse(responseText)
      
      // Transform the recommendations to ensure examples are properly structured
      const transformRecommendations = (section: any[]) => {
        return section.map(item => ({
          ...item,
          examples: item.examples.map((example: any) => ({
            example1: example.example_1 || '',
            example2: example.example_2 || ''
          }))
        }))
      }

      const recommendations = {
        situation: transformRecommendations(data.recommendations.situation || []),
        task: transformRecommendations(data.recommendations.task || []),
        action: transformRecommendations(data.recommendations.action || []),
        result: transformRecommendations(data.recommendations.result || [])
      }

      setState(prev => ({
        ...prev,
        recommendations: recommendations as StarRecommendations,
        isGenerating: false
      }))
    } catch (error) {
      console.error('Error:', error)
      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentStep: prev.currentStep - 1 // Go back a step on error
      }))
      toast.error("Failed to generate recommendations. Sometimes the API is busy, please try again.")
    }
  }, [state.basicInfo, state.starContent])

  const handleSaveExperience = useCallback(() => {
    try {
      const savedExperiences = JSON.parse(localStorage.getItem('starExperiences') || '[]')
      const experienceId = router.query?.id ? parseInt(router.query.id as string) : null
      
      if (experienceId) {
        // Find and update existing experience
        const updatedExperiences = savedExperiences.map((exp: any) => {
          if (exp.id === experienceId) {
            return {
              ...exp,
              ...state.basicInfo,
              bullets: state.generatedBullets,
              gradient: exp.gradient // Preserve the existing gradient
            }
          }
          return exp
        })
        localStorage.setItem('starExperiences', JSON.stringify(updatedExperiences))
      }
      
      router.push('/star')
      toast.success('Experience saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save experience. Please try again.')
    }
  }, [state, router])

  const handleTailorRegenerateBullets = useCallback(async () => {
    setState(prev => ({ ...prev, isGenerating: true }))
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/star/tailor`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basic_info: {
            company: state.basicInfo.company,
            position: state.basicInfo.position,
            industry: state.basicInfo.industries
          },
          star_content: {
            situation: state.starContent.situation,
            task: state.starContent.task,
            action: state.starContent.action,
            result: state.starContent.result
          },
          targetPosition: selectedPosition
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`Failed to tailor bullets: ${response.status} ${JSON.stringify(data)}`)
      }

      // Parse the response, handling both direct and raw response formats
      let bullets: string[] = []
      if (data.bullets) {
        bullets = data.bullets
      } else if (data.raw_response) {
        try {
          // First try to parse the entire raw_response as JSON
          const parsed = JSON.parse(data.raw_response)
          if (parsed.bullets) {
            bullets = parsed.bullets
          } else {
            // If that fails, try to extract JSON from the text
            const jsonMatch = data.raw_response.match(/\{[\s\S]*?\}(?=\s*$)/)?.[0]
            if (jsonMatch) {
              const extracted = JSON.parse(jsonMatch)
              bullets = extracted.bullets
            } else {
              throw new Error('No valid JSON found in response')
            }
          }
        } catch (e) {
          console.error('Error parsing raw response:', e)
          throw new Error('Invalid response format from server')
        }
      }

      // Create TipTap formatted content
      const formattedContent = createTipTapContent(bullets)

      // Update state
      setState(prev => ({
        ...prev,
        generatedBullets: formattedContent,
        isGenerating: false
      }))

      // Save version with type
      saveBulletVersion(formattedContent, 'TAILOR')
      
      toast.success("Bullets tailored successfully!")
    } catch (error) {
      console.error('Error tailoring bullets:', error)
      setState(prev => ({ ...prev, isGenerating: false }))
      toast.error(error.message || "Failed to tailor bullets. Please try again.")
    }
  }, [state, selectedPosition])

  // Helper function to create TipTap content
  const createTipTapContent = (bullets: string[]) => ({
    type: 'doc',
    content: bullets.map(bullet => ({
      type: 'paragraph',
      content: [{
        type: 'text',
        text: bullet.trim()
          .replace(/^["']|["']$/g, '')
          .replace(/^-\s*/, '• ')
      }]
    }))
  })

  // Helper function to save bullet versions
  const saveBulletVersion = (content: any, type: VersionType) => {
    const newVersion = {
      id: Date.now(),
      content,
      timestamp: new Date().toISOString(),
      type,
      metadata: VERSION_TYPES[type]
    }
    setBulletVersions(prev => [newVersion, ...prev])
  }

  // Helper function to handle version revert
  const handleRevertVersion = (version: BulletVersion) => {
    try {
      const formattedContent = version.content
      
      // Update editor content
      if (editorRef.current?.editor) {
        editorRef.current.editor.commands.setContent(formattedContent)
      }
      
      // Update state
      setState(prev => ({
        ...prev,
        generatedBullets: formattedContent
      }))
      
      setIsVersionSidebarOpen(false)
      toast.success("Reverted to previous version")
    } catch (error) {
      console.error('Error reverting version:', error)
      toast.error("Failed to revert version. Please try again.")
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster />
      
      <div className="min-h-screen bg-white flex flex-col dark:bg-neutral-950">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image src="/assets/logo.svg" alt="THRIVE Toolkit Logo" width={24} height={24} />
                <span className="font-semibold">THRIVE Toolkit</span>
              </Link>
              <Link href="/star">
                <h2 className="text-2xl font-bold hover:text-primary transition-colors cursor-pointer">
                  Building Your STAR Bullets
                </h2>
              </Link>
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
                {state.currentStep < steps.length - 1 ? (
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
                        <Sparkles className="mr-2 h-4 w-4" />
                        {state.currentStep === 1 && "Generate Recommendations"}
                        {state.currentStep === 2 && "Generate Bullets"}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSaveExperience}
                    disabled={state.isGenerating}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Save Experience
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

      <Sheet open={isVersionSidebarOpen} onOpenChange={setIsVersionSidebarOpen}>
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>Version History</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-120px)] overflow-y-auto pr-4 mt-4">
            {bulletVersions?.map((version, index) => (
              <div key={`version-${version.id}-${index}`} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col space-y-3 items-start">
                    <span className="font-medium">Version {bulletVersions.length - index}</span>
                    <span 
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        version.metadata?.color
                      )}
                    >
                      {version.metadata?.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(version.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevertVersion(version)}
                  >
                    Revert to this version
                  </Button>
                </div>
                
                <div className="mt-2">
                  <details className="text-sm">
                    <summary className="cursor-pointer hover:text-blue-500">
                      Show content preview
                    </summary>
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      {version.content?.content?.map((bullet: any, i: number) => (
                        <div key={`bullet-${version.id}-${i}`} className="mb-1">
                          {bullet.content?.[0]?.text}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default EditStarBuilder
