import { useState, useEffect } from 'react';

const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every 1000 milliseconds (1 second)

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs only once after the initial render

  return (
    <div>
      <div className="text-center text-xs text-gray-500 mt-8">
        Copyleft {currentTime.getFullYear()} &#x1F12F;, <b>Bitmutex Technologies</b> | 
		Some Rights Reserved | 
		<a href="">GNU GPL v3</a>
      </div>
      <div className="text-center text-xs text-gray-500 mt-2">
        <b>System Time</b> : {currentTime.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          timeZoneName: 'short',
        })}
      </div>
    </div>
  );
};

export default Footer;
