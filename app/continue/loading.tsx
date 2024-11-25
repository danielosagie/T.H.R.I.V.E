import { CardSkeleton } from "@/components/card-skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
      </div>
      
      <div className="space-y-4 mb-8">
        <div className="h-10 w-2/3 mx-auto bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-3/4 mx-auto bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
} 