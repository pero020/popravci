'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import Image from 'next/image'
import { TOP_CATEGORIES, SERVICE_CATEGORIES } from '@/utils/categories'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  AlertCircle,
  Languages,
  MapPin,
  Phone,
  Clock,
  Calendar,
  ArrowRight,
  User
} from 'lucide-react'

type Majstor = {
  id: string
  user_id: string
  name: string
  location: string
  categories: string[]
  contacts: string[]
  wait_time_days: number
  emergency_available: boolean
  weekend_evening: boolean
  service_area: string
  languages: string[]
  bio: string
  created_at: string
  profile_picture?: string | null
  _searchScore?: number // Add search score property for relevance sorting
}

type SortField = 'name' | 'wait_time_days' | 'location' | 'created_at' | '_searchScore'
type SortOrder = 'asc' | 'desc'

const emergency_available_tags = ['emergency', 'urgent', 'hitno dostupno', 'odmah', 'sada']
const weekend_evening_tags = ['night', 'evening', 'vikend', 'navecer', 'vece', 'noc']

// Helper functions for fuzzy searching
const normalizeText = (text: string): string => {
  return text ? text.toLowerCase().trim() : '';
}

// Check if a search term appears partially in text (minimum 3 characters)
const partialMatch = (term: string, text: string): boolean => {
  if (!term || !text || term.length < 3) return false;
  
  const normalizedTerm = normalizeText(term);
  const normalizedText = normalizeText(text);
  
  // Check for partial matches of at least 3 characters
  for (let i = 3; i <= normalizedTerm.length; i++) {
    const substring = normalizedTerm.substring(0, i);
    if (normalizedText.includes(substring)) {
      return true;
    }
  }
  
  return false;
}

// Calculate a relevance score for search matches
const calculateSearchScore = (majstor: Majstor, searchTerms: string[]): number => {
  if (!searchTerms.length) return 0;
  
  // Define field weights (higher = more important)
  const weights = {
    name: 10,
    categories: 8, 
    subcategories: 3, // Lower weight for subcategories
    bio: 5,
    location: 4,
    service_area: 3,
    emergency_available: 2,
    weekend_evening: 2
  };
  
  let totalScore = 0;
  
  // Get subcategories for this majstor's categories
  const subcategories = getAllSubcategories(majstor.categories || []);
  
  // Text fields to search in with their weights
  const fieldsToSearch = [
    { field: majstor.name || '', weight: weights.name },
    { field: (majstor.categories || []).join(' '), weight: weights.categories },
    { field: subcategories.join(' '), weight: weights.subcategories }, // Include subcategories
    { field: majstor.bio || '', weight: weights.bio },
    { field: majstor.location || '', weight: weights.location },
    { field: majstor.service_area || '', weight: weights.service_area },
    { field: majstor.emergency_available ? 'emergency hitno' : '', weight: weights.emergency_available },
    { field: majstor.weekend_evening ? 'night weekend evening vikend navecer vece noc' : '', weight: weights.weekend_evening }
  ];
  
  // For each search term
  searchTerms.forEach(term => {
    let termScore = 0;
    
    // Check each field
    fieldsToSearch.forEach(({ field, weight }) => {
      const fieldLower = field.toLowerCase();
      
      // Exact match gets highest score
      if (fieldLower.includes(term)) {
        termScore += weight * 2; // Double weight for exact matches
      }
      // Partial match (at least 3 chars)
      else if (term.length >= 3 && partialMatch(term, fieldLower)) {
        termScore += weight;
      }
    });
    
    totalScore += termScore;
  });
  
  return totalScore;
}

// Helper function to get subcategories for a main category
const getSubcategoriesForCategory = (categoryName: string): string[] => {
  // Remove any numbering from the category name to match the format in SERVICE_CATEGORIES
  const normalizedCategoryName = categoryName.replace(/^\d+\.\s*/, '');
  
  // Find the category in SERVICE_CATEGORIES
  const category = SERVICE_CATEGORIES.find(cat => 
    cat.name.replace(/^\d+\.\s*/, '') === normalizedCategoryName || 
    cat.name === categoryName
  );
  
  // Return subcategory names if found, otherwise empty array
  return category ? category.subcategories.map(sub => sub.name) : [];
}

// Helper function to get all subcategories for an array of main categories
const getAllSubcategories = (categories: string[]): string[] => {
  if (!categories || categories.length === 0) return [];
  
  const allSubcategories: string[] = [];
  
  categories.forEach(category => {
    const subcategories = getSubcategoriesForCategory(category);
    allSubcategories.push(...subcategories);
  });
  
  return allSubcategories;
}

export default function MajstoriPage() {
  const [majstori, setMajstori] = useState<Majstor[]>([])
  const [filteredMajstori, setFilteredMajstori] = useState<Majstor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [emergencyOnly, setEmergencyOnly] = useState(false)
  const [weekendEveningOnly, setWeekendEveningOnly] = useState(false)
  const [location, setLocation] = useState('')
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // All available categories and languages (for filters)
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [allLanguages, setAllLanguages] = useState<string[]>([])
  
  // Initialize Supabase client
  const supabase = createClient()
  
  // Fetch majstori data
  useEffect(() => {
    const fetchMajstori = async () => {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('majstori')
        .select('*')
      
      if (error) {
        console.error('Error fetching majstori:', error)
      } else if (data) {
        setMajstori(data)
        setFilteredMajstori(data)
        
        // Extract unique categories and languages
        const categories = new Set<string>()
        const languages = new Set<string>()
        
        data.forEach(majstor => {
          if (majstor.categories) {
            majstor.categories.forEach((category: string) => categories.add(category))
          }
          if (majstor.languages) {
            majstor.languages.forEach((language: string) => languages.add(language))
          }
        })
        
        setAllCategories(Array.from(categories))
        setAllLanguages(Array.from(languages))
      }
      
      setLoading(false)
    }
    
    fetchMajstori()
  }, [])
  
  // Apply filters and sorting
  useEffect(() => {
    let results = [...majstori]
    let defaultSortByRelevance = false
    
    // Apply search query filter with improved fuzzy matching
    if (searchQuery && searchQuery.trim() !== '') {
      // Split search query into individual terms for multi-word search
      const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(term => term.length > 0);
      
      if (searchTerms.length > 0) {
        results = results.filter(majstor => {
          // Get subcategories for this majstor's categories (for searching)
          const subcategories = getAllSubcategories(majstor.categories || []);
          
          // Text fields to search in
          const fieldsToSearch = [
            majstor.name || '',
            majstor.bio || '',
            majstor.location || '',
            majstor.service_area || '',
            // Add categories as a joined string for searching
            (majstor.categories || []).join(' '),
            // Include subcategories for searching
            subcategories.join(' '),
            majstor.emergency_available ? 'emergency hitno' : '',
            majstor.weekend_evening ? 'night weekend evening vikend navecer vece noc' : ''
          ];
          
          // Count how many terms match
          const matchedTerms = searchTerms.filter(term => {
            return fieldsToSearch.some(field => {
              // Check for exact inclusion or partial match (min 3 chars)
              const fieldLower = field.toLowerCase();
              return fieldLower.includes(term) || 
                    (term.length >= 3 && partialMatch(term, fieldLower));
            });
          });
          
          // Filter will accept if ANY word matches something
          return matchedTerms.length > 0;
        });

        // Calculate search scores for each result
        results.forEach(majstor => {
          majstor._searchScore = calculateSearchScore(majstor, searchTerms);
        });
        
        // When searching, we should default sort by relevance
        defaultSortByRelevance = true;
      }
    } else {
      // Clear search scores when no search query
      results = results.map(majstor => ({ ...majstor, _searchScore: undefined }));
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      results = results.filter(majstor => 
        majstor.categories && 
        selectedCategories.some(category => majstor.categories.includes(category))
      )
    }
    
    // Apply language filter
    if (selectedLanguages.length > 0) {
      results = results.filter(majstor => 
        majstor.languages && 
        selectedLanguages.some(language => majstor.languages.includes(language))
      )
    }
    
    // Apply emergency filter
    if (emergencyOnly) {
      results = results.filter(majstor => majstor.emergency_available)
    }
    
    // Apply weekend/evening filter
    if (weekendEveningOnly) {
      results = results.filter(majstor => majstor.weekend_evening)
    }
    
    // Apply location filter
    if (location) {
      const locationQuery = location.toLowerCase()
      results = results.filter(majstor => 
        (majstor.location && majstor.location.toLowerCase().includes(locationQuery)) ||
        (majstor.service_area && majstor.service_area.toLowerCase().includes(locationQuery))
      )
    }
    
    // Apply sorting - if searching, automatically sort by relevance score
    const currentSortField = defaultSortByRelevance ? '_searchScore' : sortField;
    const currentSortOrder = defaultSortByRelevance ? 'desc' : sortOrder;
    
    results.sort((a, b) => {
      let valueA = a[currentSortField];
      let valueB = b[currentSortField];
      
      // Handle undefined values
      if (valueA === undefined) {
        valueA = currentSortField === '_searchScore' ? 0 : '';
      }
      if (valueB === undefined) {
        valueB = currentSortField === '_searchScore' ? 0 : '';
      }
      
      // Handle string comparison
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
      }
      if (typeof valueB === 'string') {
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) {
        return currentSortOrder === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return currentSortOrder === 'asc' ? 1 : -1;
      }
      
      // Secondary sort by name if scores are equal
      if (currentSortField === '_searchScore' && valueA === valueB) {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      
      return 0;
    });
    
    setFilteredMajstori(results);
    setCurrentPage(1);
  }, [majstori, searchQuery, selectedCategories, selectedLanguages, emergencyOnly, weekendEveningOnly, location, sortField, sortOrder])
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredMajstori.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredMajstori.length / itemsPerPage)
  
  // Toggle sort direction or change sort field
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }
  
  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }
  
  // Toggle language selection
  const toggleLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== language))
    } else {
      setSelectedLanguages([...selectedLanguages, language])
    }
  }
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedLanguages([])
    setEmergencyOnly(false)
    setWeekendEveningOnly(false)
    setLocation('')
    setSortField('name')
    setSortOrder('asc')
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Majstori Directory</h1>
      
      {/* Search and filters */}
      <div className="bg-card rounded-lg p-4 shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input 
              type="text"
              placeholder="Search by name, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2 items-center">
                  <ChevronDown className="h-4 w-4" />
                  <span>Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSort('name')}>
                  Name {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('wait_time_days')}>
                  Typical Wait Time {sortField === 'wait_time_days' && (sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('location')}>
                  Location {sortField === 'location' && (sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('created_at')}>
                  Newest {sortField === 'created_at' && (sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2 items-center">
                <Filter className="h-4 w-4" />
                <span>Categories</span>
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary">{selectedCategories.length}</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Select Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {TOP_CATEGORIES.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2 items-center">
                <Languages className="h-4 w-4" />
                <span>Languages</span>
                {selectedLanguages.length > 0 && (
                  <Badge variant="secondary">{selectedLanguages.length}</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Select Languages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allLanguages.map((language) => (
                <DropdownMenuCheckboxItem
                  key={language}
                  checked={selectedLanguages.includes(language)}
                  onCheckedChange={() => toggleLanguage(language)}
                >
                  {language}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="emergency" 
              checked={emergencyOnly}
              onCheckedChange={() => setEmergencyOnly(!emergencyOnly)}
            />
            <label
              htmlFor="emergency"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 text-red-500" />
              Emergency Available
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox 
              id="weekend" 
              checked={weekendEveningOnly}
              onCheckedChange={() => setWeekendEveningOnly(!weekendEveningOnly)}
            />
            <label
              htmlFor="weekend"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >
              <Calendar className="h-4 w-4 text-blue-500" />
              Weekend/Evening Available
            </label>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset Filters
          </Button>
          <p className="text-sm text-muted-foreground">
            {filteredMajstori.length} majstori found
          </p>
        </div>
      </div>
      
      {/* Results */}
      <div className="min-h-[500px]"> {/* Added fixed minimum height container */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {currentItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((majstor) => (
                  <div key={majstor.id} className="bg-card rounded-lg overflow-hidden shadow group hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="relative h-16 w-16 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                          {majstor.profile_picture ? (
                            <Image
                              src={majstor.profile_picture}
                              alt={majstor.name}
                              fill
                              sizes="4rem"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                              <User className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link href={`/majstori/${majstor.id}`} className="block">
                            <h2 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">{majstor.name}</h2>
                          </Link>
                          
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <p className="text-sm">{majstor.location || 'Location not specified'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {majstor.service_area && (
                        <p className="text-xs text-muted-foreground mb-3">
                          Service area: {majstor.service_area}
                        </p>
                      )}
                      
                      {majstor.categories && majstor.categories.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {majstor.categories.slice(0, 3).map((category, index) => (
                              <Badge key={index} variant="outline">
                                {category}
                              </Badge>
                            ))}
                            {majstor.categories.length > 3 && (
                              <Badge variant="outline">+{majstor.categories.length - 3} more</Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-4 mb-3">
                        {majstor.wait_time_days !== null && (
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>Wait: {majstor.wait_time_days} days</span>
                          </div>
                        )}
                        
                        {majstor.emergency_available && (
                          <div className="flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle className="h-3 w-3" />
                            <span>Emergency</span>
                          </div>
                        )}
                        
                        {majstor.weekend_evening && (
                          <div className="flex items-center gap-1 text-xs text-blue-500">
                            <Calendar className="h-3 w-3" />
                            <span>Weekend/Evening</span>
                          </div>
                        )}
                      </div>
                      
                      {majstor.languages && majstor.languages.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <Languages className="h-3 w-3" />
                          <span>{majstor.languages.join(', ')}</span>
                        </div>
                      )}
                      
                      {majstor.contacts && majstor.contacts.length > 0 && (
                        <div className="mt-4">
                          {majstor.contacts.slice(0, 1).map((contact, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3" />
                              <span>{contact}</span>
                            </div>
                          ))}
                          {majstor.contacts.length > 1 && (
                            <p className="text-xs text-muted-foreground mt-1">+{majstor.contacts.length - 1} more contact(s)</p>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-4 pt-3 border-t">
                        <Button variant="link" className="p-0 h-auto flex items-center" asChild>
                          <Link href={`/majstori/${majstor.id}`}>
                            View Details 
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No majstori found matching your filters.</p>
                <Button variant="link" onClick={resetFilters} className="mt-2">
                  Reset all filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Pagination */}
      {filteredMajstori.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0 mx-1"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}