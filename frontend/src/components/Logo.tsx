
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <div className="h-8 w-8 rounded-md bg-app-blue-dark flex items-center justify-center mr-2">
        <span className="text-white text-xs font-bold">FX</span>
      </div>
      <span className="text-app-blue text-xl font-bold">
        <span className="text-app-orange">Furn</span>Xpert
      </span>
    </div>
  );
};

export default Logo;
