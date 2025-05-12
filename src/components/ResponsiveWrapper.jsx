import React from 'react';

export default function ResponsiveWrapper({ vertical, horizontal }) {
  return (
    <div className="w-full h-full">
      <div className="block lg:hidden">{vertical}</div>
      <div className="hidden lg:block">{horizontal}</div>
    </div>
  );
}
