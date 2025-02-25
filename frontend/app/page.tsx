import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Film, HelpCircle } from "lucide-react"
import { redirect } from "next/navigation"

async function getRecommendations(formData: FormData) {
  "use server"

  const username = formData.get("username")
  const performanceRatio = formData.get("performanceRatio")
  const popularityThreshold = formData.get("popularityThreshold")
  const contributeRatings = formData.get("contributeRatings")

  if (!username) throw new Error("Username is required")

  // Redirect to recommendations page with all parameters
  const searchParams = new URLSearchParams({
    performanceRatio: performanceRatio?.toString() || "20",
    popularityThreshold: popularityThreshold?.toString() || "0",
    contributeRatings: contributeRatings === "on" ? "true" : "false",
  })

  redirect(`/recommendations/${username}?${searchParams.toString()}`)
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black/95 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/40 border-zinc-800">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Film className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl text-white">Film Recommendations</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your Letterboxd username to get personalized film recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={getRecommendations} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                name="username"
                placeholder="Your Letterboxd username"
                className="bg-black/50 border-zinc-800 text-white placeholder:text-zinc-500"
                required
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-200">Performance vs. Quality</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-zinc-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Higher values provide better recommendations but take longer to process. Lower values are
                          faster but may be less accurate.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-2">
                  <Slider
                    name="performanceRatio"
                    defaultValue={[20]}
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-primary"
                  />
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Faster</span>
                    <span>Better</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-200">Movie Popularity Filter</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-zinc-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Higher values focus on less-reviewed movies. Lower values include all movies regardless of
                          popularity.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-2">
                  <Slider
                    name="popularityThreshold"
                    defaultValue={[0]}
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-primary"
                  />
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>All Movies</span>
                    <span>Less-Reviewed Only</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contributeRatings"
                  name="contributeRatings"
                  className="border-zinc-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor="contributeRatings"
                  className="text-sm font-medium leading-none text-zinc-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Add your ratings to recommendations database?
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Get Recommendations
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

