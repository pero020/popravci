import { createClient, createStaticClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata, ResolvingMetadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import Script from 'next/script'
import {
  AlertCircle,
  Languages,
  MapPin,
  Phone,
  Clock,
  Calendar
} from 'lucide-react'
import { simpleSanitizeHtml } from '@/utils/sanitize-html'
import { SERVICE_CATEGORIES } from '@/utils/categories'
import '@/app/majstor-bio.css'

export type paramsType = Promise<{ id: string }>;

/**
 * Strip HTML tags for use in meta descriptions
 * @param html HTML content to strip
 * @returns Plain text without HTML tags
 */
function stripHtmlForDescription(html: string | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
    .trim()
    .substring(0, 160);      // Limit to 160 chars for meta description
}

/**
 * Get secondary categories (subcategories) for a given primary category
 * Only used for SEO, not for display
 */
function getSecondaryCategories(primaryCategories: string[] | null): string[] {
  if (!primaryCategories || !primaryCategories.length) return [];
  
  // Remove numbering from primary categories if present
  const normalizedPrimaryCategories = primaryCategories.map(cat => {
    // Remove numbering prefix like "1. " or "10. " if it exists
    return cat.replace(/^\d+\.\s*/, '');
  });
  
  // Get all subcategories for matching primary categories
  const secondaryCategories: string[] = [];
  
  SERVICE_CATEGORIES.forEach(category => {
    // Clean up the category name to match our normalized format
    const normalizedCategoryName = category.name.replace(/^\d+\.\s*/, '');
    
    // If this category matches one of our primary categories
    if (normalizedPrimaryCategories.includes(normalizedCategoryName)) {
      // Add all its subcategories
      category.subcategories.forEach(subcategory => {
        secondaryCategories.push(subcategory.name);
      });
    }
  });
  
  return secondaryCategories;
}

// Generate metadata for SEO purposes
export async function generateMetadata(
  { params }: { params: paramsType },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Use the static client that doesn't depend on cookies
  const supabase = createStaticClient()
  const { id } = await params;
  const { data: majstor } = await supabase
    .from('majstori')
    .select('*')
    .eq('id', id)
    .single()

  if (!majstor) {
    return {
      title: 'Majstor Not Found',
      description: 'The requested majstor could not be found.'
    }
  }

  // Create a plain text description from HTML bio
  const bioPlainText = stripHtmlForDescription(majstor.bio);
  
  // Get secondary categories for SEO
  const secondaryCategories = getSecondaryCategories(majstor.categories);
  
  // Construct a good SEO title and description
  const title = `${majstor.name} - ${majstor.categories?.join(', ')}`;
  const description = `${majstor.name} is a professional for ${majstor.categories?.join(', ')} based in ${majstor.location}.` + 
    (majstor.emergency_available ? ' Available for emergency services.' : '') +
    (majstor.weekend_evening ? ' Works weekends and evenings.' : '');

  // Keywords for improved SEO - now including secondary categories
  const keywords = [
    majstor.name,
    majstor.location,
    ...(majstor.categories || []),
    ...secondaryCategories, // Add all relevant subcategories
    ...(majstor.languages || []),
    'professional',
    'services',
    majstor.emergency_available ? 'emergency services' : '',
    majstor.weekend_evening ? 'weekend service' : '',
  ].filter(Boolean);

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      type: 'profile',
      locale: 'hr_HR',
      siteName: 'Popravci',
      images: [{
        url: `/opengraph-image.png`, // Default image, consider using a profile image if available
        alt: `${majstor.name} - Professional ${majstor.categories?.join(', ')}`,
      }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `/majstori/${id}`,
    },
  }
}

// Generate static paths for all majstori (for improved performance and SEO)
export async function generateStaticParams() {
  // Use the static client that doesn't depend on cookies
  const supabase = createStaticClient()
  const { data } = await supabase.from('majstori').select('id')
  
  return data?.map(({ id }) => ({
    id,
  })) || []
}

export default async function MajstorPage({ params }: { params: paramsType }) {
  const supabase = await createClient()
  const { id } = await params;
  const { data: majstor } = await supabase
    .from('majstori')
    .select('*')
    .eq('id', id)
    .single()

  if (!majstor) {
    notFound()
  }

  // Create structured data for SEO
  const bioPlainText = stripHtmlForDescription(majstor.bio);
  
  // Get secondary categories for structured data
  const secondaryCategories = getSecondaryCategories(majstor.categories);
  
  // Create a combined list of services for structured data
  const allServices = [...(majstor.categories || []), ...secondaryCategories];
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: majstor.name,
    description: bioPlainText || `Professional ${majstor.categories?.join(', ')} services`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: majstor.location || ''
    },
    telephone: majstor.contacts?.[0] || '',
    openingHoursSpecification: majstor.weekend_evening ? {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59'
    } : undefined,
    availableLanguage: majstor.languages,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: allServices.map((service: string) => ({
        '@type': 'Service',
        name: service
      }))
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Add structured data for search engines */}
      <Script id="structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      
      <div className="mb-6">
        <Button variant="ghost" asChild size="sm" className="mb-4">
          <Link href="/majstori" className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to all majstori
          </Link>
        </Button>
      </div>
      
      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{majstor.name}</h1>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <p>{majstor.location || 'Location not specified'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {majstor.contacts && majstor.contacts.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Contact Information</h3>
                  {majstor.contacts.map((contact: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{contact}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {majstor.service_area && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Service Area</h3>
              <p>{majstor.service_area}</p>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Bio</h3>
            <div 
              className="prose max-w-none dark:prose-invert majstor-bio" 
              dangerouslySetInnerHTML={{ __html: simpleSanitizeHtml(majstor.bio || 'No bio available for this majstor.') }} 
            />
          </div>
          
          {majstor.categories && majstor.categories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Services & Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {majstor.categories.map((category: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {majstor.wait_time_days !== null && (
              <div className="bg-background rounded-md p-4 flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Typical Wait Time</h4>
                  <p className="text-sm text-muted-foreground">{majstor.wait_time_days} days</p>
                </div>
              </div>
            )}
            
            {majstor.emergency_available && (
              <div className="bg-background rounded-md p-4 flex items-start gap-3">
                <div className="bg-red-500/10 rounded-full p-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h4 className="font-medium">Emergency Service</h4>
                  <p className="text-sm text-muted-foreground">Available for urgent cases</p>
                </div>
              </div>
            )}
            
            {majstor.weekend_evening && (
              <div className="bg-background rounded-md p-4 flex items-start gap-3">
                <div className="bg-blue-500/10 rounded-full p-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium">Weekend/Evening</h4>
                  <p className="text-sm text-muted-foreground">Available outside business hours</p>
                </div>
              </div>
            )}
          </div>
          
          {majstor.languages && majstor.languages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Languages</h3>
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <span>{majstor.languages.join(', ')}</span>
              </div>
            </div>
          )}
          
          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-muted-foreground">
              Joined on {new Date(majstor.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}