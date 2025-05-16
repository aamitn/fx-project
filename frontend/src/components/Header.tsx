
import { Button } from "@/components/ui/button";
import { User, ChevronDown } from "lucide-react";
import Logo from "./Logo";

type HeaderProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  username?: string;
  lastSaved?: string;
};

const Header = ({ activeTab, onTabChange, username = "Guest", lastSaved = "just now" }: HeaderProps) => {
  const tabs = ["CALCULATIONS", "MATERIALS", "TEAMS"];
  
  return (
    <header className="bg-white shadow-sm py-3 px-4 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Logo />
          
          <nav>
            <ul className="flex">
              {tabs.map((tab) => (
                <li key={tab}>
                  <button
                    className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => onTabChange(tab)}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Last saved: {lastSaved}</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="bg-app-blue text-white hover:bg-app-blue-dark flex items-center"
            >
              <User className="h-4 w-4 mr-2" />
              {username}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
