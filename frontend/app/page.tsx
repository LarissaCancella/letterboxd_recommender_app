'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Film, HelpCircle } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function Home() {
  const [username, setUsername] = useState('');
  const [performanceRatio, setPerformanceRatio] = useState(500000);
  const [popularityThreshold, setPopularityThreshold] = useState(-1);
  const [contributeRatings, setContributeRatings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      // Cria um objeto com os parâmetros
      const params = {
        username,
        training_data_size: performanceRatio,
        popularity_filter: popularityThreshold,
        data_opt_in: contributeRatings,
      };
  
      // Converte o objeto em uma string de consulta
      const queryString = new URLSearchParams(params as any).toString();
  
      // Chama a rota /get_recs usando GET
      const getRecsResponse = await fetch(`/api/get_recs?${queryString}`, {
        method: 'GET',
      });
  
      if (!getRecsResponse.ok) {
        throw new Error('Error fetching recommendations');
      }
  
      const { redis_get_user_data_job_id, redis_build_model_job_id } = await getRecsResponse.json();
  
      // Função para chamar a rota /results repetidamente
      const pollResults = async () => {
        try {
          const resultsResponse = await fetch(`/api/results?redis_build_model_job_id=${redis_build_model_job_id}&redis_get_user_data_job_id=${redis_get_user_data_job_id}`);
      
          if (resultsResponse.status === 200) {
            const data = await resultsResponse.json();
            if (data.result && Array.isArray(data.result)) {
              // Armazena os resultados no localStorage
              localStorage.setItem('movieRecommendations', JSON.stringify(data.result));
              // Navega para a página de recomendações sem parâmetros
              router.push('/recommendations');
            } else {
              throw new Error('Invalid results format');
            }
          } else if (resultsResponse.status === 202) {
            setTimeout(pollResults, 1000);
          } else {
            throw new Error('Error fetching results');
          }
        } catch (error) {
          console.error('Error:', error);
          setIsLoading(false);
        }
      };
  
      // Inicia o polling
      pollResults();
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                    value={[performanceRatio]}
                    onValueChange={(value) => setPerformanceRatio(value[0])}
                    step={100000}
                    min={400000}
                    max={900000}
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
                    value={[popularityThreshold]}
                    onValueChange={(value) => setPopularityThreshold(value[0])}
                    step={1}
                    min={-1}
                    max={7}
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
                  checked={contributeRatings}
                  onCheckedChange={(checked) => setContributeRatings(checked as boolean)}
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Getting Recommendations...' : 'Get Recommendations'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

