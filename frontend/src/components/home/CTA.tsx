import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from 'framer-motion';

const CTA = () => {
  const { isAuthenticated } = useAuth();

  return (
    <motion.section
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative py-24 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Revolutionize</span><br />
            Your <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Thermal Engineering </span> Game?
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join 50,000+ engineers who've already transformed their workflow. 
            Start your free trial today and experience the future of thermal design.
          </p>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Text Content */}
            <div className="text-left">
              <div className="flex flex-col gap-6">
                <Link to={isAuthenticated ? "/dashboard" : "/auth?tab=signup"}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-app-blue to-app-orange hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-12 rounded-full shadow-2xl border-0 text-lg"
                    >
                      {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                      <span className="ml-2">🚀</span>
                    </Button>
                  </motion.div>
                </Link>
                
                <p className="text-blue-200 text-lg">
                  See how our platform transforms thermal engineering workflows in just 3 minutes.
                </p>
              </div>
            </div>

            {/* Video Content */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl"
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto rounded-2xl"
                  poster="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop"
                >
                  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </motion.div>
            </div>
          </div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">14 Days</div>
              <div className="text-blue-200">Free Trial</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">No Setup</div>
              <div className="text-blue-200">Ready in Minutes</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">Cancel</div>
              <div className="text-blue-200">Anytime</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CTA;