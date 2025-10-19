import { Calendar, Filter, X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/Button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

export interface FilterState {
  categories: string[];
  ticketTypes: string[];
  dateRange: string;
  location: string;
  sortBy: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isMobile?: boolean;
}

const categories = ['Academic', 'Social', 'Sports', 'Cultural', 'Career', 'Workshop'];
const ticketTypes = ['Free', 'Paid'];
const dateRanges = [
  { value: 'all', label: 'All Dates' },
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'next-month', label: 'Next Month' }
];
const sortOptions = [
  { value: 'date-asc', label: 'Date (Earliest First)' },
  { value: 'date-desc', label: 'Date (Latest First)' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'alphabetical', label: 'Alphabetical' }
];

function FilterContent({ filters, onFiltersChange }: { filters: FilterState; onFiltersChange: (filters: FilterState) => void; }) {
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleTicketTypeChange = (ticketType: string, checked: boolean) => {
    const newTicketTypes = checked
      ? [...filters.ticketTypes, ticketType]
      : filters.ticketTypes.filter(t => t !== ticketType);
    
    onFiltersChange({ ...filters, ticketTypes: newTicketTypes });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      ticketTypes: [],
      dateRange: 'all',
      location: '',
      sortBy: 'date-asc'
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 || 
    filters.ticketTypes.length > 0 || 
    filters.dateRange !== 'all' || 
    filters.location !== '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select 
          value={filters.sortBy} 
          onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Date Range */}
      <div className="space-y-2">
        <Label>Date Range</Label>
        <Select 
          value={filters.dateRange} 
          onValueChange={(value) => onFiltersChange({ ...filters, dateRange: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <Label>Categories</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
              />
              <Label 
                htmlFor={category} 
                className="text-sm font-normal cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Ticket Types */}
      <div className="space-y-3">
        <Label>Ticket Type</Label>
        <div className="space-y-2">
          {ticketTypes.map((ticketType) => (
            <div key={ticketType} className="flex items-center space-x-2">
              <Checkbox
                id={ticketType}
                checked={filters.ticketTypes.includes(ticketType)}
                onCheckedChange={(checked) => handleTicketTypeChange(ticketType, checked as boolean)}
              />
              <Label 
                htmlFor={ticketType} 
                className="text-sm font-normal cursor-pointer"
              >
                {ticketType}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Location */}
      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          placeholder="Search by location..."
          value={filters.location}
          onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
        />
      </div>
    </div>
  );
}

export function FilterSidebar({ filters, onFiltersChange, isMobile = false }: FilterSidebarProps) {
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filter Events</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <motion.div 
      className="hidden lg:block w-80 bg-white/70 backdrop-blur-sm border-r border-gray-200/50 p-6 h-full overflow-y-auto shadow-sm"
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
    </motion.div>
  );
}