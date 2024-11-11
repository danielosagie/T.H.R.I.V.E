import { Card, CardContent } from "./ui/card"

export function CardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
} 