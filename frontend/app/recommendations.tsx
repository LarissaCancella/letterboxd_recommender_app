import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

type SearchParams = {
  performanceRatio?: string
  popularityThreshold?: string
  contributeRatings?: string
}

// This would be replaced with actual API call to get recommendations
async function getRecommendedFilms(username: string, searchParams: SearchParams) {
  const performanceRatio = Number.parseInt(searchParams.performanceRatio || "20")
  const popularityThreshold = Number.parseInt(searchParams.popularityThreshold || "0")
  const contributeRatings = searchParams.contributeRatings === "true"

  // Simulated API response
  return [
    {
      id: 1,
      title: "The Godfather",
      year: 1972,
      poster: "/placeholder.svg?height=450&width=300",
      rating: 4.5,
      reviewCount: 500000,
    },
    {
      id: 2,
      title: "Pulp Fiction",
      year: 1994,
      poster: "/placeholder.svg?height=450&width=300",
      rating: 4.3,
      reviewCount: 450000,
    },
    {
      id: 3,
      title: "The Dark Knight",
      year: 2008,
      poster: "/placeholder.svg?height=450&width=300",
      rating: 4.4,
      reviewCount: 480000,
    },
    // Add more mock films...
  ]
}

export default async function RecommendationsPage({
  params,
  searchParams,
}: {
  params: { username: string }
  searchParams: SearchParams
}) {
  const films = await getRecommendedFilms(params.username, searchParams)

  return (
    <main className="min-h-screen bg-black/95 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Recommendations for {params.username}</h1>
        <div className="flex gap-4 text-sm text-zinc-400 mb-8">
          <p>Performance: {searchParams.performanceRatio || "20"}%</p>
          <p>Popularity Filter: {searchParams.popularityThreshold || "0"}%</p>
          {searchParams.contributeRatings === "true" && <p className="text-primary">Contributing to database</p>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {films.map((film) => (
            <Card key={film.id} className="bg-black/40 border-zinc-800 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[2/3]">
                  <Image src={film.poster || "/placeholder.svg"} alt={film.title} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-white line-clamp-1">{film.title}</h2>
                  <p className="text-sm text-zinc-400">{film.year}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-primary">★ {film.rating}</span>
                    <span className="text-xs text-zinc-500">{film.reviewCount.toLocaleString()} reviews</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

