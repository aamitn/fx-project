// Header.tsx
import { Button } from "@/components/ui/button";
import { User, ChevronDown, LogOut, Settings, Contact2 } from "lucide-react";
import Logo from "./Logo";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

type HeaderProps = {
    activeTab: string;
    onTabChange: (tab: string) => void;
    username?: string;
    lastSaved?: string;
    onLogout?: () => void;
    tabs?: string[];
    isAdmin?: boolean;
};

const Header = ({
    activeTab,
    onTabChange,
    username = "Guest",
    lastSaved = "just now",
    onLogout,
    // Changed "TEAMS" to "DOCS" here
    tabs = ["CALCULATIONS", "MATERIALS", "DOCS"], 
    isAdmin = false,
}: HeaderProps) => {

    const allTabs = [...tabs, ...(isAdmin ? ["ADMIN PANEL"] : [])];

    return (
        <header className="bg-white shadow-sm py-3 px-4 sticky top-0 z-10">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <Logo />

                    <nav>
                        <ul className="flex">
                            {allTabs.map((tab) => (
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="bg-app-blue text-white hover:bg-app-blue-dark flex items-center"
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    {username}
                                    <ChevronDown className="h-4 w-4 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link to="/profile" className="cursor-pointer flex items-center">
                                        <Contact2 className="h-4 w-4 mr-2" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/2fa-management" className="cursor-pointer flex items-center">
                                        <Settings className="h-4 w-4 mr-2" />
                                        <span>Manage 2FA</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onLogout} className="cursor-pointer flex items-center">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;