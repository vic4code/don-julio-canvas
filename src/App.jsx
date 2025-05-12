import React, { useEffect } from 'react';
import MenuPager from './components/MenuPager';
import './index.css';

const App = () => {
  useEffect(() => {
    // 添加viewport meta標籤以確保移動設備上的適當縮放
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <div className="app">
      <MenuPager />
    </div>
  );
};

export default App;
