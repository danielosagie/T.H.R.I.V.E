import EditStarBuilder from "@/components/edit-star-builder"

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const experienceId = parseInt(resolvedParams.id)
  return <EditStarBuilder experienceId={experienceId} />
} 