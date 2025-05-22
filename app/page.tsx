import Hero from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { createStaticClient } from "@/utils/supabase/server";
import { ChevronRight } from "lucide-react";
import { TOP_CATEGORIES } from "@/utils/categories";

export default async function Home() {
  const topCategories = TOP_CATEGORIES;

  return (
    <>
      <Hero />
      
      {/* Top Categories Section */}
      <section className="w-full py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Popularne kategorije</h2>
              <p className="mx-auto max-w-[700px] text-slate-600 md:text-lg">
                Istražite najtraženije vrste usluga na našoj platformi
              </p>
            </div>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:gap-8 mt-8">
            {topCategories.map((category) => (
              <Link 
                key={category} 
                href={`/majstori?category=${encodeURIComponent(category)}`}
                className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="p-2">
                  <Badge variant="outline">{category}</Badge>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline">
              <Link href="/majstori">
                Pregledaj sve kategorije
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Kako funkcionira</h2>
              <p className="mx-auto max-w-[700px] text-slate-600 md:text-lg">
                Pronalaženje pravog majstora je brzo i jednostavno
              </p>
            </div>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-10">
            <div className="relative flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Pretraži</h3>
              <p className="text-slate-600 text-center">
                Pretražite našu bazu provjerenih majstora po kategoriji ili lokaciji.
              </p>
            </div>
            
            <div className="relative flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Usporedi</h3>
              <p className="text-slate-600 text-center">
                Pregledajte profile, specijalizacije i dostupnost majstora.
              </p>
            </div>
            
            <div className="relative flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Kontaktiraj</h3>
              <p className="text-slate-600 text-center">
                Direktno se javite majstoru koji najbolje odgovara vašim potrebama.
              </p>
            </div>
          </div>
          <div className="flex justify-center mt-10">
            <Button asChild size="lg">
              <Link href="/majstori">
                Pronađi majstora danas
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
