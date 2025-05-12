import React from 'react';
import { motion } from 'framer-motion';
import ResponsiveWrapper from './ResponsiveWrapper';

const HorizontalPage = ({ children }) => {
  return (
    <ResponsiveWrapper>
      <div className="horizontal-page">
        {children}
      </div>
    </ResponsiveWrapper>
  );
};

export default HorizontalPage;
