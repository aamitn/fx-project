
import { Button } from "@/components/ui/button";
import { PlusIcon, Edit2Icon, ChevronUp, FolderIcon } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-56 bg-app-blue text-white min-h-screen">
      <div className="p-4 border-b border-app-blue-dark">
        <div className="flex justify-between items-center">
          <h2 className="font-medium">Favorites</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white opacity-80 hover:opacity-100">
              <PlusIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white opacity-80 hover:opacity-100">
              <Edit2Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div>
        <div className="py-2 px-4 bg-app-blue-dark hover:bg-app-blue transition cursor-pointer">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FolderIcon className="h-4 w-4 mr-2" />
              <span className="font-medium">MyProject</span>
            </div>
            <ChevronUp className="h-5 w-5" />
          </div>
        </div>
        
        <div className="text-sm bg-app-blue-dark bg-opacity-50">
          <div className="py-2 px-6 hover:bg-app-blue-dark transition cursor-pointer border-l-2 border-app-orange">
            <div>Default (current)</div>
            <div className="text-xs opacity-70">Tank Shell - Horizontal / Even Increment</div>
          </div>
        </div>
        
        <div className="p-2 pl-4">
          <Button variant="ghost" size="sm" className="w-full justify-start text-white opacity-80 hover:opacity-100 hover:bg-app-blue-dark">
            <PlusIcon className="h-4 w-4 mr-2" />
            <span>ADD SCENARIO</span>
          </Button>
        </div>

        <div className="mt-4 p-2 pl-4">
          <Button variant="ghost" size="sm" className="w-full justify-start text-white opacity-80 hover:opacity-100 hover:bg-app-blue-dark">
            SEE ALL PROJECTS
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
