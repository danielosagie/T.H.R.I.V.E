"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { RecommendationsSkeleton } from "./recommendations-skeleton"

interface Example {
  example1: string
  example2: string
}

interface Recommendation {
  title: string
  subtitle: string
  original_content: string
  examples: Example[]
}

interface SectionRecommendationsProps {
  section: 'situation' | 'task' | 'action' | 'result'
  recommendations: Recommendation[] | undefined
  isLoading?: boolean
}

export function SectionRecommendations({ 
  section,
  recommendations = [],
  isLoading = false
}: SectionRecommendationsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [expandedRecommendations, setExpandedRecommendations] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const renderRecommendation = (recommendation: Recommendation, index: number, isLast: boolean) => (
    <div key={index} className={`space-y-4 ${!isLast ? 'border-b border-gray-200 pb-4' : ''}`}>
      <div>
        <h4 className="font-medium text-blue-500">{recommendation.title}</h4>
        <p className="text-sm text-muted-foreground">{recommendation.subtitle}</p>
      </div>
      {recommendation.original_content && (
        <div className="text-sm">
          <div className="font-medium">Original:</div>
          <div className="text-muted-foreground whitespace-pre-line">
            {recommendation.original_content}
          </div>
        </div>
      )}
      {recommendation.examples?.length > 0 && (
        <div className="text-sm">
          <div className="font-medium">Examples:</div>
          {recommendation.examples.map((example, exIndex) => (
            <div key={exIndex} className="space-y-2">
              <div className="bg-gray-100 rounded-md p-3 mt-2">
                <div dangerouslySetInnerHTML={{ 
                  __html: (example?.example1 || '')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\((.*?)\)\.?/g, '<span class="text-blue-500">($1)</span>')
                }} />
              </div>
              <div className="bg-gray-100 rounded-md p-3 mt-2">
                <div dangerouslySetInnerHTML={{ 
                  __html: (example?.example2 || '')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\((.*?)\)\.?/g, '<span class="text-blue-500">($1)</span>')
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (!mounted) return null
  if (isLoading) return <RecommendationsSkeleton />
  if (!recommendations?.length) return null

  return (
    <AnimatePresence>
      <motion.div
        className="space-y-4"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
        }}
      >
        <Card className="overflow-hidden">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full">
              <CardContent className="p-6">
                <div className="flex items-center w-full">
                  <Sparkles className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div className="w-px h-12 bg-blue-500 mx-3"></div>
                  <div className="flex-grow space-y-1">
                    <div className="text-left">
                      <span className="text-blue-500 font-medium">
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground text-left">
                      {recommendations.length} recommendations available
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {isOpen ? (
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
                  {recommendations.slice(0, 2).map((recommendation, index) => 
                    renderRecommendation(recommendation, index, index === 1 && recommendations.length <= 2)
                  )}
                  {recommendations.length > 2 && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => setExpandedRecommendations(!expandedRecommendations)}
                        className="w-full mt-4"
                      >
                        {expandedRecommendations 
                          ? 'Close remaining recommendations' 
                          : `Show other ${recommendations.length - 2} recommendations`}
                      </Button>
                      {expandedRecommendations && (
                        <div className="space-y-4 mt-4">
                          {recommendations.slice(2).map((recommendation, index) => 
                            renderRecommendation(
                              recommendation, 
                              index + 2, 
                              index === recommendations.length - 3
                            )
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
    </AnimatePresence>
  )
}
