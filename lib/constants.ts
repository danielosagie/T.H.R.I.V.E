export const initialState: StarBuilderState = {
  currentStep: 0,
  experienceType: null,
  basicInfo: {
    company: '',
    position: '',
    industries: [],
    dateRange: {
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: ''
    }
  },
  starContent: {
    situation: '',
    task: '',
    actions: '',
    results: '',
    company: '',
    position: ''
  },
  recommendations: {
    situation: [],
    task: [],
    action: [],
    result: []
  },
  generatedBullets: [],
  activeSection: 'situation',
  isGenerating: false,
  lastSaved: ''
} 