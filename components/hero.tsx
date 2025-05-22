import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Wrench, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <div className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-slate-50">
      <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Find the Perfect Professional for Your{" "}
            <span className="text-primary">Repair Needs</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-slate-600 md:text-lg lg:text-xl">
            Connect with skilled, verified craftsmen in your area. Get quality repairs and services when you need them most.
          </p>
        </div>

        <div className="w-full max-w-md flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="flex-1">
            <Link href="/majstori">
              <Search className="mr-2 h-4 w-4" />
              Find Professionals
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="flex-1">
            <Link href="/protected">
              My Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-5xl">
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Search & Compare</h3>
            <p className="text-slate-600 text-center">
              Browse through a variety of professionals with detailed profiles and verified reviews.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Skilled Experts</h3>
            <p className="text-slate-600 text-center">
              Access a network of vetted craftsmen specializing in all types of repairs and maintenance.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Emergency Service</h3>
            <p className="text-slate-600 text-center">
              Filter for professionals who offer emergency and weekend/evening availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
