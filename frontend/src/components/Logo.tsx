import React from 'react';

const Logo: React.FC = () => {
  return (
    <a 
      href="/" 
      // Enhanced hover effect with scale and subtle lift, plus transition
      className="group no-underline text-inherit cursor-pointer 
                 transition-all duration-300 ease-in-out 
                 hover:scale-[1.03] hover:-translate-y-0.5" 
    >
      <div className="flex items-center">
        {/* Slightly larger, with shadow for depth */}
        <div className="h-9 w-9 rounded-md bg-app-blue-dark flex items-center justify-center mr-2 shadow-md 
                        transition-all duration-300 ease-in-out group-hover:shadow-lg">
          {/* Adjusted text size for better balance in the slightly larger box */}
          <span className="text-white text-xl font-bold">F<sub>X</sub></span> 
        </div>
        {/* Slightly larger text for the name for more impact */}
        <span className="text-2xl font-semibold">
          <span className="bg-gradient-to-r from-app-orange to-red-400 bg-clip-text text-transparent">Furn</span>
          <span className="bg-gradient-to-r from-app-blue to-blue-500 bg-clip-text text-transparent">Xpert</span>
        </span>
      </div>
    </a>
  );
};

export default Logo;