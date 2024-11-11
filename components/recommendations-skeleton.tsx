export function RecommendationsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      {['situation', 'task', 'action', 'result'].map((section) => (
        <div key={section} className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
