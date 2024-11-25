import { PersonaData } from "@/types/types"

export async function getExperienceData(): Promise<PersonaData | undefined> {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    // First try to get the current experience
    const currentExperience = localStorage.getItem("currentExperience")
    if (currentExperience) {
      return JSON.parse(currentExperience)
    }

    // If no current experience, try to get the last selected persona
    const lastSelectedId = localStorage.getItem("lastSelectedPersonaId")
    if (lastSelectedId) {
      const personas = localStorage.getItem("personas")
      if (personas) {
        const parsedPersonas = JSON.parse(personas)
        const lastSelected = parsedPersonas.find((p: PersonaData) => p.id === lastSelectedId)
        if (lastSelected) {
          return lastSelected
        }
      }
    }

    return undefined
  } catch (error) {
    console.error("Error fetching experience data:", error)
    return undefined
  }
}

// Helper function to save experience data
export function saveExperienceData(data: PersonaData): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem("currentExperience", JSON.stringify(data))
    // Also save to session storage as backup
    sessionStorage.setItem("lastEditedExperience", JSON.stringify(data))
  } catch (error) {
    console.error("Error saving experience data:", error)
  }
}

// Helper function to clear experience data
export function clearExperienceData(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem("currentExperience")
    sessionStorage.removeItem("lastEditedExperience")
  } catch (error) {
    console.error("Error clearing experience data:", error)
  }
} 