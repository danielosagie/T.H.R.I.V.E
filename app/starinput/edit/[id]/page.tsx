import EditStarBuilder from "@/components/edit-star-builder"

export default async function EditExperiencePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const id = await Promise.resolve(params.id)
  const experienceId = parseInt(id)

  return (
    <EditStarBuilder 
      experienceId={experienceId}
    />
  )
} 