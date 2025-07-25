// StatusPage.tsx
import React from "react";
import HealthStatus from "@/components/HealthStatus";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header"; // Keep this import

const StatusPage = () => {
  // Define default or static values for the Header props
  // These are minimal props, assuming the Header component is designed to render
  // gracefully with missing props for a status page context.
  const defaultHeaderProps = {
    // You might want to provide a specific title or logo prop if your Header supports it
    // For general header, passing empty/no-op props is typical for non-interactive pages
    activeTab: "",
    onTabChange: () => {},
    tabs: [],
    isAdmin: false,
    // username, lastSaved, onLogout typically not present on a public status page
  };

  return (
    // The main container for your page content
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/*
        Place the Header component here, before the Card,
        to make it appear at the very top of the page content.
        You might want to adjust its styling to ensure it spans full width
        and doesn't interfere with the centering of the Card.
      */}
      <div className="w-full max-w-4xl mb-6"> {/* Added a div to control Header width/margin */}
         <Header {...defaultHeaderProps} />
      </div>

      <Card className="w-full max-w-xl shadow-lg">
        <div className="text-center border-b p-6">
          <h1 className="text-3xl font-bold">System Status</h1>
          <p className="text-gray-600 mt-2">Real-time application and database health</p>
        </div>

        <div className="p-6">
          <HealthStatus />
        </div>

        <footer className="text-center text-sm text-muted-foreground pb-4">
          &copy; {new Date().getFullYear()} Bitmutex Technologies
        </footer>
      </Card>
    </main>
  );
};

export default StatusPage;