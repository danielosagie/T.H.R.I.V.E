"use client"

import { useRouter } from "next/navigation"
import { StarExportPage } from "@/components/star-export-page"

export default function StarExportClient() {
  const router = useRouter()

  return <StarExportPage />
}
