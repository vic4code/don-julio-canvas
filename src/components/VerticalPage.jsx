import React from 'react';
import { motion } from 'framer-motion';

export default function VerticalPage({ name }) {
  return (
    <motion.div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
      <motion.img
        src={`/src/assets/${name}_v.svg`}
        alt={`${name} vertical`}
        className="w-full mb-4"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
      />
    </motion.div>
  );
}
