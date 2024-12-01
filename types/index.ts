interface Experience {
  id: number
  title: string
  company: string
  type: string
  dateRange: DateRange
  bullets: string[]
  selected: boolean
  gradient: string
  starContent: StarContent
  recommendations: Recommendations
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