import Hero from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { createStaticClient } from "@/utils/supabase/server";
import { ChevronRight } from "lucide-react";

async function getTopCategories() {
  const supabase = createStaticClient();
  
  // Fetch all majstori to extract categories
  const { data } = await supabase.from('majstori').select('categories');
  
  if (!data) return [];

  // Count categories
  const categoryCounts: Record<string, number> = {};
  data.forEach(item => {
    if (item.categories && Array.isArray(item.categories)) {
      item.categories.forEach(category => {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
    }
  });
  
  // Convert to array, sort by count, and take top 8
  return Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);
}

export default async function Home() {
  const topCategories = await getTopCategories();
  
  return (
    <>
      <Hero />
      
      {/* Popular Categories Section */}
      <section className="w-full py-12 md:py-16 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Popular Categories</h2>
              <p className="mx-auto max-w-[700px] text-slate-600 md:text-lg">
                Browse the most sought-after professional services in your area
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
            {topCategories.length > 0 ? (
              topCategories.map((category) => (
                <Link 
                  key={category}
                  href={`/majstori?category=${encodeURIComponent(category)}`}
                  className="group flex items-center p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-full text-center">
                    <h3 className="font-medium group-hover:text-primary transition-colors">{category}</h3>
                    <p className="text-sm text-slate-500 mt-1">View professionals</p>
                  </div>
                </Link>
              ))
            ) : (
              Array(8).fill(0).map((_, i) => (
                <div 
                  key={i}
                  className="flex items-center p-4 bg-white border border-slate-200 rounded-lg"
                >
                  <div className="w-full text-center">
                    <h3 className="font-medium text-slate-800">Category</h3>
                    <p className="text-sm text-slate-500 mt-1">View professionals</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline">
              <Link href="/majstori">
                View All Categories
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="w-full py-12 md:py-16 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">How It Works</h2>
              <p className="mx-auto max-w-[700px] text-slate-600 md:text-lg">
                Finding the right professional is quick and easy
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="relative flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Search</h3>
              <p className="text-slate-600 text-center">
                Browse our directory of professionals or use filters to find exactly what you need.
              </p>
            </div>
            <div className="relative flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Compare</h3>
              <p className="text-slate-600 text-center">
                Read detailed profiles, check availability, and compare services offered.
              </p>
            </div>
            <div className="relative flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Contact</h3>
              <p className="text-slate-600 text-center">
                Reach out directly to the professional that best fits your needs.
              </p>
            </div>
          </div>
          <div className="flex justify-center mt-10">
            <Button asChild size="lg">
              <Link href="/majstori">
                Find a Professional Today
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
