// InsulationContext.tsx
import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

// Define the InsulationLayer interface
export interface InsulationLayer {
  id: string;
  type: string;
  name: string;
  thickness: string;
  color: string;
}

// Define the shape of the context values
interface InsulationContextType {
  layers: InsulationLayer[];
  setLayers: Dispatch<SetStateAction<InsulationLayer[]>>;
}

// Create the context with a default undefined value
const InsulationContext = createContext<InsulationContextType | undefined>(undefined);

// Define the props for the InsulationProvider
export interface InsulationProviderProps { // Make sure this is exported if used elsewhere for typing
  children: ReactNode;
  layers: InsulationLayer[]; // Passed from Dashboard
  setLayers: Dispatch<SetStateAction<InsulationLayer[]>>; // Passed from Dashboard
}

export const InsulationProvider = ({ children, layers, setLayers }: InsulationProviderProps) => {
  const contextValue: InsulationContextType = {
    layers,
    setLayers,
  };

  return (
    <InsulationContext.Provider value={contextValue}>
      {children}
    </InsulationContext.Provider>
  );
};

// Custom hook to use the insulation context
export const useInsulation = () => {
  const context = useContext(InsulationContext);
  if (context === undefined) {
    throw new Error('useInsulation must be used within an InsulationProvider');
  }
  return context;
};