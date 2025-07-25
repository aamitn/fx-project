import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useAuth } from "../../contexts/AuthContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 30); // Trigger scroll effect when scrolled past 30px
    });
    return () => unsubscribe();
  }, [scrollY]);

  // Background color changes from fully transparent to slightly opaque white
  const headerBackground = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.95)"] // Starts transparent, becomes almost opaque white for light Mica
  );

  const headerPadding = useTransform(
    scrollY,
    [0, 50],
    ["1.25rem", "0.75rem"] // From py-5 (20px) to py-3 (12px)
  );

  // New: Mica effect noise background
  // This SVG generates a subtle fractal noise pattern.
  // The opacity='0.02' is key for a very faint effect.
  const micaNoiseSvg = `data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E`;

  const micaNoiseBackground = useTransform(
    scrollY,
    [0, 50],
    ["none", `url("${micaNoiseSvg}")`] // Apply noise only when scrolled
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: headerBackground,
        paddingTop: headerPadding,
        paddingBottom: headerPadding,
        // Frosted glass effect properties
        backdropFilter: isScrolled ? 'blur(2px) saturate(180%)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(2px) saturate(180%)' : 'none', // For Safari compatibility
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.4)' : 'none', // Border only when scrolled
        // Mica noise properties
        backgroundImage: micaNoiseBackground,
        backgroundSize: '100px 100px', // Adjust size for better noise pattern
        backgroundBlendMode: 'overlay', // This helps blend the noise with the background color
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        className="container mx-auto flex justify-between items-center px-6"
        animate={{
          scale: isScrolled ? 0.95 : 1,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <motion.div
          animate={{
            scale: isScrolled ? 0.85 : 1,
            x: isScrolled ? -5 : 0,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Logo />
        </motion.div>

        <motion.div
          className="flex gap-4"
          animate={{
            opacity: isScrolled ? 0.8 : 1,
            y: isScrolled ? -2 : 0,
          }}
          transition={{ duration: 0.4 }}
        >
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  className="text-white hover:text-white bg-app-blue hover:bg-app-blue-dark shadow-lg transition-all duration-300 ease-out"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="transition-all hover:text-white duration-300 ease-out"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth?tab=login">
                <Button
                  variant="outline"
                  className=" border-app-blue text-app-blue hover:bg-app-blue/10 transition-all duration-300 ease-out"
                >
                  Login
                </Button>
              </Link>
              <Link to="/auth?tab=signup">
                <Button
                  variant="ghost"
                  className="text-white hover:text-white bg-app-blue hover:bg-app-blue-dark shadow-lg transition-all duration-300 ease-out"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </motion.div>
      </motion.div>
    </motion.header>
  );
};

export default Navigation;