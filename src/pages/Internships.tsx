import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { InternshipCard } from '@/components/internships/InternshipCard';
import { SearchFilters, type SearchFilters as Filters } from '@/components/internships/SearchFilters';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, Loader2 } from 'lucide-react';

// Sanitize SQL pattern characters to prevent pattern injection attacks
const escapeSqlPattern = (str: string): string => {
  if (!str) return '';
  // Escape SQL LIKE pattern metacharacters (% and _)
  return str.replace(/[%_\\]/g, '\\$&');
};

// Validate and sanitize search input
const sanitizeSearchInput = (input: string, maxLength: number = 100): string => {
  if (!input) return '';
  // Trim, limit length, and escape SQL patterns
  const trimmed = input.trim().slice(0, maxLength);
  return escapeSqlPattern(trimmed);
};

export default function Internships() {
  const [searchParams] = useSearchParams();
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    keyword: searchParams.get('q') || '',
    location: '',
    industry: '',
    isRemote: null,
    isPaid: null,
  });

  useEffect(() => {
    fetchInternships();
  }, []);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setFilters(prev => ({ ...prev, keyword: query }));
      handleSearch({ ...filters, keyword: query });
    }
  }, [searchParams]);

  const fetchInternships = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('internships')
      .select(`
        *,
        company_profiles (
          company_name,
          logo_url,
          industry
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInternships(data);
    }
    setLoading(false);
  };

  const handleSearch = async (searchFilters: Filters) => {
    setFilters(searchFilters);
    setLoading(true);

    let query = supabase
      .from('internships')
      .select(`
        *,
        company_profiles (
          company_name,
          logo_url,
          industry
        )
      `)
      .eq('is_active', true);

    if (searchFilters.keyword) {
      const sanitizedKeyword = sanitizeSearchInput(searchFilters.keyword);
      if (sanitizedKeyword) {
        query = query.or(`title.ilike.%${sanitizedKeyword}%,description.ilike.%${sanitizedKeyword}%`);
      }
    }

    if (searchFilters.location) {
      const sanitizedLocation = sanitizeSearchInput(searchFilters.location);
      if (sanitizedLocation) {
        query = query.ilike('location', `%${sanitizedLocation}%`);
      }
    }

    if (searchFilters.industry) {
      query = query.eq('industry', searchFilters.industry);
    }

    if (searchFilters.isRemote === true) {
      query = query.eq('is_remote', true);
    }

    if (searchFilters.isPaid === true) {
      query = query.eq('is_paid', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error && data) {
      setInternships(data);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Browse Internships
          </h1>
          <p className="text-muted-foreground mb-8">
            Find your perfect internship from {internships.length} opportunities
          </p>
          <SearchFilters onSearch={handleSearch} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : internships.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Showing {internships.length} internship{internships.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {internships.map((internship) => (
                <InternshipCard key={internship.id} internship={internship} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No internships found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search filters or check back later for new opportunities.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
