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

export type StarContent = {
  situation: string;
  task: string;
  actions: string;
  results: string;
};

export type Example = {
  example1: string;
  example2: string;
};

export type Recommendation = {
  title: string;
  description: string;
  examples: Example[];
};

export type Recommendations = {
  situation?: Recommendation[];
  task?: Recommendation[];
  action?: Recommendation[];
  result?: Recommendation[];
};

export type VersionType = 'work' | 'volunteer' | 'school' | 'all';

export type Position = {
  title: string;
  company: string;
  industry: string;
  description: string;
  createdAt: string;
};

export type StarBuilderState = {
  currentStep: number;
  experienceType: VersionType | null;
  basicInfo: {
    company: string;
    position: string;
    industries: string[];
    dateRange: {
      startDate: string;
      endDate: string;
    };
  };
  starContent: StarContent;
  recommendations: Recommendations;
  activeSection: string;
  lastSaved: string;
}; 