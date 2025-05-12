import React from 'react';
import { motion } from 'framer-motion';
import ResponsiveWrapper from './ResponsiveWrapper';

const VerticalPage = ({ children }) => {
  return (
    <ResponsiveWrapper>
      <div className="vertical-page">
        {children}
      </div>
    </ResponsiveWrapper>
  );
};

export default VerticalPage;
