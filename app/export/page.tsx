import { ExportPageComponent } from "@/components/export-page"
import { getExperienceData } from "@/lib/data"

export default async function ExportPage() {
  const experienceData = await getExperienceData()
  
  return <ExportPageComponent experienceData={experienceData} />
}
