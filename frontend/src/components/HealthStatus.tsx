import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type HealthResult = {
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  description: string;
  tags: string[];
};

type HealthResponse = {
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  results: {
    [key: string]: HealthResult;
  };
};

const HealthStatus = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealthStatus = async () => {
    try {
      const res = await fetch('http://localhost:5227/health');
      const data = await res.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health status', error);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'Healthy':
        return <CheckCircle2 className="text-green-600 w-5 h-5" />;
      case 'Degraded':
        return <AlertCircle className="text-yellow-500 w-5 h-5" />;
      case 'Unhealthy':
        return <AlertCircle className="text-red-600 w-5 h-5" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="p-6 flex items-center gap-3">
        <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
        <span>Checking application health...</span>
      </Card>
    );
  }

  if (!health) {
    return (
      <Card className="p-6 text-red-500">
        <p>Unable to retrieve health status.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Displays API and Database status</CardDescription>
      </CardHeader>

      <div className="grid gap-4 mt-4">
        {Object.entries(health.results).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between border p-3 rounded-md">
            <div className="flex items-center gap-3">
              {renderStatusIcon(value.status)}
              <div>
                <div className="font-medium">{key}</div>
                <div className="text-sm text-muted-foreground">{value.description || 'No description'}</div>
              </div>
            </div>
            <Badge
              variant={
                value.status === 'Healthy'
                  ? 'default'
                  : value.status === 'Degraded'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {value.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default HealthStatus;
