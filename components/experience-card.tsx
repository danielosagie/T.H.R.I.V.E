'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Header } from './header'
import { ControlBar } from './control-bar'
import { Section } from './section'
import { Tag } from './tag'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, XIcon } from 'lucide-react'

interface ExperienceCardData {
  name: string
  summary: string
  goals: string[]
  nextSteps: string[]
  lifeExperiences: string[]
  qualificationsAndEducation: string[]
  skills: string[]
  strengths: string[]
  valueProposition: string[]
}

const emptyData: ExperienceCardData = {
  name: "",
  summary: "",
  goals: [],
  nextSteps: [],
  lifeExperiences: [],
  qualificationsAndEducation: [],
  skills: [],
  strengths: [],
  valueProposition: []
}

const API_URL = 'https://tcard-vercel.onrender.com'

interface ExperienceCardProps {
  initialData?: ExperienceCardData
}

export function ExperienceCard({ initialData }: ExperienceCardProps) {
  const [mode, setMode] = useState<'edit' | 'view'>('view')
  const [format, setFormat] = useState<'card' | 'bullet'>('card')
  const [lastAutoSave, setLastAutoSave] = useState<string | null>(null)
  const [data, setData] = useState<ExperienceCardData>(initialData || emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialData) {
      setError('No data available');
      setLoading(false);
      return;
    }

    const storedData = localStorage.getItem('experienceCardData')
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setData(parsedData)
        setLastAutoSave(localStorage.getItem('lastAutoSave'))
        setLoading(false)
      } catch (err) {
        console.error('Error parsing stored data:', err)
        fetchData()
      }
    } else {
      fetchData()
    }
  }, [initialData])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('experienceCardData', JSON.stringify(data))
      const currentTime = new Date().toLocaleTimeString()
      localStorage.setItem('lastAutoSave', currentTime)
      setLastAutoSave(currentTime)
    }
  }, [data, loading])

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_all_personas`)
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const latestPersona = response.data[response.data.length - 1]
        setData(latestPersona)
      } else {
        setData(emptyData)
      }
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again later.')
      setData(emptyData)
      setLoading(false)
    }
  }

  const handleModeChange = (newMode: 'edit' | 'view') => {
    setMode(newMode)
  }

  const handleFormatChange = (newFormat: 'card' | 'bullet') => {
    setFormat(newFormat)
  }

  const handleExport = () => {
    console.log("Exporting...")
    // Implement export functionality here
  }

  const handleDataChange = (section: keyof ExperienceCardData, value: string | string[]) => {
    setData(prevData => ({ ...prevData, [section]: value }))
  }

  const handleAddTag = (section: keyof ExperienceCardData) => {
    setData(prevData => ({
      ...prevData,
      [section]: Array.isArray(prevData[section]) ? [...prevData[section], ''] : ['']
    }))
  }

  const handleRemoveTag = (section: keyof ExperienceCardData, index: number) => {
    setData(prevData => ({
      ...prevData,
      [section]: Array.isArray(prevData[section]) 
        ? prevData[section].filter((_, i) => i !== index)
        : []
    }))
  }

  const handleTagChange = (section: keyof ExperienceCardData, index: number, value: string) => {
    setData(prevData => ({
      ...prevData,
      [section]: Array.isArray(prevData[section])
        ? prevData[section].map((item, i) => i === index ? value : item)
        : [value]
    }))
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  const renderViewSection = (title: string, content: string | string[]) => (
    <Section title={title}>
      {Array.isArray(content) ? (
        content.length > 0 ? (
          content.map((item, index) => <Tag key={index}>{item}</Tag>)
        ) : (
          <p className="text-neutral-400">{`Your ${typeof title === 'string' ? title.toLowerCase() : 'content'} will appear here.`}</p>
        )
      ) : (
        <p className="text-neutral-300">{content || `Your ${typeof title === 'string' ? title.toLowerCase() : 'content'} will appear here.`}</p>
      )}
    </Section>
  )

  const renderEditCardSection = (title: string, section: keyof ExperienceCardData, content: string | string[]) => (
    <Section title={title}>
      {Array.isArray(content) ? (
        <>
          {content.map((item, index) => (
            <div key={index} className="flex items-center mb-2 group">
              <Input
                value={item}
                onChange={(e) => handleTagChange(section, index, e.target.value)}
                className="mr-2"
                style={{ width: `${Math.max(10, item.length)}ch` }}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveTag(section, index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAddTag(section)}
            className={content.length === 0 ? "" : "opacity-0 hover:opacity-100 transition-opacity"}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add {title}
          </Button>
        </>
      ) : (
        <Input
          value={content}
          onChange={(e) => handleDataChange(section, e.target.value)}
          style={{ width: `${Math.max(10, (content || '').length)}ch` }}
        />
      )}
    </Section>
  )

  const renderEditBulletSection = (title: string, section: keyof ExperienceCardData, content: string | string[]) => (
    <Section title={title}>
      <Textarea
        value={Array.isArray(content) ? content.join('\n') : content}
        onChange={(e) => handleDataChange(section, e.target.value.split('\n'))}
        className="min-h-[100px]"
      />
    </Section>
  )

  const renderContent = () => {
    if (mode === 'view') {
      return (
        <>
          <div>
            {renderViewSection(data.name || "Your Name", data.summary)}
            {renderViewSection("Goals", data.goals || [])}
            {renderViewSection("Next Steps", data.nextSteps || [])}
            {renderViewSection("Life Experiences", data.lifeExperiences || [])}
          </div>
          <div>
            {renderViewSection("Qualifications and Education", data.qualificationsAndEducation || [])}
            {renderViewSection("Skills", data.skills || [])}
            {renderViewSection("Strengths", data.strengths || [])}
            {renderViewSection("Value Proposition", data.valueProposition || [])}
          </div>
        </>
      )
    } else if (mode === 'edit' && format === 'card') {
      return (
        <>
          <div>
            {renderEditCardSection("Name", "name", data.name)}
            {renderEditCardSection("Summary", "summary", data.summary)}
            {renderEditCardSection("Goals", "goals", data.goals || [])}
            {renderEditCardSection("Next Steps", "nextSteps", data.nextSteps || [])}
            {renderEditCardSection("Life Experiences", "lifeExperiences", data.lifeExperiences || [])}
          </div>
          <div>
            {renderEditCardSection("Qualifications and Education", "qualificationsAndEducation", data.qualificationsAndEducation || [])}
            {renderEditCardSection("Skills", "skills", data.skills || [])}
            {renderEditCardSection("Strengths", "strengths", data.strengths || [])}
            {renderEditCardSection("Value Proposition", "valueProposition", data.valueProposition || [])}
          </div>
        </>
      )
    } else {
      return (
        <div className="col-span-2">
          {renderEditBulletSection("Name", "name", data.name)}
          {renderEditBulletSection("Summary", "summary", data.summary)}
          {renderEditBulletSection("Goals", "goals", data.goals || [])}
          {renderEditBulletSection("Next Steps", "nextSteps", data.nextSteps || [])}
          {renderEditBulletSection("Life Experiences", "lifeExperiences", data.lifeExperiences || [])}
          {renderEditBulletSection("Qualifications and Education", "qualificationsAndEducation", data.qualificationsAndEducation || [])}
          {renderEditBulletSection("Skills", "skills", data.skills || [])}
          {renderEditBulletSection("Strengths", "strengths", data.strengths || [])}
          {renderEditBulletSection("Value Proposition", "valueProposition", data.valueProposition || [])}
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        lastAutoSave={lastAutoSave || ''}
        onExport={handleExport}
      />
      <ControlBar
        format={format}
        onFormatChange={handleFormatChange}
      />
      <div className="bg-neutral-900 p-6 rounded-lg shadow">
        <div className={`grid ${format === 'card' || mode === 'view' ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
