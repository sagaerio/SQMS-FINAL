import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Industry } from '../components/IndustrySelector';
import { industries as fallbackIndustries } from '../components/IndustrySelector';
import { getAllIndustries } from '../../services/queueService';

interface IndustryContextType {
  industry: Industry | null;
  setIndustry: (industry: Industry) => void;
  clearIndustry: () => void;
  industries: Industry[];
  loading: boolean;
}

const IndustryContext = createContext<IndustryContextType | undefined>(undefined);

export function IndustryProvider({ children }: { children: ReactNode }) {
  const [industry, setIndustryState] = useState<Industry | null>(null);
  const [industries, setIndustries] = useState<Industry[]>(fallbackIndustries);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load industries from Django backend
    const loadIndustries = async () => {
      const { data, error } = await getAllIndustries();

      if (data && data.length > 0) {
        // Map Django industries to component format (convert number IDs to strings)
        const mappedIndustries: Industry[] = data.map(ind => {
          const fallback = fallbackIndustries.find(f => f.name.toLowerCase().includes(ind.name.toLowerCase())) || fallbackIndustries[0];
          return {
            id: String(ind.id),
            name: ind.name,
            icon: fallback.icon,
            color: ind.color || fallback.color || 'from-blue-600 to-blue-700',
            description: ind.description || fallback.description || ''
          };
        });
        setIndustries(mappedIndustries);
      } else {
        // Use fallback if no industries in database
        setIndustries(fallbackIndustries);
      }

      setLoading(false);
    };

    loadIndustries();

    // Clean up old corrupted industry data
    localStorage.removeItem('sqms_industry');
    localStorage.removeItem('sqms_selected_industry');

    const savedIndustryId = localStorage.getItem('sqms_industry_id');
    if (savedIndustryId) {
      // Wait for industries to load before setting
      setTimeout(() => {
        const foundIndustry = industries.find(ind => ind.id === savedIndustryId);
        if (foundIndustry) {
          setIndustryState(foundIndustry);
        } else {
          localStorage.removeItem('sqms_industry_id');
        }
      }, 100);
    }
  }, []);

  const setIndustry = (newIndustry: Industry) => {
    setIndustryState(newIndustry);
    localStorage.setItem('sqms_industry_id', newIndustry.id);
  };

  const clearIndustry = () => {
    setIndustryState(null);
    localStorage.removeItem('sqms_industry_id');
  };

  return (
    <IndustryContext.Provider value={{ industry, setIndustry, clearIndustry, industries, loading }}>
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry() {
  const context = useContext(IndustryContext);
  if (context === undefined) {
    throw new Error('useIndustry must be used within an IndustryProvider');
  }
  return context;
}
