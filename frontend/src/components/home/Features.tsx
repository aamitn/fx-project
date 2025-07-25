import { Calculator, Users, Database, Zap, Shield, BarChart3, Cog, Globe } from "lucide-react";
import { motion, type Variants, type Transition } from 'framer-motion'; // Import Variants and Transition types
import React from 'react';

// Define variants for the container to orchestrate staggered animations
const containerVariants: Variants = { // Explicitly type as Variants
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Define variants for individual feature cards
const itemVariants: Variants = { // Explicitly type as Variants
  hidden: { opacity: 0, y: 50 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: [0, 0, 0.2, 1] // Changed "easeOut" string to its cubic-bezier array equivalent
    } as Transition // Cast to Transition to satisfy TypeScript, ensuring 'ease' is correctly typed
  }
};

const Features: React.FC = () => {
  const features = [
    {
      icon: Calculator,
      title: "AI-Powered Calculations",
      description: "Advanced algorithms perform complex thermal calculations with 99.9% accuracy, reducing design time by 70%.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Database,
      title: "Smart Material Database", 
      description: "Access 10,000+ certified materials with real-time property updates and intelligent material suggestions.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Global Collaboration",
      description: "Real-time collaborative workspace with version control, comments, and seamless team coordination.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process complex simulations in seconds, not hours. Optimized for performance at enterprise scale.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Industry Compliance",
      description: "Built-in compliance checking for ASME, API, and international standards with automatic updates.",
      color: "from-red-500 to-rose-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive reporting with 3D visualizations, cost analysis, and performance optimization insights.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <motion.section
      className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="container mx-auto px-6">
      <motion.div 
          className="text-center mb-20"
          variants={itemVariants}
        >
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            🚀 Cutting-Edge Technology
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Why Choose {  }
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Furn</span>
            <span  className="bg-gradient-to-r from-app-blue to-blue-400 bg-clip-text text-transparent" >Xpert</span>
            ?
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Experience the future of thermal engineering with our revolutionary platform that combines 
            AI intelligence, industry expertise, and user-centric design.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative p-8 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500"
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
              
              {/* Icon with Gradient Background */}
              <div className={`relative inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                {feature.description}
              </p>

              {/* Hover Effect Arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <span className="text-white font-bold">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Feature Highlights */}
        <motion.div 
          className="mt-20 grid md:grid-cols-3 gap-8 text-center"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cog className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">99.9% Uptime</h4>
            <p className="text-gray-600">Enterprise-grade reliability you can count on</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Global Support</h4>
            <p className="text-gray-600">24/7 expert assistance in 12+ languages</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Bank-Level Security</h4>
            <p className="text-gray-600">SOC 2 compliant with end-to-end encryption</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Features;