import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import SocialIcons from "@/components/SocialIcons";

const HomeFooter = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div className="mb-6 md:mb-0">
            <Logo />
            <p className="text-gray-300 mt-10 max-w-xs">
              Professional insulation system calculator for engineering applications
            </p>
            <SocialIcons />
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/auth" className="text-gray-300 hover:text-white">Login</Link></li>
              <li><Link to="/auth?tab=signup" className="text-gray-300 hover:text-white">Sign Up</Link></li>
              <li><Link to="/status" className="text-gray-300 hover:text-white">Service Status</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800">
          <Footer />
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
