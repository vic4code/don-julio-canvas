import React, { useState, useRef, useEffect } from 'react';
import { menuPages } from '../menuData';
import { AnimatePresence, motion } from 'framer-motion';
import ResponsiveWrapper from './ResponsiveWrapper';

const images = import.meta.glob('../assets/*.svg', { eager: true, as: 'url' });

// 統一淡入效果
const fadeInConfig = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

// 優化呼吸動畫效果
const imgBreath = {
  animate: {
    scale: [1, 1.03, 1],
    y: [0, -3, 0],
    opacity: [1, 0.99, 1],
    transition: { 
      duration: 3, 
      repeat: Infinity, 
      repeatType: 'reverse', 
      ease: 'easeInOut',
      repeatDelay: 0.2
    }
  }
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

export default function MenuPager() {
  const [[page, direction], setPage] = useState([0, 0]);
  const numPages = menuPages.length;
  const pageData = menuPages[page];
  const containerRef = useRef(null);

  // 移除所有打字相關的狀態
  const [showPage3BottomTexts, setShowPage3BottomTexts] = useState(true);

  // 每次切換頁面時都立即顯示所有內容
  useEffect(() => {
    setShowPage3BottomTexts(true);
  }, [page]);

  // 滑動/拖曳事件
  const paginate = (newDirection) => {
    setPage(([p]) => {
      let next = (p + newDirection + numPages) % numPages;
      return [next, newDirection];
    });
  };

  // 觸控
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) paginate(-1);
    else if (delta < -50) paginate(1);
    touchStartX.current = null;
  };

  // 桌機滑鼠拖曳
  const dragStartX = useRef(null);
  const handleMouseDown = (e) => {
    dragStartX.current = e.clientX;
  };
  const handleMouseUp = (e) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (delta > 50) paginate(-1);
    else if (delta < -50) paginate(1);
    dragStartX.current = null;
  };

  // 轉場動畫 variants
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  // 圖片動畫
  const imgVariants = {
    initial: { scale: 0.8, opacity: 0, y: 40 },
    animate: { scale: 1, opacity: 1, y: 0, transition: { duration: 0.8, type: 'spring' } }
  };

  // 美化箭頭 SVG - 極簡版本
  const ArrowSVG = ({ left, onClick }) => (
    <button
      type="button"
      aria-label={left ? 'Previous' : 'Next'}
      onClick={onClick}
      className={`absolute top-1/2 ${left ? 'left-3' : 'right-3'} z-20 select-none rounded-full p-1.5 hover:bg-gray-100/50 transition-colors`}
      style={{ 
        pointerEvents: 'auto', 
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.5)'
      }}
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d={left ? "M17 7L10 14L17 21" : "M11 7L18 14L11 21"} 
          stroke="#222" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </button>
  );

  // 鍵盤左右鍵切換
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'ArrowRight') paginate(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const beanImgs = [
    <motion.img key="black" src={images['../assets/black_beans.svg']} alt="black" className="bean-img" variants={imgBreath} initial="initial" animate="animate" />,
    <motion.img key="soy" src={images['../assets/soy_beans.svg']} alt="soy" className="bean-img" variants={imgBreath} initial="initial" animate="animate" />,
    <motion.img key="mung" src={images['../assets/mung_beans.svg']} alt="mung" className="bean-img" variants={imgBreath} initial="initial" animate="animate" />
  ];

  // 每頁內容（統一淡入效果）
  const renderPage = () => {
    if (page === 0) {
      const imageUrl = images[`../assets/${pageData.image}`];
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 pt-8 pb-4">
          <motion.img
            src={imageUrl}
            alt={pageData.title}
            className="w-[340px] h-[340px] object-contain mb-4"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ zIndex: 1 }}
          />
          <div className="w-full text-center">
            <motion.div 
              {...fadeInConfig}
              className="text-5xl md:text-6xl font-extrabold font-space mb-3"
            >
              {pageData.title}
            </motion.div>
            <motion.div
              {...fadeInConfig}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl md:text-3xl font-normal font-space mt-2"
            >
              like blending dressing into a salad.
            </motion.div>
          </div>
        </div>
      );
    }
    if (page === 1) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 pt-4 pb-4">
          {/* 上半部文字 */}
          <motion.div 
            {...fadeInConfig}
            className="text-xl font-normal font-space mb-2 text-center"
          >
            <div>I combined three colors of local beans from</div>
            <div className="font-extrabold text-6xl">Canada and Taiwan,</div>
            <div>boosts the protein.</div>
          </motion.div>
          
          {/* 豆子圖片區 */}
          <div className="flex justify-center items-center gap-10 my-10">
            {beanImgs.map((bean, index) => (
              <motion.div 
                key={index}
                className="scale-150 md:scale-[1.75]"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1.5 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                {bean}
              </motion.div>
            ))}
          </div>
          
          {/* 底部文字 */}
          <motion.div 
            {...fadeInConfig}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 text-center"
          >
            <div className="text-lg font-normal font-space">
              And add salt brings out a richer soy flavor, and triggers <span className='font-extrabold text-4xl'>emulsification.</span>
            </div>
          </motion.div>
        </div>
      );
    }
    if (page === 2) {
      return (
        <div className="relative flex flex-col justify-center items-center min-h-screen bg-white overflow-hidden">
          {/* 左上香草 */}
          <motion.img
            src={images['../assets/lemon_balm.svg']}
            alt="lemon_balm"
            className="absolute w-[64vw] max-w-[580px] left-[-13vw] top-[-20vw] z-0"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />

          {/* 煙霧 */}
          <motion.img
            src={images['../assets/smoke.svg']}
            alt="smoke"
            className="absolute w-[20vw] max-w-[240px] right-[10vw] top-[55%] z-1"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />
          <motion.img
            src={images['../assets/smoke.svg']} 
            alt="smoke"
            className="absolute w-[20vw] max-w-[240px] left-[5vw] top-[35%] z-1"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />

          {/* 右側蘆筍群組 */}
          <motion.img
            src={images['../assets/asparagus.svg']}
            alt="asparagus1"
            className="absolute w-[40vw] max-w-[360px] right-[-10vw] top-[20%] z-2"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />
          <motion.img
            src={images['../assets/asparagus.svg']}
            alt="asparagus2"
            className="absolute w-[20vw] max-w-[360px] right-[-24vw] top-[35%] z-2"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />
          <motion.img
            src={images['../assets/asparagus.svg']}
            alt="asparagus3"
            className="absolute w-[30vw] max-w-[360px] right-[-30vw] top-[50%] z-2"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />

          {/* 左下香草 */}
          <motion.img
            src={images['../assets/verbena.svg']}
            alt="verbena"
            className="absolute w-[70vw] max-w-[580px] left-[-20vw] bottom-[-35vw] z-0"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />

          {/* 文字區塊 */}
          <div className="relative z-20 w-full max-w-[360px] md:max-w-[480px] mx-auto text-center px-4">
            <motion.div 
              {...fadeInConfig}
              className="backdrop-blur-[1px] p-2 rounded-lg text-shadow-light"
            >
              <div className="text-xl font-normal font-space mb-2 text-center md:text-2xl">
                Using heat to bring out
              </div>
              <div className="text-2xl md:text-4xl font-normal mb-8 text-center">
                the natural <span className="font-extrabold text-5xl md:text-7xl">charred aroma</span> of asparagus, then infusing it into juice.
              </div>
              <div className="text-xl md:text-2xl font-normal font-space text-center mt-20">
                And add fresh herbs<br/>infuse together to create<br/>the flavor of a <span className="font-extrabold text-5xl md:text-7xl">Warm Salad.</span>
              </div>
            </motion.div>
          </div>
        </div>
      );
    }
    if (page === 3) {
      return (
        <div className="relative flex flex-col justify-between h-screen bg-white px-4 pt-8 pb-8 overflow-hidden">
          {/* 插圖：右上 beetroot、左下 cabbage、右中 grapes */}
          <motion.img
            src={images['../assets/beetroot.svg']}
            alt="beetroot"
            className="w-40 md:w-48 absolute right-0 top-0 z-10"
            variants={imgBreath}
            initial="initial"
            animate="animate"
          />
          <motion.img
            src={images['../assets/purple_cabbage.svg']}
            alt="purple_cabbage"
            className="w-55 md:w-96 absolute left-[-22vw] bottom-0 z-10"
            variants={imgBreath}
            initial="initial"
            animate="animate"
          />
          <motion.img
            src={images['../assets/frozen_grapes.svg']}
            alt="frozen_grapes"
            className="w-30 md:w-[32rem] absolute right-2 top-[35%] z-20"
            variants={imgBreath}
            initial="initial"
            animate="animate"
          />

          {/* 使用文字陰影增加可讀性 */}
          <div className="relative z-30 w-full h-full flex flex-col justify-between">
            {/* 頂部文字區域 */}
            <div className="top-section pt-4 md:pt-8">
              <motion.div
                {...fadeInConfig}
              >
                <div className="text-2xl md:text-3xl font-space font-normal leading-tight text-left">
                  <span className="text-shadow-strong">On top like a</span>
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-5xl md:text-7xl block leading-tight text-shadow-strong">salad dressing</span>
                </div>
                <div className="text-2xl md:text-3xl font-space font-normal leading-tight text-left">
                  <span className="text-shadow-strong">, floating</span>
                </div>
                <div className="text-2xl md:text-3xl font-space font-normal leading-tight text-left mt-4">
                  <span className="text-shadow-strong">combines purple cabbage, beetroot, Don Julio Reposado,</span>
                </div>
                <div className="text-2xl md:text-3xl font-space font-normal leading-tight text-left">
                  <span className="text-shadow-strong">and Ice Wine of Cabernet.</span>
                </div>
              </motion.div>
            </div>
            
            {/* 底部文字區域 */}
            <div className="bottom-section mb-8 md:mb-16 mt-auto">
              <motion.div
                {...fadeInConfig}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="text-right max-w-[15rem] md:max-w-[18rem] ml-auto">
                  <span className="font-normal text-2xl md:text-3xl text-shadow-strong">Pillitteri's</span><br/>
                  <span className="font-extrabold text-5xl md:text-7xl block leading-tight text-shadow-strong">late<br/>harvest</span>
                </div>
                <div className="text-right max-w-[15rem] md:max-w-[18rem] ml-auto">
                  <span className="font-normal text-xl md:text-2xl text-shadow-strong">icewine,</span><br/>
                  <span className="font-normal text-xl md:text-2xl text-shadow-strong">made from Cabernet grapes,<br/>is rich in red berry flavors.</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      );
    }
    if (page === 4) {
      return (
        <div className="flex flex-col min-h-screen bg-white px-4 pt-6 pb-16 relative overflow-hidden">
          {/* 瓶子圖 */}
          <motion.img
            src={images['../assets/don_julio_blanco.svg']}
            alt="don_julio_blanco"
            className="absolute bottom-0 right-[2%] w-[65vw] max-w-[420px] h-[55vh] min-h-[320px] z-10 iphone-se-bottle"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, type: 'spring' }}
            style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
          />
          {/* 內容區域 */}
          <div className="flex-1 z-20 pr-[26vw] md:pr-[25vw] lg:pr-[22vw] flex flex-col iphone-se-content">
            <motion.div
              {...fadeInConfig}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center w-full max-w-2xl mb-3 md:mb-6 md:gap-4">
                <img 
                  src={images['../assets/plant_based_logo.svg']} 
                  alt="plant-based-logo"
                  className="w-12 h-12 md:w-20 md:h-20 mb-1 md:mb-0 md:mr-4 flex-shrink-0 z-20" 
                />
                <div className="flex flex-col justify-center w-full">
                  <span className="font-extrabold text-shadow-strong text-[clamp(2.2rem,7vw,5rem)] md:text-[clamp(4rem,8vw,6rem)] leading-tight block">Planta Mood</span>
                </div>
              </div>
              <span className="font-normal text-shadow-strong text-[clamp(1rem,3vw,1.8rem)] md:text-[clamp(1.5rem,2.5vw,2.2rem)] leading-snug block max-w-2xl mb-3 md:mb-8">
                The idea comes from plant-based. Bringing a natural feeling and creating a deeper connection to the senses.
              </span>
              <div className="w-full max-w-2xl text-left mt-3 md:mt-8 mb-1 md:mb-3">
                <span className="font-normal text-shadow-strong text-[clamp(1rem,3vw,1.8rem)] md:text-[clamp(1.5rem,2.5vw,2.2rem)] block">
                  Inspired by<br />the idea of a
                </span>
              </div>
              <span className="font-extrabold text-shadow-strong text-[clamp(2.2rem,7vw,5rem)] md:text-[clamp(4rem,8vw,6rem)] leading-tight block mb-1 md:mb-3">
                warm<br />salad,
              </span>
              <span className="font-normal text-shadow-strong text-[clamp(1rem,3vw,1.8rem)] md:text-[clamp(1.5rem,2.5vw,2.2rem)] block leading-tight mt-1 md:mt-3 mb-12">
                this cocktail combines grilled asparagus, fresh herbs, and soy whey from both Canada and Taiwan.
              </span>
            </motion.div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveWrapper>
      <div className="menu-pager">
        <div
          ref={containerRef}
          className="relative w-full h-screen overflow-hidden bg-white"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          style={{ touchAction: 'pan-y' }}
        >
          {/* 左右箭頭提示 */}
          <ArrowSVG left onClick={() => paginate(-1)} />
          <ArrowSVG onClick={() => paginate(1)} />
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute w-full h-full top-0 left-0"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <style jsx>{`
        :root {
          --page-padding-large: 100px;
          --page-padding-medium: 50px;
          --page-padding-small: 30px;
          --font-size-large: 1em;
          --font-size-medium: 0.9em;
          --font-size-small: 0.8em;
        }
        
        .page3 .topText {
          position: absolute;
          top: 100px;
          left: 100px;
          right: 100px;
          z-index: 2;
        }
        
        @media (max-width: 380px) {
          .page3 .topText {
            top: 60px;
            left: 30px;
            right: 30px;
          }
          
          .page3 .bottomText {
            bottom: 60px;
            left: 30px;
            right: 30px;
          }
        }
        
        .page4 .bottomText {
          position: absolute;
          bottom: 100px;
          left: 100px;
          right: 100px;
          z-index: 2;
        }
        
        @media (max-width: 380px) {
          .page4 .bottomText {
            bottom: 40px;
            left: 30px;
            right: 30px;
            font-size: 0.9em;
          }
        }
        
        // 通用 RWD 設定
        @media (max-width: 768px) {
          .page .mainText {
            font-size: 0.9em;
          }
          
          .page .topText, .page .bottomText {
            left: 50px;
            right: 50px;
          }
        }
        
        @media (max-width: 480px) {
          .page .mainText {
            font-size: 0.8em;
          }
          
          .page .topText {
            top: 70px;
            left: 30px;
            right: 30px;
          }
          
          .page .bottomText {
            bottom: 70px;
            left: 30px;
            right: 30px;
          }
          
          .top-section {
            padding-top: 1rem;
          }
          
          .top-section .text-5xl {
            font-size: 3rem;
          }
          
          .top-section .text-2xl {
            font-size: 1.4rem;
          }
          
          .bottom-section {
            margin-bottom: 0.5rem;
          }
          
          .bottom-section .text-4xl {
            font-size: 2.5rem;
          }
          
          .bottom-section .text-xl {
            font-size: 1rem;
          }
          
          // page4 特殊處理
          .page4 img.don_julio_blanco {
            height: 45vh;
            min-height: 220px;
          }
        }
        
        /* 特別針對 iPhone SE 尺寸的優化 */
        @media (max-width: 375px) and (max-height: 667px) {
          /* 專門針對 page4 */
          .iphone-se-bottle {
            width: 36vw !important; 
            height: 38vh !important;
            min-height: 180px !important;
            right: 0 !important;
            bottom: 10px !important;
          }
          
          .iphone-se-content {
            padding-right: 22vw !important;
            padding-bottom: 70px !important;
          }
          
          /* 減少段落間距 */
          .mb-3 {
            margin-bottom: 0.5rem !important;
          }
          
          .mt-3 {
            margin-top: 0.5rem !important;
          }
          
          /* 增加底部最後一段的 margin */
          .mb-12 {
            margin-bottom: 5rem !important;
          }
        }
      `}</style>
    </ResponsiveWrapper>
  );
} 