import React, { useState } from 'react';
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const industriesByCategory = [
  {
    category: "Technology & Digital",
    industries: [
      "Artificial Intelligence & Machine Learning",
      "Cloud Computing & Infrastructure",
      "Cybersecurity & Privacy",
      "Data Science & Analytics",
      "Digital Transformation & Automation",
      "E-commerce & Digital Retail",
      "Enterprise Software",
      "Gaming & Interactive Entertainment",
      "Web Development & App Development",
    ],
  },
  {
    category: "Healthcare & Life Sciences",
    industries: [
      "Biotechnology & Pharmaceuticals",
      "Digital Health Tech",
      "Healthcare Services & Administration",
      "Medical Devices & Diagnostics",
      "Public Health & Epidemiology",
      "Telemedicine & Remote Care",
      "Wellness & Preventive Care",
    ],
  },
  {
    category: "Finance & Professional Services",
    industries: [
      "Accounting & Auditing",
      "Banking & Financial Services", 
      "Cryptocurrency & Digital Assets",
      "Insurance & Risk Management",
      "Investment Management",
      "Legal Services & Compliance",
      "Real Estate & Property Management",
    ],
  },
  {
    category: "Creative & Media",
    industries: [
      "Advertising & Marketing",
      "Content Creation & Distribution",
      "Film & Television Production",
      "Graphic Design & Visual Arts", 
      "Music & Audio Production",
      "Publishing & Digital Media",
      "Social Media Management",
    ],
  },
  {
    category: "Education & Training",
    industries: [
      "Corporate Training & Development",
      "Early Childhood Education",
      "EdTech & Online Learning",
      "Higher Education",
      "K-12 Education",
      "Professional Certification",
      "Special Education",
    ],
  },
  {
    category: "Manufacturing & Industrial",
    industries: [
      "Aerospace & Defense",
      "Automotive Manufacturing",
      "Chemical Processing",
      "Electronics Manufacturing",
      "Industrial Automation",
      "Medical Device Manufacturing",
      "Robotics & Control Systems",
    ],
  },
  {
    category: "Sustainability & Environment",
    industries: [
      "Clean Energy & Renewables",
      "Climate Tech",
      "Environmental Consulting",
      "Green Building & Construction",
      "Sustainable Agriculture",
      "Waste Management & Recycling",
      "Water Treatment & Conservation",
    ],
  },
  {
    category: "Retail & Consumer",
    industries: [
      "Consumer Electronics",
      "Fashion & Apparel",
      "Food & Beverage",
      "Home & Garden",
      "Luxury Goods",
      "Personal Care & Beauty",
      "Pet Products & Services",
    ],
  }
];

interface IndustrySelectProps {
  value: string[]
  onChange: (value: string[]) => void
  industriesByCategory: Array<{
    category: string
    industries: string[]
  }>
}

export function IndustrySelect({ 
  value = [],
  onChange, 
  industriesByCategory 
}: IndustrySelectProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const toggleIndustry = (industry: string) => {
    const newValue = value.includes(industry)
      ? value.filter(i => i !== industry)
      : [...value, industry]
    onChange(newValue)
  }

  const filteredCategories = industriesByCategory.map(category => ({
    ...category,
    industries: category.industries.filter(industry =>
      industry.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.industries.length > 0)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value.length === 0
            ? "Select industries..." 
            : `${value.length} ${value.length === 1 ? 'industry' : 'industries'} selected`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-2" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="flex items-center border-b mb-2 pb-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search industries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredCategories.length === 0 ? (
            <div className="py-6 text-center text-sm">No industries found.</div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.category} className="mb-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  {category.category}
                </div>
                <div className="space-y-1">
                  {category.industries.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className="flex items-center w-full hover:bg-accent hover:text-accent-foreground rounded-sm px-2 py-1.5 text-sm"
                    >
                      <div className="mr-2 h-4 w-4 shrink-0">
                        {value.includes(industry) && <Check className="h-4 w-4" />}
                      </div>
                      <span>{industry}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}