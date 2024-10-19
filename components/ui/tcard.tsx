import React, { useState } from 'react';
import { TagInput, Tag } from 'emblor';

// Remove or comment out unused imports
// import { useState, useEffect } from 'react';
// import axios from 'axios';

interface Persona {
  name: string;
  professional_summary: string;
  qualifications_and_education: string[];
  goals: string[];
  skills: string[];
  life_experiences: string[];
  strengths: string[];
  value_proposition: string[];
  [key: string]: string | string[];
  interests: string[];
  values: string[];
  traits: string[];
}

interface TCardProps {
  persona: Persona;
  onPersonaChange: (updatedPersona: Persona) => void;
}

// Remove or comment out unused interface
// interface StreamingEditableTCardProps {
//   // ... your StreamingEditableTCardProps interface definition ...
// }

const categoryLabels: Record<keyof Persona, string> = {
  skills: "Skills",
  interests: "Interests",
  values: "Core Values",
  traits: "Personality Traits"
};

const TCard: React.FC<TCardProps> = ({ persona, onPersonaChange }) => {
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const updateCategory = (category: keyof Persona, newTags: Tag[]) => {
    const updatedPersona = {
      ...persona,
      [category]: newTags.map(tag => tag.text)
    };
    onPersonaChange(updatedPersona);
  };

  return (
    <div className="space-y-4">
      {Object.entries(categoryLabels).map(([category, label]) => (
        <div key={category} className="space-y-2">
          <label className="font-medium">{label}</label>
          <TagInput
            tags={(persona[category as keyof Persona] as string[]).map((tag, index) => ({ id: index.toString(), text: tag }))}
            setTags={(newTags) => {
              updateCategory(category as keyof Persona, newTags as Tag[]);
            }}
            placeholder={`Add ${label.toLowerCase()}`}
            activeTagIndex={activeTagIndex}
            setActiveTagIndex={setActiveTagIndex}
          />
        </div>
      ))}
    </div>
  );
};

export default TCard;
