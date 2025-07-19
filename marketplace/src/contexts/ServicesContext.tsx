
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the type for the services data (adjust as needed)
type ServicesData = any; // Replace 'any' with a more specific type if you know the structure

interface ServicesContextType {
  services: ServicesData | null;
  loading: boolean;
  error: string | null;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

interface ServicesProviderProps {
  children: ReactNode;
}

const SERVICES_URL = "https://raw.githubusercontent.com/anesukafesu/fourwalls/main/shared/services.json";

export const ServicesProvider: React.FC<ServicesProviderProps> = ({ children }) => {
  const [services, setServices] = useState<ServicesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(SERVICES_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setServices(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch services');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <ServicesContext.Provider value={{ services, loading, error }}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};
