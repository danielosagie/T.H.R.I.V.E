"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface RecommendationProps {
  llmResponse: any
  onGenerateBullets: () => void
}

interface Recommendation {
  title: string
  subtitle: string
  original_content: string
  examples: {
    content: string
    explanation: string
  }[]
}

interface RecommendationSection {
  section: 'situation' | 'task' | 'action' | 'result'
  recommendations: Recommendation[]
}

const sampleData = {
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
    },
    {
      title: "Industry Context",
      subtitle: "Highlight relevant industry trends or challenges",
      original_content: "The market was competitive",
      examples: [
        {
          content: "In the rapidly evolving SaaS industry, where customer acquisition costs had risen by 30% industry-wide over the past year, our company was struggling to maintain profitability while continuing to grow",
          explanation: "Provided specific industry context and quantified the challenge"
        }
      ]
    },
    {
      title: "Temporal Context",
      subtitle: "Specify the timeframe and any relevant external factors",
      original_content: "This happened last year",
      examples: [
        {
          content: "In Q3 2023, amidst global economic uncertainties and a 15% downturn in tech investments, our company found itself at a critical juncture, needing to secure additional funding while improving operational efficiency",
          explanation: "Added specific timeframe and broader economic context"
        }
      ]
    }
  ],
  task: [
    {
      title: "Clear Objective",
      subtitle: "Define your role and goals precisely",
      original_content: "I was asked to improve our financial situation",
      examples: [
        {
          content: "As the newly appointed Financial Operations Manager, I was tasked with reducing our accounts receivable by 30% within 3 months to alleviate our immediate cash flow issues",
          explanation: "Specified the role, quantifiable goal, and timeframe"
        }
      ]
    },
    {
      title: "Scope of Responsibility",
      subtitle: "Clarify the extent of your authority and resources",
      original_content: "I had to work with different teams",
      examples: [
        {
          content: "I was given authority to restructure the finance department, implement new software solutions with a budget of $50,000, and collaborate with Sales and Customer Service teams to revise our client onboarding and billing processes",
          explanation: "Detailed the scope of authority and available resources"
        }
      ]
    },
    {
      title: "Strategic Importance",
      subtitle: "Highlight how your task aligned with broader company goals",
      original_content: "This was important for the company",
      examples: [
        {
          content: "My task was critical to our company's 5-year growth plan, as improving our cash flow would enable us to invest in product development and expand into new markets, potentially doubling our market share by 2025",
          explanation: "Connected the immediate task to long-term company strategy"
        }
      ]
    }
  ],
  action: [
    {
      title: "Detailed Strategy",
      subtitle: "Outline your approach step-by-step",
      original_content: "I implemented new financial processes",
      examples: [
        {
          content: "1. Conducted a comprehensive audit of all outstanding invoices\n2. Developed a tiered follow-up system for overdue payments\n3. Negotiated new payment terms with our top 10 clients\n4. Implemented an automated invoicing and reminder system\n5. Trained the sales team on discussing payment terms upfront",
          explanation: "Broke down the action into specific, chronological steps"
        }
      ]
    },
    {
      title: "Overcoming Challenges",
      subtitle: "Highlight obstacles and your solutions",
      original_content: "There were some difficulties in implementation",
      examples: [
        {
          content: "Initially, we faced resistance from the sales team who feared stricter payment terms would deter clients. To address this, I organized workshops demonstrating how improved cash flow would enable better client services and organized a commission structure tied to timely payments",
          explanation: "Identified a specific challenge and detailed the solution"
        }
      ]
    },
    {
      title: "Collaboration Emphasis",
      subtitle: "Showcase your teamwork and leadership",
      original_content: "I worked with different departments",
      examples: [
        {
          content: "I formed a cross-functional task force with members from Sales, Customer Service, and IT. We held weekly strategy meetings and used a shared dashboard to track progress, fostering a collective sense of ownership in achieving our financial goals",
          explanation: "Highlighted cross-department collaboration and leadership in organizing the effort"
        }
      ]
    },
    {
      title: "Technology Utilization",
      subtitle: "Highlight innovative tools or methods used",
      original_content: "We used some new software",
      examples: [
        {
          content: "Leveraging my background in fintech, I implemented Stripe's advanced invoicing features and integrated it with our CRM. This allowed for real-time payment tracking, automated reminders, and easy online payment options for clients",
          explanation: "Specified the technology used and its direct benefits"
        }
      ]
    },
    {
      title: "Data-Driven Decisions",
      subtitle: "Emphasize use of metrics and analytics",
      original_content: "We made decisions based on some data",
      examples: [
        {
          content: "Using PowerBI, I created daily updated dashboards tracking key metrics like Days Sales Outstanding (DSO) and Collection Effectiveness Index (CEI). This data guided our prioritization of collection efforts and helped identify patterns in late-paying clients",
          explanation: "Showed specific tools and metrics used to inform strategy"
        }
      ]
    },
    {
      title: "Continuous Improvement",
      subtitle: "Demonstrate adaptability and learning",
      original_content: "We made some changes as we went along",
      examples: [
        {
          content: "Through bi-weekly retrospectives, we continuously refined our approach. For instance, after noticing that email reminders were often ignored, we introduced a system of scheduled phone follow-ups, which improved response rates by 40%",
          explanation: "Showed an iterative approach and quantified the improvement"
        }
      ]
    },
    {
      title: "Stakeholder Management",
      subtitle: "Highlight communication with key parties",
      original_content: "I kept people informed about our progress",
      examples: [
        {
          content: "I provided weekly progress reports to the CEO and Board, translating our efforts into projected cash flow improvements. This regular communication ensured continued support for our initiatives and allowed for quick approvals when we needed to adjust our strategy",
          explanation: "Demonstrated regular, high-level communication and its benefits"
        }
      ]
    },
    {
      title: "Personal Development",
      subtitle: "Show how you grew from the experience",
      original_content: "I learned some new things",
      examples: [
        {
          content: "This project pushed me to expand my skills beyond financial analysis. I took an online course in change management and worked closely with our HR director to improve my leadership skills, particularly in motivating teams during challenging periods",
          explanation: "Highlighted personal growth and proactive skill development"
        }
      ]
    }
  ],
  result: [
    {
      title: "Quantifiable Outcomes",
      subtitle: "Provide specific, measurable results",
      original_content: "We improved our financial situation",
      examples: [
        {
          content: "Within 3 months, we reduced our accounts receivable by 35%, exceeding our initial goal. This resulted in an additional $1.2M in available cash, allowing us to pay off a high-interest loan early and saving the company $50,000 in interest payments",
          explanation: "Quantified the main result and its financial impact"
        }
      ]
    },
    {
      title: "Long-term Impact",
      subtitle: "Highlight lasting effects of your actions",
      original_content: "Things got better overall",
      examples: [
        {
          content: "The new processes we implemented became our standard operating procedure, leading to a sustained improvement in our cash conversion cycle from 45 days to 30 days. This enhanced financial stability allowed us to secure a new round of funding at favorable terms, fueling our next phase of growth",
          explanation: "Showed how the immediate results led to long-term benefits"
        }
      ]
    },
    {
      title: "Team and Personal Growth",
      subtitle: "Describe the impact on your team and personal development",
      original_content: "The team learned a lot",
      examples: [
        {
          content: "The success of this project led to a cultural shift in our organization, with a renewed focus on financial discipline. The cross-functional collaboration model we used became a template for future initiatives. Personally, I was promoted to Director of Financial Operations and invited to join the company's leadership team",
          explanation: "Highlighted organizational changes and personal career advancement"
        }
      ]
    },
    {
      title: "Client Relationships",
      subtitle: "Explain how the changes affected client interactions",
      original_content: "Clients were happier",
      examples: [
        {
          content: "Despite initial concerns, our new payment terms and transparent communication actually improved client relationships. Client satisfaction scores increased by 15%, and we saw a 20% increase in referrals from existing clients, contributing to a 10% growth in our client base",
          explanation: "Quantified improvements in client satisfaction and business growth"
        }
      ]
    }
  ]
}

export default function Recommendations({ llmResponse, onGenerateBullets }: RecommendationProps) {
  const [sections, setSections] = useState<RecommendationSection[]>([])
  const [openSections, setOpenSections] = useState<string[]>([])
  const [expandedRecommendations, setExpandedRecommendations] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (llmResponse) {
      parseLLMResponse(llmResponse)
    }
  }, [llmResponse])

  const parseLLMResponse = (response: any) => {
    setIsLoading(true)
    const parsedSections = ['situation', 'task', 'action', 'result'].map(section => ({
      section: section as 'situation' | 'task' | 'action' | 'result',
      recommendations: response[section] || []
    }))
    setSections(parsedSections)

    // Store recommendation counts in localStorage
    parsedSections.forEach(section => {
      localStorage.setItem(`${section.section}_count`, section.recommendations.length.toString())
    })

    // Simulate a delay for the loading animation
    setTimeout(() => setIsLoading(false), 500)
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const toggleRecommendations = (section: string) => {
    setExpandedRecommendations(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const renderRecommendation = (recommendation: Recommendation, index: number, isLast: boolean) => (
    <div key={index} className={`space-y-4 ${!isLast ? 'border-b border-gray-200 pb-4' : ''}`}>
      <div>
        <h4 className="font-medium text-blue-500">{recommendation.title}</h4>
        <p className="text-sm text-muted-foreground">{recommendation.subtitle}</p>
      </div>
      <div className="text-sm">
        <div className="font-medium">Original:</div>
        <div className="text-muted-foreground whitespace-pre-line">
          {recommendation.original_content}
        </div>
      </div>
      <div className="text-sm">
        <div className="font-medium">Examples:</div>
        {recommendation.examples.map((example, exIndex) => (
          <div key={exIndex} className="bg-gray-100 rounded-md p-3 mt-2">
            <p>{example.content}</p>
            <p className="text-blue-500 mt-2">{example.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const handleTestDataClick = () => {
    parseLLMResponse(sampleData)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Review Improvements</h2>
        <Button onClick={handleTestDataClick} variant="outline">
          Load Test Data
        </Button>
      </div>
      <AnimatePresence>
        {!isLoading && (
          <motion.div 
            className="space-y-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {sections.map((section, index) => (
              <motion.div
                key={section.section}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
                }}
              >
                <Card className="overflow-hidden">
                  <Collapsible
                    open={openSections.includes(section.section)}
                    onOpenChange={() => toggleSection(section.section)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <CardContent className="p-6">
                        <div className="flex items-center w-full">
                          <Sparkles className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <div className="w-px h-12 bg-blue-500 mx-3"></div>
                          <div className="flex-grow space-y-1">
                            <div className="text-left">
                              <span className="text-blue-500 font-medium">{section.section.charAt(0).toUpperCase() + section.section.slice(1)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground text-left">
                              {section.recommendations.length} recommendations available
                            </p>
                          </div>
                          <div  className="flex-shrink-0">
                            {openSections.includes(section.section) ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="px-6 pb-6 pt-0">
                        <div className="space-y-4 ml-11">
                          {section.recommendations.slice(0, 2).map((recommendation, index) => 
                            renderRecommendation(recommendation, index, index === 1 && section.recommendations.length <= 2)
                          )}
                          {section.recommendations.length > 2 && (
                            <>
                              <Button 
                                variant="outline" 
                                onClick={() => toggleRecommendations(section.section)}
                                className="w-full mt-4"
                              >
                                {expandedRecommendations[section.section] 
                                  ? 'Close remaining recommendations' 
                                  : `Show other ${section.recommendations.length - 2} recommendations`}
                              </Button>
                              {expandedRecommendations[section.section] && (
                                <div className="space-y-4 mt-4">
                                  {section.recommendations.slice(2).map((recommendation, index) => 
                                    renderRecommendation(recommendation, index + 2, index === section.recommendations.length - 3)
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <Button onClick={onGenerateBullets}>
        Generate Bullets
      </Button>
    </div>
  )
}