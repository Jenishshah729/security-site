import React from 'react';
import { Laptop, Mouse, Keyboard, Terminal, Code, WifiHigh, Bug, Shield, Cpu, Database } from '@phosphor-icons/react';
import { motion } from 'motion/react';

const icons = [Laptop, Mouse, Keyboard, Terminal, Code, WifiHigh, Bug, Shield, Cpu, Database];

const BackgroundDoodles = () => {
  // Generate random positions, scales, and animation durations for a bunch of doodles
  const doodles = Array.from({ length: 50 }).map((_, i) => {
    const Icon = icons[i % icons.length];
    const left = `${Math.random() * 100}%`;
    const top = `${Math.random() * 100}%`;
    const size = Math.random() * 40 + 20; // 20px to 60px
    const duration = Math.random() * 15 + 10; // 10s to 25s (slightly faster)
    const delay = Math.random() * -20; // Start at random point in animation
    const opacity = Math.random() * 0.2 + 0.05; // 0.05 to 0.25
    
    return { id: i, Icon, left, top, size, duration, delay, opacity };
  });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {doodles.map((doodle) => (
        <motion.div
          key={doodle.id}
          className="absolute text-white"
          style={{
            left: doodle.left,
            top: doodle.top,
            opacity: doodle.opacity,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: doodle.duration,
            repeat: Infinity,
            ease: "linear",
            delay: doodle.delay,
          }}
        >
          <doodle.Icon size={doodle.size} weight="duotone" />
        </motion.div>
      ))}
    </div>
  );
};

export default BackgroundDoodles;
