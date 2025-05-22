import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Wrench, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <div className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-slate-50">
      <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Pronađite savršenog majstora za vaše{" "}
            <span className="text-primary">potrebe</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-slate-600 md:text-lg lg:text-xl">
            Povežite se s iskusnim, provjerenim majstorima u vašem području. Dobijte kvalitetne popravke i usluge kada su vam najpotrebnije.
          </p>
        </div>

        <div className="w-full max-w-md flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="flex-1">
            <Link href="/majstori">
              <Search className="mr-2 h-4 w-4" />
              Pronađi majstore
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="flex-1">
            <Link href="/protected">
              Moj račun
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-5xl">
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Pretraži i usporedi</h3>
            <p className="text-slate-600 text-center">
              Brzo pronađite kvalificirane majstore za vaš specifični problem
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Provjerene vještine</h3>
            <p className="text-slate-600 text-center">
              Svi majstori su provjereni i ocijenjeni za kvalitetu njihovog rada
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Direktan kontakt</h3>
            <p className="text-slate-600 text-center">
              Izravno se povežite s majstorima bez posrednika
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
