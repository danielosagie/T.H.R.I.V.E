export interface PersonaData {
  id: string
  name: string
  summary: string
  qualificationsAndEducation: { main: string; detail1?: string; detail2?: string }[]
  skills: { main: string; detail1?: string; detail2?: string }[]
  goals: { main: string; detail1?: string; detail2?: string }[]
  strengths: { main: string; detail1?: string; detail2?: string }[]
  lifeExperiences: { main: string; detail1?: string; detail2?: string }[]
  valueProposition: { main: string; detail1?: string; detail2?: string }[]
  nextSteps: { main: string; detail1?: string; detail2?: string }[]
  timestamp: number
}
