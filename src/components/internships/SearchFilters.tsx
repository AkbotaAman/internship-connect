import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  keyword: string;
  location: string;
  industry: string;
  isRemote: boolean | null;
  isPaid: boolean | null;
}

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Marketing',
  'Design',
  'Engineering',
  'Education',
  'Media',
  'Consulting',
  'Other',
];

export function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    location: '',
    industry: '',
    isRemote: null,
    isPaid: null,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      keyword: '',
      location: '',
      industry: '',
      isRemote: null,
      isPaid: null,
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const hasActiveFilters = filters.keyword || filters.location || filters.industry || 
    filters.isRemote !== null || filters.isPaid !== null;

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      {/* Main Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Job title, keywords, or company"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            className="pl-10 h-12"
          />
        </div>
        <div className="md:w-48">
          <Input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="h-12"
          />
        </div>
        <Button onClick={handleSearch} size="lg" className="h-12">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="h-12"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-border animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Industry</Label>
              <Select
                value={filters.industry}
                onValueChange={(value) => setFilters({ ...filters, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="remote"
                checked={filters.isRemote === true}
                onCheckedChange={(checked) => 
                  setFilters({ ...filters, isRemote: checked ? true : null })
                }
              />
              <Label htmlFor="remote" className="cursor-pointer">Remote Only</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="paid"
                checked={filters.isPaid === true}
                onCheckedChange={(checked) => 
                  setFilters({ ...filters, isPaid: checked ? true : null })
                }
              />
              <Label htmlFor="paid" className="cursor-pointer">Paid Only</Label>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={handleReset} className="text-muted-foreground">
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
