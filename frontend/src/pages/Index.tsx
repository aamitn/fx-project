
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import InsulationDetails from "@/components/InsulationDetails";
import InsulationLayers from "@/components/InsulationLayers";
import Calculations from "@/components/Calculations";
import InsulationPreview from "@/components/InsulationPreview";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Users, Calculator } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("CALCULATIONS");

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        username="AMIT N"
        lastSaved="Apr 28, 2:15 PM" 
      />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <div className="flex-1 p-4 overflow-y-auto">
          {activeTab === "CALCULATIONS" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <InsulationDetails />
                <InsulationLayers />
                <Calculations />
              </div>
              
              <div className="lg:col-span-1">
                <InsulationPreview />
              </div>
            </div>
          )}
          
          {activeTab === "MATERIALS" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-app-blue" />
                <h2 className="text-2xl font-bold">Materials Database</h2>
              </div>
              <p className="text-gray-600 mb-4">
                This section contains a comprehensive database of insulation materials with their thermal properties.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <Card className="p-4 border border-gray-200">
                  <h3 className="font-medium">Fiberglass Insulation</h3>
                  <p className="text-sm text-gray-500">ASTM C553-13</p>
                  <div className="mt-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span>Thermal Conductivity:</span>
                      <span>0.040 W/m·K</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span>Density:</span>
                      <span>16-48 kg/m³</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span>Temperature Range:</span>
                      <span>-18°C to 232°C</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 border border-gray-200">
                  <h3 className="font-medium">Mineral Wool</h3>
                  <p className="text-sm text-gray-500">ASTM C612-14</p>
                  <div className="mt-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span>Thermal Conductivity:</span>
                      <span>0.033 W/m·K</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span>Density:</span>
                      <span>40-200 kg/m³</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span>Temperature Range:</span>
                      <span>-40°C to 650°C</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 border border-gray-200">
                  <h3 className="font-medium">Polyurethane Foam</h3>
                  <p className="text-sm text-gray-500">ASTM C591-17</p>
                  <div className="mt-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span>Thermal Conductivity:</span>
                      <span>0.022 W/m·K</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span>Density:</span>
                      <span>32-48 kg/m³</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span>Temperature Range:</span>
                      <span>-73°C to 149°C</span>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          )}
          
          {activeTab === "TEAMS" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-app-blue" />
                <h2 className="text-2xl font-bold">Team Collaboration</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                Work together with your team on insulation projects. Invite team members, assign roles, and track contributions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border border-gray-200">
                  <h3 className="font-medium">Project Members</h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-app-blue text-white flex items-center justify-center mr-2">
                          A
                        </div>
                        <span>Amit N. (You)</span>
                      </div>
                      <span className="text-xs bg-app-blue text-white px-2 py-1 rounded">Admin</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center mr-2">
                          J
                        </div>
                        <span>John D.</span>
                      </div>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Editor</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center mr-2">
                          S
                        </div>
                        <span>Sarah M.</span>
                      </div>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Viewer</span>
                    </li>
                  </ul>
                  <Button variant="outline" size="sm" className="mt-4 w-full">Invite Team Members</Button>
                </Card>
                
                <Card className="p-4 border border-gray-200 md:col-span-2">
                  <h3 className="font-medium">Recent Activity</h3>
                  <ul className="mt-2 space-y-3">
                    <li className="text-sm border-l-2 border-app-blue pl-3">
                      <div className="font-medium">Project created</div>
                      <div className="text-gray-500">Amit N. • Apr 28, 2:00 PM</div>
                    </li>
                    <li className="text-sm border-l-2 border-app-orange pl-3">
                      <div className="font-medium">Calculation parameters updated</div>
                      <div className="text-gray-500">Amit N. • Apr 28, 2:10 PM</div>
                    </li>
                    <li className="text-sm border-l-2 border-green-500 pl-3">
                      <div className="font-medium">Insulation layer added</div>
                      <div className="text-gray-500">Amit N. • Apr 28, 2:15 PM</div>
                    </li>
                  </ul>
                  <Button variant="ghost" size="sm" className="mt-4 text-app-blue">View Full History</Button>
                </Card>
              </div>
            </Card>
          )}
          

         <Footer />

        </div>
      </div>
    </div>
  );
};

export default Index;
