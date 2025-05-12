import React from 'react';
import { motion } from 'framer-motion';

export default function HorizontalPage({ name }) {
  return (
    <motion.div className="bg-white rounded-lg shadow-lg p-6 flex flex-row items-center">
      <motion.img
        src={`/src/assets/${name}_h.svg`}
        alt={`${name} horizontal`}
        className="w-1/2 mb-4"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
      />
    </motion.div>
  );
}
