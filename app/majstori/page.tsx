'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
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
  ArrowRight
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
}

type SortField = 'name' | 'wait_time_days' | 'location' | 'created_at'
type SortOrder = 'asc' | 'desc'

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
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(majstor => 
        (majstor.name && majstor.name.toLowerCase().includes(query)) ||
        (majstor.bio && majstor.bio.toLowerCase().includes(query)) ||
        (majstor.location && majstor.location.toLowerCase().includes(query)) ||
        (majstor.service_area && majstor.service_area.toLowerCase().includes(query))
      )
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
    
    // Apply sorting
    results.sort((a, b) => {
      let valueA = a[sortField]
      let valueB = b[sortField]
      
      // Handle string comparison
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase()
      }
      if (typeof valueB === 'string') {
        valueB = valueB.toLowerCase()
      }
      
      if (valueA < valueB) {
        return sortOrder === 'asc' ? -1 : 1
      }
      if (valueA > valueB) {
        return sortOrder === 'asc' ? 1 : -1
      }
      return 0
    })
    
    setFilteredMajstori(results)
    setCurrentPage(1)
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
                {allCategories.map((category) => (
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
                  Wait Time {sortField === 'wait_time_days' && (sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="location" className="text-sm font-medium mb-1">Location</Label>
            <Input
              id="location"
              placeholder="Filter by location or service area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 mt-6">
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
          
          <div className="flex items-center gap-2 mt-6">
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
                    <Link href={`/majstori/${majstor.id}`} className="block">
                      <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{majstor.name}</h2>
                    </Link>
                    
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm">{majstor.location || 'Location not specified'}</p>
                    </div>
                    
                    {majstor.service_area && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Service area: {majstor.service_area}
                      </p>
                    )}
                    
                    {majstor.categories && majstor.categories.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {majstor.categories.map((category, index) => (
                            <Badge key={index} variant="outline">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <p className="text-sm line-clamp-2">{majstor.bio || 'No bio available'}</p>
                    </div>
                    
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