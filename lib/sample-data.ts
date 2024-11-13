const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const allSituationRecommendations = [
  {
    title: "Specificity in Context",
    subtitle: "Add detailed background information",
    original_content: "Our company was facing challenges",
    examples: [{
      content: "Our mid-sized tech startup (50 employees, $5M revenue) faced a critical cash flow crisis due to rapid expansion",
      explanation: "Added company size, revenue, and specific challenge"
    }]
  },
  {
    title: "Timeline Context",
    subtitle: "Include relevant timeframes",
    original_content: "Last year we had issues",
    examples: [{
      content: "In Q3 2023, during a market downturn that affected 70% of tech startups",
      explanation: "Added specific timeframe and market context"
    }]
  },
  {
    title: "Industry Impact",
    subtitle: "Highlight industry-specific challenges",
    original_content: "The market was tough",
    examples: [{
      content: "Amid a 30% industry-wide increase in customer acquisition costs in the SaaS sector",
      explanation: "Added quantified industry challenge"
    }]
  },
  {
    title: "Scale of Challenge",
    subtitle: "Quantify the situation",
    original_content: "We were losing customers",
    examples: [{
      content: "Facing a 25% monthly customer churn rate, double the industry average",
      explanation: "Added specific metrics and comparison"
    }]
  },
  {
    title: "Stakeholder Impact",
    subtitle: "Show broader impact",
    original_content: "It affected many people",
    examples: [{
      content: "The situation impacted 3 key departments and 15 client accounts worth $2M annually",
      explanation: "Added specific scope and value"
    }]
  },
  {
    title: "Resource Context",
    subtitle: "Describe available resources",
    original_content: "We had limited resources",
    examples: [{
      content: "Working with a reduced team of 5 and a 40% smaller budget of $100K",
      explanation: "Added specific resource constraints"
    }]
  }
]

const allTaskRecommendations = [
  {
    title: "Role Clarity",
    subtitle: "Define your specific responsibility",
    original_content: "I needed to fix the problem",
    examples: [{
      content: "As Senior Project Manager, I was tasked with reducing project delivery delays by 50% within 6 months",
      explanation: "Added role title, specific goal, and timeline"
    }]
  },
  {
    title: "Scope Definition",
    subtitle: "Outline project parameters",
    original_content: "I had to manage the project",
    examples: [{
      content: "Led a cross-functional team of 12 members to implement a new agile workflow system across 5 departments",
      explanation: "Added team size, methodology, and scope"
    }]
  },
  {
    title: "Success Metrics",
    subtitle: "Define measurable objectives",
    original_content: "We needed better results",
    examples: [{
      content: "Tasked with achieving 98% on-time delivery while reducing operational costs by 20%",
      explanation: "Added specific performance targets"
    }]
  },
  {
    title: "Stakeholder Goals",
    subtitle: "Align with organizational objectives",
    original_content: "Management wanted improvements",
    examples: [{
      content: "Assigned to align project delivery with C-suite's Q4 goal of entering 3 new market segments",
      explanation: "Added leadership context and business goals"
    }]
  },
  {
    title: "Resource Allocation",
    subtitle: "Define available resources",
    original_content: "I had a team to work with",
    examples: [{
      content: "Given a $500K budget and authority to restructure the 15-person delivery team",
      explanation: "Added budget and team size details"
    }]
  }
]

const allActionRecommendations = [
  {
    title: "Strategic Planning",
    subtitle: "Detail your approach",
    original_content: "I made a plan",
    examples: [{
      content: "Conducted a 2-week audit of existing processes, identifying 7 critical bottlenecks causing 60% of delays",
      explanation: "Added timeframe, methodology, and findings"
    }]
  },
  {
    title: "Implementation Steps",
    subtitle: "Break down key actions",
    original_content: "We changed the process",
    examples: [{
      content: "Implemented daily stand-ups, bi-weekly retrospectives, and automated 40% of status reporting",
      explanation: "Added specific process changes and automation metrics"
    }]
  },
  {
    title: "Team Leadership",
    subtitle: "Highlight management approach",
    original_content: "I led the team",
    examples: [{
      content: "Mentored 3 team leads, delegated key responsibilities, and established weekly performance metrics",
      explanation: "Added leadership activities and measurement systems"
    }]
  },
  {
    title: "Innovation",
    subtitle: "Showcase creative solutions",
    original_content: "I found new ways to work",
    examples: [{
      content: "Developed custom Slack integration that reduced communication delays by 75%",
      explanation: "Added specific innovation and impact"
    }]
  },
  {
    title: "Stakeholder Management",
    subtitle: "Detail communication strategy",
    original_content: "I kept everyone informed",
    examples: [{
      content: "Established bi-weekly executive updates and daily stakeholder dashboards, reaching 200+ team members",
      explanation: "Added communication frequency and reach"
    }]
  }
]

const allResultRecommendations = [
  {
    title: "Quantifiable Impact",
    subtitle: "Measure primary outcomes",
    original_content: "The project was successful",
    examples: [{
      content: "Achieved 95% on-time delivery rate, exceeding target by 15% and saving $300K annually",
      explanation: "Added specific metrics and financial impact"
    }]
  },
  {
    title: "Secondary Benefits",
    subtitle: "Highlight additional wins",
    original_content: "Other things improved too",
    examples: [{
      content: "Improved team satisfaction by 40% and reduced overtime hours by 60%",
      explanation: "Added employee impact metrics"
    }]
  },
  {
    title: "Long-term Value",
    subtitle: "Show sustained impact",
    original_content: "Things got better",
    examples: [{
      content: "Created framework adopted by 3 other departments, scaling efficiency gains company-wide",
      explanation: "Added organizational impact and scaling"
    }]
  },
  {
    title: "Recognition",
    subtitle: "Highlight achievements",
    original_content: "People liked the results",
    examples: [{
      content: "Received CEO Excellence Award and presented methodology at industry conference",
      explanation: "Added external validation and recognition"
    }]
  },
  {
    title: "Business Growth",
    subtitle: "Connect to company success",
    original_content: "The company did better",
    examples: [{
      content: "Contributed to 25% YoY revenue growth and successful expansion into 2 new markets",
      explanation: "Added business impact metrics"
    }]
  }
]

interface Recommendations {
  situation: Array<{
    title: string;
    subtitle: string;
    original_content: string;
    examples: Array<{
      content: string;
      explanation: string;
    }>;
  }>;
  task: Array<typeof allTaskRecommendations[0]>;
  action: Array<typeof allActionRecommendations[0]>;
  result: Array<typeof allResultRecommendations[0]>;
}

export const getRandomRecommendations = (): Recommendations => {
  return {
    situation: allSituationRecommendations
      .sort(() => Math.random() - 0.5)
      .slice(0, generateRandomNumber(1, 6)),
    task: allTaskRecommendations
      .sort(() => Math.random() - 0.5)
      .slice(0, generateRandomNumber(1, 6)),
    action: allActionRecommendations
      .sort(() => Math.random() - 0.5)
      .slice(0, generateRandomNumber(1, 6)),
    result: allResultRecommendations
      .sort(() => Math.random() - 0.5)
      .slice(0, generateRandomNumber(1, 6))
  }
} 