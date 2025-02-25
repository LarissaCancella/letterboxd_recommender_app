'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const storedRecommendations = localStorage.getItem('movieRecommendations');
    if (storedRecommendations) {
      setRecommendations(JSON.parse(storedRecommendations));
      // Opcional: limpar os dados do localStorage após lê-los
      localStorage.removeItem('movieRecommendations');
    }
  }, []);

  return (
    <main className="min-h-screen bg-black/95 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Your Recommendations</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {recommendations.map((movie: any) => (
            <Card key={movie.movie_id} className="bg-black/40 border-zinc-800 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[2/3]">
                  <Image 
                    src={`https://a.ltrbxd.com/resized/${movie.movie_data.image_url}.jpg`} 
                    alt={movie.movie_data.movie_title} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-white line-clamp-1">{movie.movie_data.movie_title}</h2>
                  <p className="text-sm text-zinc-400">{movie.movie_data.year_released}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-primary">★ {movie.predicted_rating.toFixed(2)}</span>
                    <span className="text-xs text-zinc-500">Predicted Rating</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}