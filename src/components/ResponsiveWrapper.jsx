import React, { useEffect, useState } from 'react';

const ResponsiveWrapper = ({ children }) => {
  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 576) {
        setDeviceType('mobile');
      } else if (width < 992) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    // 初始檢查
    handleResize();

    // 監聽窗口調整大小事件
    window.addEventListener('resize', handleResize);
    
    // 清理函數
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`responsive-wrapper device-${deviceType}`}>
      {children}
    </div>
  );
};

export default ResponsiveWrapper;
