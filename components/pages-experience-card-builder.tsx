'use client'

import React, { useState, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from 'next/image'
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { generatePersona } from '../lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tcard-vercel.onrender.com';

const steps = [
  { title: "Introduction", description: "Getting to know you" },
  { title: "Education and Skills", description: "Share your education and skills" },
  { title: "Experience", description: "Reflect on your experiences" },
  { title: "Your Preferences", description: "Consider your preferences" },
  { title: "Review", description: "Review and generate your card" },
  { title: "Generate Card", description: "Creating your Experience Card" }, // Keep this for visual purposes only
]

interface FormData {
  firstName: string;
  lastName: string;
  ageRange: string;
  careerJourney: string[];
  otherCareerJourney: string;
  careerGoals: string;
  education: string;
  fieldOfStudy: string[];
  otherFieldOfStudy: string;
  additionalTraining: string;
  technicalSkills: string;
  creativeSkills: string;
  otherSkills: string;
  workExperiences: string;
  volunteerExperiences: string;
  militaryLifeExperiences: string;
  transportation: string;
  driveDistance: string;
  militaryBase: string;
  childcare: string;
  childcareCost: string;
  childcareDistance: string;
  relocation: string;
  workPreference: string;
  workSchedule: string;
  workHours: string;
  regularCommitments: string;
  stressManagement: string;
  strugglingResources: string[];
  otherStrugglingResource: string;
  additionalInformation: string;
  stayDuration: string;
  [key: string]: string | string[];
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  ageRange: "",
  careerJourney: [],
  otherCareerJourney: "",
  careerGoals: "",
  education: "",
  fieldOfStudy: [],
  otherFieldOfStudy: "",
  additionalTraining: "",
  technicalSkills: "",
  creativeSkills: "",
  otherSkills: "",
  workExperiences: "",
  volunteerExperiences: "",
  militaryLifeExperiences: "",
  transportation: "",
  driveDistance: "",
  militaryBase: "",
  childcare: "",
  childcareCost: "",
  childcareDistance: "",
  relocation: "",
  workPreference: "",
  workSchedule: "",
  workHours: "",
  regularCommitments: "",
  stressManagement: "",
  strugglingResources: [],
  otherStrugglingResource: "",
  additionalInformation: "",
  stayDuration: "",
}

interface ExperienceCardBuilderProps {
  onCardCreated: (newCardId: string) => void
}

export function ExperienceCardBuilderComponent({ onCardCreated }: ExperienceCardBuilderProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useLocalStorage<FormData>('experienceCardFormData', initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('experienceCardData', JSON.stringify(formData))
    }
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData: FormData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: FormData) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: checked
        ? [...((prev[name] as string[]) || []), value]
        : ((prev[name] as string[]) || []).filter((item: string) => item !== value)
    }))
  }

  const handleGenerateCard = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(item => formDataToSend.append(`${key}[]`, item))
        } else {
          formDataToSend.append(key, value)
        }
      })

      const response = await axios.post(`${API_URL}/generate_persona_stream`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: false
      })
      console.log("Response received:", response.data)
      if (response.data.error) {
        throw new Error(response.data.error)
      }
      const newPersona = {
        ...response.data.persona,
        id: Date.now().toString(), // Add this line to generate a unique ID
      }

      // Save the new persona to localStorage
      const storedPersonas = localStorage.getItem('personas')
      const parsedPersonas = storedPersonas ? JSON.parse(storedPersonas) : []
      const updatedPersonas = [newPersona, ...parsedPersonas]
      localStorage.setItem('personas', JSON.stringify(updatedPersonas))

      // Call the onCardCreated prop with the new card ID
      if (onCardCreated && typeof onCardCreated === 'function') {
        onCardCreated(newPersona.id)
      } else {
        console.error('onCardCreated is not a function or is undefined')
        // Fallback to direct navigation if onCardCreated is not available
        router.push(`/view?newCardId=${newPersona.id}`)
      }

      // Clear the form data from localStorage
      localStorage.removeItem('experienceCardFormData')

    } catch (error: unknown) {
      console.error("Error generating persona:", error);
      
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data: any; 
            status: number; 
            headers: any; 
          } 
        };
        
        if (axiosError.response) {
          console.error("Response data:", axiosError.response.data);
          console.error("Response status:", axiosError.response.status);
          console.error("Response headers:", axiosError.response.headers);
        }
      }
      
      // Handle the error appropriately (e.g., show an error message to the user)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 2) { // Change this to -2 to make Review the last interactive step
      setCurrentStep(prev => prev + 1)
    } else {
      handleGenerateCard()
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">1. Getting to know you</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ageRange">Which age range do you fit into? *</Label>
              <Select onValueChange={(value) => handleSelectChange("ageRange", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18-24">18-24</SelectItem>
                  <SelectItem value="25-34">25-34</SelectItem>
                  <SelectItem value="35-44">35-44</SelectItem>
                  <SelectItem value="45+">45+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Where are you in your career or employment journey? * Select all that apply.</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {["Actively job searching", "Exploring a new career", "Re-starting my career", "Finding out who I am", "Other"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={formData.careerJourney?.includes(option)}
                      onCheckedChange={(checked) => handleCheckboxChange("careerJourney", option, checked as boolean)}
                    />
                    <label
                      htmlFor={option}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              {formData.careerJourney?.includes("Other") && (
                <Input
                  className="mt-2"
                  placeholder="Please specify"
                  name="otherCareerJourney"
                  value={formData.otherCareerJourney}
                  onChange={handleInputChange}
                />
              )}
            </div>
            <div>
              <Label htmlFor="careerGoals">What are your current career goals? List any positions and/or industries you are interested in.</Label>
              <Textarea
                id="careerGoals"
                name="careerGoals"
                value={formData.careerGoals}
                onChange={handleInputChange}
                placeholder="Start a career as a project manager in the manufacturing & healthcare industries"
                className="min-h-[100px]"
              />
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">2. Share your education and skills</h2>
            <div>
              <Label htmlFor="education">What is the highest degree you&apos;ve completed?</Label>
              <Select onValueChange={(value) => handleSelectChange("education", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="associate">Associate&apos;s Degree</SelectItem>
                  <SelectItem value="bachelor">Bachelor&apos;s Degree</SelectItem>
                  <SelectItem value="master">Master&apos;s Degree</SelectItem>
                  <SelectItem value="doctorate">Doctorate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>What did you study? (You can choose more than one.)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {["General Studies", "Business", "Computer Science", "Engineering", "Healthcare", "Education", "Arts", "Other"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={formData.fieldOfStudy?.includes(option)}
                      onCheckedChange={(checked) => handleCheckboxChange("fieldOfStudy", option, checked as boolean)}
                    />
                    <label
                      htmlFor={option}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              {formData.fieldOfStudy?.includes("Other") && (
                <Input
                  className="mt-2"
                  placeholder="Please specify"
                  name="otherFieldOfStudy"
                  value={formData.otherFieldOfStudy}
                  onChange={handleInputChange}
                />
              )}
            </div>
            <div>
              <Label htmlFor="additionalTraining">Have you received any additional training or certifications?</Label>
              <Textarea
                id="additionalTraining"
                name="additionalTraining"
                value={formData.additionalTraining}
                onChange={handleInputChange}
                placeholder="Online courses, workshops, certifications"
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="technicalSkills">What are your strongest technical skills?</Label>
              <Textarea
                id="technicalSkills"
                name="technicalSkills"
                value={formData.technicalSkills}
                onChange={handleInputChange}
                placeholder="Think about areas like coding, data analysis, IT support, etc."
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="creativeSkills">What creative skills do you enjoy using?</Label>
              <Textarea
                id="creativeSkills"
                name="creativeSkills"
                value={formData.creativeSkills}
                onChange={handleInputChange}
                placeholder="Graphic design, writing, video editing, etc."
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="otherSkills">Are there any other skills you&apos;re proud of?</Label>
              <Textarea
                id="otherSkills"
                name="otherSkills"
                value={formData.otherSkills}
                onChange={handleInputChange}
                placeholder="Feel free to list anything else you excel at!"
                className="min-h-[100px]"
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">3. Reflect on your experiences</h2>
            <div>
              <Label htmlFor="workExperiences">Work Experiences</Label>
              <Textarea
                id="workExperiences"
                name="workExperiences"
                value={formData.workExperiences}
                onChange={handleInputChange}
                placeholder="Think about jobs you've had and what you accomplished. EX - 'At J&D Architects, I was the first designer hired onto a new team for the company. I was tasked with designing a new urban store design. I hosted workshops to brainstorm and ideate ideas within our requirements. Created 3 different sized master blueprints of store designs that was approved by CEO'"
                className="min-h-[150px]"
              />
            </div>
            <div>
              <Label htmlFor="volunteerExperiences">Volunteer Experiences</Label>
              <Textarea
                id="volunteerExperiences"
                name="volunteerExperiences"
                value={formData.volunteerExperiences}
                onChange={handleInputChange}
                placeholder="Think about any volunteer work you've done and the impact you made. EX - 'As a volunteer for Red Cross, I organized disaster relief efforts in my local community, coordinating resources and leading a team of 20 volunteers.'"
                className="min-h-[150px]"
              />
            </div>
            <div>
              <Label htmlFor="militaryLifeExperiences">Military Life Experiences</Label>
              <Textarea
                id="militaryLifeExperiences"
                name="militaryLifeExperiences"
                value={formData.militaryLifeExperiences}
                onChange={handleInputChange}
                placeholder="Reflect on your military experience—both formal duties and informal roles. EX - During my spouse's deployment, I managed the household budget, coordinated three cross-country moves, and provided support to other military spouses through organizing family readiness group events."
                className="min-h-[150px]"
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">4. Consider your preferences</h2>
            <p className="text-gray-600">Outline what you need or prefer in a job to help it fit with your life. This could include preferred work hours, preferences for remote or flexible work, any relocation plans, transportation needs, childcare requirements, and more.</p>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Transportation</h3>
              <div>
                <Label>Do you currently have access to a car or reliable transportation?</Label>
                <RadioGroup onValueChange={(value) => handleSelectChange("transportation", value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="transportation-yes" />
                    <Label htmlFor="transportation-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="transportation-no" />
                    <Label htmlFor="transportation-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
              {formData.transportation === "yes" && (
                <div>
                  <Label htmlFor="driveDistance">If yes, how far away would you be willing to drive to work?</Label>
                  
                  <Input
                    id="driveDistance"
                    name="driveDistance"
                    value={formData.driveDistance}
                    onChange={handleInputChange}
                    placeholder="30 minutes..."
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Relocation</h3>
              <div>
                <Label htmlFor="stayDuration">How long do you plan on staying in this area?</Label>
                <Input
                  id="stayDuration"
                  name="stayDuration"
                  value={formData.stayDuration}
                  onChange={handleInputChange}
                  placeholder="e.g., 3 years"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Schedule/Other</h3>
              <div>
                <Label htmlFor="workPreference">Which type of work do you prefer?</Label>
                <Select onValueChange={(value) => handleSelectChange("workPreference", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote preferred</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="on-site">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="workSchedule">What type of work schedule do you prefer?</Label>
                <Select onValueChange={(value) => handleSelectChange("workSchedule", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="workHours">How many hours per week would you ideally like to work?</Label>
                <Input
                  id="workHours"
                  name="workHours"
                  value={formData.workHours}
                  onChange={handleInputChange}
                  placeholder="e.g., 20-30 hours"
                />
              </div>
            </div>
          </div>
        )
      case 4: // Review step
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">5. Review and generate your card</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="personal-info">
                <AccordionTrigger>Personal Information</AccordionTrigger>
                <AccordionContent>
                  <p>First Name: {formData.firstName}</p>
                  <p>Last Name: {formData.lastName}</p>
                  <p>Age Range: {formData.ageRange}</p>
                  <p>Career Journey: {formData.careerJourney?.join(", ")}</p>
                  {formData.careerJourney?.includes("Other") && <p>Other Career Journey: {formData.otherCareerJourney}</p>}
                  <p>Career Goals: {formData.careerGoals}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="education-skills">
                <AccordionTrigger>Education and Skills</AccordionTrigger>
                <AccordionContent>
                  <p>Highest Education: {formData.education}</p>
                  <p>Field of Study: {formData.fieldOfStudy?.join(", ")}</p>
                  {formData.fieldOfStudy?.includes("Other") && <p>Other Field of Study: {formData.otherFieldOfStudy}</p>}
                  <p>Additional Training: {formData.additionalTraining}</p>
                  <p>Technical Skills: {formData.technicalSkills}</p>
                  <p>Creative Skills: {formData.creativeSkills}</p>
                  <p>Other Skills: {formData.otherSkills}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="experiences">
                <AccordionTrigger>Experiences</AccordionTrigger>
                <AccordionContent>
                  <p>Work Experiences: {formData.workExperiences}</p>
                  <p>Volunteer Experiences: {formData.volunteerExperiences}</p>
                  <p>Military Life Experiences: {formData.militaryLifeExperiences}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="preferences">
                <AccordionTrigger>Preferences</AccordionTrigger>
                <AccordionContent>
                  <p>Transportation: {formData.transportation}</p>
                  <p>Drive Distance: {formData.driveDistance}</p>
                  <p>Stay Duration: {formData.stayDuration}</p>
                  <p>Work Preference: {formData.workPreference}</p>
                  <p>Work Schedule: {formData.workSchedule}</p>
                  <p>Work Hours: {formData.workHours}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div>
              <Label htmlFor="additionalInformation">Is there anything else you would like to add?</Label>
              <Textarea
                id="additionalInformation"
                name="additionalInformation"
                value={formData.additionalInformation}
                onChange={handleInputChange}
                placeholder="Add any additional information you&apos;d like us to know"
                className="min-h-[100px]"
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center">
              <Image src="/assets/logo.svg" alt="THRIVE Toolkit Logo" width={20} height={20} className="sm:w-6 sm:h-6" />
              <h1 className="text-sm sm:text-xl font-bold ml-2">THRIVE Toolkit</h1>
            </Link>
            <h2 className="text-lg sm:text-2xl font-bold text-center">Building Your Experience Card</h2>
            <div className="w-[100px] sm:w-[200px]"></div> {/* Spacer for alignment */}
          </div>
          
          {/* Mobile stepper */}
          <div className="sm:hidden flex justify-between items-center mt-4">
            <Button onClick={handleBack} disabled={currentStep === 0} size="sm">Back</Button>
            <div className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</div>
            <Button onClick={handleNext} size="sm">
              {currentStep === steps.length - 2 ? "Generate" : "Next"}
            </Button>
          </div>

          {/* Desktop stepper */}
          <div className="hidden sm:flex justify-between mt-4 px-8">
            {steps.map((step, index) => (
              <div key={index} className={`text-center ${index === currentStep ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                <div className="text-sm">{step.title}</div>
                <div className="mt-2 h-1 bg-muted">
                  <div 
                    className={`h-full bg-primary transition-all duration-300 ease-in-out ${
                      index <= currentStep ? 'w-full' : 'w-0'
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
          {renderStep()}
          <div className="mt-8 flex justify-start space-x-4">
            <Button onClick={handleBack} disabled={currentStep === 0}>Back</Button>
            <Button onClick={handleNext} disabled={isLoading}>
              {isLoading ? 'Generating...' : currentStep === steps.length - 2 ? "Generate Card" : "Continue"}
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-neutral-500">
            Designed by Georgia Tech Research Institute
          </div>
          <div className="text-neutral-500">
            <Link href="/about" className="mr-4">About</Link>
            <Link href="/feedback">Feedback</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
