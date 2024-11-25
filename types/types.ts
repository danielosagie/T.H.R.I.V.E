export interface PersonaData {
  id: string;
  name: string;
  summary: string;
  goals: string[];
  nextSteps: string[];
  lifeExperiences: string[];
  qualificationsAndEducation: string[];
  skills: string[];
  strengths: string[];
  valueProposition: string[];
}

export interface Tag {
  id: string;
  text: string;
}

export interface Experience {
  id: number
  title: string
  company: string
  type: 'work' | 'volunteer' | 'school'
  dateRange: {
    startMonth: string
    startYear: string
    endMonth: string
    endYear: string
  }
  bullets: string[]
  starContent: {
    situation: string
    task: string
    actions: string
    results: string
  }
  selected: boolean
  gradient: string
}
