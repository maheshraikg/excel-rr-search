import SearchInterface from '../SearchInterface';
import { useState } from 'react';

interface SearchFilters {
  rrNumber: string;
  sheet: string;
  dateRange: string;
}

export default function SearchInterfaceExample() {
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const availableSheets = [
    'Survey Data',
    'Summary', 
    'Main Data',
    'Reference',
    'Caste Data',
    'Institution Data'
  ];

  const handleSearch = (filters: SearchFilters) => {
    setIsSearching(true);
    console.log('Search triggered with:', filters);
    
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      setTotalResults(Math.floor(Math.random() * 15) + 1); // Random results count
    }, 1500);
  };

  return (
    <SearchInterface 
      onSearch={handleSearch}
      isSearching={isSearching}
      availableSheets={availableSheets}
      totalResults={totalResults}
    />
  );
}