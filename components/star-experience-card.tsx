"use client"

import React from "react"
import { Section } from './section'

interface StarExperienceCardProps {
  experiences: Array<{
    id: number
    title: string
    company: string
    type: 'work' | 'volunteer' | 'school'
    dateRange: {
      startMonth: string
      startYear: string
      endMonth?: string
      endYear?: string
    }
    bullets: string[]
    selected?: boolean
  }>
}

export function StarExperienceCard({ experiences }: StarExperienceCardProps) {
  const formatDate = (dateRange: { startMonth: string; startYear: string; endMonth?: string; endYear?: string }) => {
    return `${dateRange.startMonth} ${dateRange.startYear} - ${
      dateRange.endMonth && dateRange.endYear ? 
      `${dateRange.endMonth} ${dateRange.endYear}` : 
      'Present'
    }`
  }

  // Group experiences by type
  const groupedExperiences = experiences.reduce((acc, exp, index) => {
    const typeMap = {
      work: 'Work Experience',
      volunteer: 'Volunteer Experience',
      school: 'Academic Experience'
    }
    
    if (!acc[exp.type]) {
      acc[exp.type] = {
        title: typeMap[exp.type],
        items: []
      }
    }
    acc[exp.type].items.push({ ...exp, index: index + 1 })
    return acc
  }, {} as Record<string, { title: string; items: Array<any> }>)

  return (
    <div className="bg-[#272B32] p-4 sm:p-6 rounded-lg shadow">
      {Object.values(groupedExperiences).map((group, groupIndex) => (
        <Section key={groupIndex} title={`${group.title}`}>
          <div className="text-white space-y-6">
            {group.items.map((exp, index) => (
              <div key={exp.id} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h2 className="text-2xl font-bold">{exp.title}</h2>
                    <h3 className="text-xl">{exp.company}</h3>
                  </div>
                  <span className="text-sm text-gray-300">{formatDate(exp.dateRange)}</span>
                </div>
                <ul className="list-disc list-inside space-y-2">
                  {exp.bullets.map((bullet, idx) => (
                    <li key={idx} className="text-white">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  )
}
