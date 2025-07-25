import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'; // Assuming Shadcn UI dialog components
import { Button } from '@/components/ui/button'; // Assuming Shadcn UI button
import { Loader2 } from 'lucide-react'; // For a spinning loader icon

interface HealthCheckResponse {
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  results: {
    [key: string]: {
      status: 'Healthy' | 'Degraded' | 'Unhealthy';
      description: string;
      exception: string | null;
      tags: string[];
    };
  };
}

interface ConnectionStatusModalProps {
  backendHealthCheckUrl: string; // The URL to your backend's health endpoint (e.g., "http://localhost:5227/health")
  children: React.ReactNode; // The main app content that this modal will wrap
  pollingIntervalMs?: number; // How often to poll the health endpoint (default: 5000ms)
  isEnabled?: boolean; // New prop: if false, the modal will never show (for development purposes)
}

const ConnectionStatusModal: React.FC<ConnectionStatusModalProps> = ({
  backendHealthCheckUrl,
  children,
  pollingIntervalMs = 5000,
  isEnabled = true, // Default to true, so it's enabled unless explicitly set to false
}) => {
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheckMessage, setLastCheckMessage] = useState('Checking backend status...');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkBackendHealth = async () => {
    setIsLoading(true);
    setLastCheckMessage('Attempting to connect and check backend status...');
    try {
      const response = await fetch(backendHealthCheckUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: HealthCheckResponse = await response.json();

      if (data.status === 'Healthy') {
        setIsBackendConnected(true);
        setLastCheckMessage('Backend is healthy. Modal will close shortly.');
        // Optionally, add a small delay before closing for better UX
        setTimeout(() => {
          setIsBackendConnected(true); // Ensure it's true after delay if needed
        }, 1000);
      } else {
        setIsBackendConnected(false);
        setLastCheckMessage(`Backend status: ${data.status}. Some services might be degraded or unhealthy. Retrying...`);
      }
    } catch (error) {
      console.error('Error connecting to backend health endpoint:', error);
      setIsBackendConnected(false);
      setLastCheckMessage(`Cannot connect to backend or backend is unhealthy. Error: ${(error as Error).message}. Retrying...`);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to initiate the first check and set up polling
  useEffect(() => {
    // Only perform health checks if the component is enabled for development
    if (isEnabled) {
      checkBackendHealth(); // Initial check

      // Set up polling
      intervalRef.current = setInterval(checkBackendHealth, pollingIntervalMs);
    }


    // Cleanup function for when the component unmounts or isEnabledForDevelopment changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [backendHealthCheckUrl, pollingIntervalMs, isEnabled]); // Add isEnabledForDevelopment to dependencies


  return (
    <>
      {children} {/* Render your main application content */}

      {/* The Dialog will only open if isEnabledForDevelopment is true (or undefined) AND the backend is not connected */}
      <Dialog open={isEnabled && !isBackendConnected}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Cannot Connect to Backend
            </DialogTitle>
            <DialogDescription>
              We're having trouble connecting to the application server.
              The application might not function correctly until the connection is restored.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700">{lastCheckMessage}</p>
            {isLoading && (
              <p className="flex items-center gap-2 mt-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" /> Refreshing connection...
              </p>
            )}
            {!isLoading && (
              <Button onClick={checkBackendHealth} className="mt-4 w-full">
                Try Manual Reconnect
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConnectionStatusModal;
