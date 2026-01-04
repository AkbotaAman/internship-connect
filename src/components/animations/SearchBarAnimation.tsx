import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const searchExamples = [
  'Software Engineering Intern',
  'Marketing at Google',
  'Remote Design Internship',
  'Data Science NYC',
  'Product Management',
  'UX Research Intern',
];

interface SearchBarAnimationProps {
  onSearch?: (query: string) => void;
}

export function SearchBarAnimation({ onSearch }: SearchBarAnimationProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (isFocused) return;

    const currentExample = searchExamples[exampleIndex];

    if (isWaiting) {
      const timer = setTimeout(() => {
        setIsWaiting(false);
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    const speed = isDeleting ? 30 : 80;

    const timer = setTimeout(() => {
      if (isDeleting) {
        if (charIndex > 0) {
          setCharIndex((prev) => prev - 1);
          setPlaceholder(currentExample.substring(0, charIndex - 1));
        } else {
          setIsDeleting(false);
          setExampleIndex((prev) => (prev + 1) % searchExamples.length);
        }
      } else {
        if (charIndex < currentExample.length) {
          setCharIndex((prev) => prev + 1);
          setPlaceholder(currentExample.substring(0, charIndex + 1));
        } else {
          setIsWaiting(true);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, exampleIndex, isDeleting, isFocused, isWaiting]);

  // Reset when example changes
  useEffect(() => {
    setCharIndex(0);
    setPlaceholder('');
  }, [exampleIndex]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    navigate(`/internships?q=${encodeURIComponent(searchQuery)}`);
  };

  const displayPlaceholder = isFocused 
    ? 'Search internships, companies, or skills...' 
    : placeholder || 'Type to search...';

  return (
    <form onSubmit={handleSearch} role="search" aria-label="Search internships">
      <div className="flex flex-col sm:flex-row gap-3 p-3 glass-dark rounded-2xl">
        <div className="flex-1 relative">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/50" 
            aria-hidden="true" 
          />
          <Input
            placeholder={displayPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="h-14 pl-12 bg-primary-foreground/10 border-0 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-primary-foreground/30 rounded-xl transition-all"
            aria-label="Search internships"
          />
          {!isFocused && !searchQuery && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-primary-foreground/40 animate-blink pointer-events-none" />
          )}
        </div>
        <Button type="submit" size="xl" variant="accent" className="sm:w-auto w-full">
          <Search className="w-5 h-5 mr-2" aria-hidden="true" />
          Search
        </Button>
      </div>
    </form>
  );
}
