interface Experience {
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
  selected: boolean
  gradient: string
  starContent?: StarContent
  recommendations?: Recommendations
}

interface BulletVersion {
  id: number
  content: any
  timestamp: string
  type: VersionType
  metadata: {
    type: string
    label: string
    color: string
  }
} 