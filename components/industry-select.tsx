import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface IndustrySelectProps {
  value: string
  onChange: (value: string) => void
  industriesByCategory: Array<{
    category: string
    industries: string[]
  }>
}

export function IndustrySelect({ value, onChange, industriesByCategory }: IndustrySelectProps) {
  const [industrySearch, setIndustrySearch] = useState("")

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select industry" />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input 
            placeholder="Search industries..." 
            value={industrySearch}
            onChange={(e) => setIndustrySearch(e.target.value)}
            className="mb-2"
          />
        </div>
        {industriesByCategory.map((category) => {
          const filteredIndustries = category.industries.filter(industry => 
            industry.toLowerCase().includes(industrySearch.toLowerCase())
          )

          if (filteredIndustries.length === 0) return null

          return (
            <React.Fragment key={category.category}>
              <SelectItem value={category.category} disabled>
                {category.category}
              </SelectItem>
              {filteredIndustries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </React.Fragment>
          )
        })}
        {industrySearch && !industriesByCategory.some(category => 
          category.industries.some(industry => 
            industry.toLowerCase().includes(industrySearch.toLowerCase())
          )
        ) && (
          <SelectItem value={industrySearch}>
            Other: {industrySearch}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
} 