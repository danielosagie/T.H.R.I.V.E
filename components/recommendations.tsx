"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { RecommendationsSkeleton } from "./recommendations-skeleton"

interface RecommendationsProps {
  llmResponse: any;
  onGenerateBullets: () => void;
  isLoading?: boolean;
}

export default function Recommendations({ llmResponse, onGenerateBullets, isLoading = false }: RecommendationsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Handle hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (isLoading) {
    return <RecommendationsSkeleton />
  }

  if (!llmResponse) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI Recommendations</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost">
                  {isOpen ? "Show Less" : "Show More"}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-4">
              <div className="space-y-4">
                {Object.entries(llmResponse).map(([section, recommendations]) => (
                  <div key={section} className="space-y-2">
                    <h4 className="font-medium capitalize">{section}</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {Array.isArray(recommendations) && recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600">{rec}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={onGenerateBullets}>
          Generate Bullets
        </Button>
      </div>
    </div>
  )
}