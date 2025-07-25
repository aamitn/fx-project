import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const Stats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { number: 50000, suffix: '+', label: 'Engineers Trust Us', delay: 0 },
    { number: 99.9, suffix: '%', label: 'Uptime Reliability', delay: 0.2 },
    { number: 200, suffix: '+', label: 'Global Companies', delay: 0.4 },
    { number: 24, suffix: '/7', label: 'Expert Support', delay: 0.6 }
  ];

  const AnimatedNumber = ({ number, suffix, delay }: { number: number; suffix: string; delay: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (isInView) {
        const timer = setTimeout(() => {
          const increment = number / 50;
          const counter = setInterval(() => {
            setCount(prev => {
              if (prev >= number) {
                clearInterval(counter);
                return number;
              }
              return Math.min(prev + increment, number);
            });
          }, 30);
          return () => clearInterval(counter);
        }, delay * 1000);
        return () => clearTimeout(timer);
      }
    }, [isInView, number, delay]);

    return (
      <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {Math.floor(count)}{suffix}
      </span>
    );
  };

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join the global community of engineers who rely on FurnXpert for mission-critical insulation calculations
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.6, delay: stat.delay }}
              className="text-center group"
            >
              <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <AnimatedNumber number={stat.number} suffix={stat.suffix} delay={stat.delay} />
              </div>
              <p className="text-lg font-medium text-gray-700">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;