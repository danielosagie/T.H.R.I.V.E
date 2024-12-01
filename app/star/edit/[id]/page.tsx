import { EditStarBuilder } from "@/components/edit-star-builder"

export default function EditExperiencePage({ params }: { params: { id: string } }) {
  const experienceId = parseInt(params.id)
  
  console.log('Loading edit page for experience:', experienceId) // Debug log
  
  return <EditStarBuilder experienceId={experienceId} />
} 