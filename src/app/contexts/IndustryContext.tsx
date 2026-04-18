import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Industry } from '../components/IndustrySelector';
import { industries } from '../components/IndustrySelector';

interface IndustryContextType {
  industry: Industry | null;
  setIndustry: (industry: Industry) => void;
  clearIndustry: () => void;
}

const IndustryContext = createContext<IndustryContextType | undefined>(undefined);

export function IndustryProvider({ children }: { children: ReactNode }) {
  const [industry, setIndustryState] = useState<Industry | null>(null);

  useEffect(() => {
    // Clean up old corrupted industry data
    localStorage.removeItem('sqms_industry');
    localStorage.removeItem('sqms_selected_industry');

    const savedIndustryId = localStorage.getItem('sqms_industry_id');
    if (savedIndustryId) {
      const foundIndustry = industries.find(ind => ind.id === savedIndustryId);
      if (foundIndustry) {
        setIndustryState(foundIndustry);
      } else {
        localStorage.removeItem('sqms_industry_id');
      }
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
    <IndustryContext.Provider value={{ industry, setIndustry, clearIndustry }}>
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
