import React, { useState, useRef, useEffect } from 'react';
import { menuPages } from '../menuData';
import { AnimatePresence, motion } from 'framer-motion';

const images = import.meta.glob('../assets/*.svg', { eager: true, as: 'url' });

// 支援 HTML 標籤的 typewriter，整段一起打字
function TypewriterHTML({ html, className = '', typeSpeed = 40, delay = 500, onDone }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    let tag = false;
    let out = '';
    function type() {
      if (i < html.length) {
        if (html[i] === '<') tag = true;
        if (tag) {
          while (i < html.length && html[i] !== '>') out += html[i++];
          if (i < html.length) out += html[i++];
          tag = false;
        } else {
          out += html[i++];
        }
        setDisplayed(out);
        setTimeout(type, tag ? 0 : typeSpeed);
      } else if (onDone) {
        onDone();
      }
    }
    setDisplayed('');
    setTimeout(type, delay);
    // eslint-disable-next-line
  }, [html]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: displayed }} />;
}

// 多段 typewriter 依序顯示
function TypewriterSequenceHTML({ lines, className = '', typeSpeed = 40, delay = 500, onDone, externalStep }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof externalStep === 'number') {
      setStep(externalStep);
    } else {
      setStep(0); // 每次 lines 變動時重置
    }
  }, [lines, externalStep]);

  return (
    <div>
      {lines.slice(0, step).map((line, i) => (
        <div key={i} className={className} dangerouslySetInnerHTML={{ __html: line }} />
      ))}
      {step < lines.length && (
        <TypewriterHTML
          html={lines[step]}
          className={className}
          typeSpeed={typeSpeed}
          delay={delay}
          onDone={() => {
            if (step + 1 === lines.length) {
              onDone && onDone();
            }
            setStep(step + 1);
          }}
        />
      )}
    </div>
  );
}

// 多層 typewriter 依序出現
function SequentialTypewriter({ sections, classNames, typeSpeed = 50, delay = 500 }) {
  const [step, setStep] = useState(0);
  return (
    <div>
      {sections.map((lines, idx) =>
        idx < step ? (
          <TypewriterSequenceHTML
            key={idx}
            lines={lines}
            className={classNames[idx]}
            typeSpeed={typeSpeed}
            delay={delay}
          />
        ) : idx === step ? (
          <TypewriterSequenceHTML
            key={idx}
            lines={lines}
            className={classNames[idx]}
            typeSpeed={typeSpeed}
            delay={delay}
            onDone={() => setStep(step + 1)}
          />
        ) : null
      )}
    </div>
  );
}

function SequentialTypewriterReact({ sections, typeSpeed = 30, delay = 300 }) {
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (step < sections.length) {
      const timer = setTimeout(() => setStep(step + 1), delay + typeSpeed * 10);
      return () => clearTimeout(timer);
    }
  }, [step, sections.length, delay, typeSpeed]);

  return (
    <>
      {sections.slice(0, step + 1).map((el, i) => (
        <React.Fragment key={i}>{el}</React.Fragment>
      ))}
    </>
  );
}

function MultiStepTypewriter({ steps, typeSpeed = 30, delay = 300 }) {
  const [step, setStep] = React.useState(0);

  return (
    <div>
      {/* 已完成的步驟，靜態顯示 */}
      {steps.slice(0, step).map((s, i) => (
        <div key={i} className={s.className} dangerouslySetInnerHTML={{ __html: s.html }} />
      ))}
      {/* 正在打字的步驟 */}
      {step < steps.length && (
        <TypewriterHTML
          html={steps[step].html}
          className={steps[step].className}
          typeSpeed={typeSpeed}
          delay={delay}
          onDone={() => setStep(step + 1)}
        />
      )}
    </div>
  );
}

const imgBreath = {
  animate: {
    scale: [1, 1.08, 1],
    y: [0, -18, 0],
    opacity: [1, 0.97, 1],
    transition: { duration: 3.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
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

  // === page 1 文字顯示進度 ===
  const [beanPageStep, setBeanPageStep] = useState(0);

  // === page 3 下半段顯示狀態 ===
  const [showBottom, setShowBottom] = useState(false);

  // === page 3 文字顯示進度 ===
  const [topStep, setTopStep] = useState(0);
  const topLines = [
    'On top like a',
    '<span class="font-extrabold text-5xl md:text-7xl block leading-tight">salad dressing</span>',
    ', floating',
    'combines purple cabbage , beetroot , Don Julio Reposado ,',
    'and Ice Wine of Cabernet .'
  ];

  // 每次切換頁面時重設
  useEffect(() => {
    setBeanPageStep(0);
    if (page === 3) {
      setShowBottom(false);
      setTopStep(0);
    }
  }, [page]);

  // 豆子頁下半部顯示狀態
  useEffect(() => {
    if (page === 1) setBeanPageStep(0);
  }, [page]);

  // 滑動/拖曳事件
  const paginate = (newDirection) => {
    setPage(([p]) => {
      let next = (p + newDirection + numPages) % numPages;
      // 切到豆子頁時重設 beanPageStep
      if (next === 1) setBeanPageStep(0);
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

  // 美化箭頭 SVG
  const ArrowSVG = ({ left, onClick }) => (
    <button
      type="button"
      aria-label={left ? 'Previous' : 'Next'}
      onClick={onClick}
      className={`absolute top-1/2 ${left ? 'left-4' : 'right-4'} z-20 select-none bg-white/80 shadow-lg rounded-full p-2 hover:scale-110 hover:bg-white/100 transition border border-gray-200`}
      style={{ pointerEvents: 'auto', transform: 'translateY(-50%)' }}
    >
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="21" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
        <path d={left ? "M27 14L19 22L27 30" : "M17 14L25 22L17 30"} stroke="#222" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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

  const beanPageTexts = [
    {
      html: 'I combined three colors of local beans from',
      className: "text-xl font-normal font-space mb-2 text-center"
    },
    {
      html: '<span class="font-extrabold text-6xl">Canada and Taiwan,</span>',
      className: "font-extrabold text-6xl text-center mb-2"
    },
    {
      html: 'boosts the protein.',
      className: "text-xl font-normal font-space mb-6 text-center"
    },
    {
      html: 'And add salt brings out a richer <br>soy flavor, and triggers<br><span class="font-extrabold text-4xl">emulsification.</span>',
      className: "text-lg font-normal font-space text-center mt-2"
    }
  ];

  const beanImgs = [
    <motion.img key="black" src={images['../assets/black_beans.svg']} alt="black" className="bean-img" variants={imgBreath} initial="initial" animate="animate" />,
    <motion.img key="soy" src={images['../assets/soy_beans.svg']} alt="soy" className="bean-img" variants={imgBreath} initial="initial" animate="animate" />,
    <motion.img key="mung" src={images['../assets/mung_beans.svg']} alt="mung" className="bean-img" variants={imgBreath} initial="initial" animate="animate" />
  ];

  // 每頁內容（保留原有排版，主圖用 motion.img，主標題用 Typewriter）
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
            <TypewriterSequenceHTML
              lines={pageData.title}
              className="text-4xl md:text-5xl font-extrabold font-space mb-2"
              typeSpeed={20}
              delay={200}
            />
            <TypewriterSequenceHTML
              lines={pageData.subtitle}
              className="text-xl md:text-2xl font-normal font-space mt-1"
              typeSpeed={20}
              delay={200}
            />
          </div>
        </div>
      );
    }
    if (page === 1) {
      const steps = [
        {
          html: 'I combined three colors of local beans from',
          className: "text-xl font-normal font-space mb-2 text-center"
        },
        {
          html: '<span class="font-extrabold text-6xl">Canada and Taiwan,</span>',
          className: "font-extrabold text-6xl text-center mb-2"
        },
        {
          html: 'boosts the protein.',
          className: "text-xl font-normal font-space mb-6 text-center"
        },
        {
          html: 'And add salt brings out a richer <br>soy flavor, and triggers<br><span class="font-extrabold text-4xl">emulsification.</span>',
          className: "text-lg font-normal font-space text-center mt-2"
        }
      ];

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 pt-4 pb-4">
          <MultiStepTypewriter steps={steps} typeSpeed={30} delay={200} />
          <div className="beans-row mt-12 mb-12" style={{ justifyContent: 'center' }}>
            {beanImgs}
          </div>
        </div>
      );
    }
    if (page === 2) {
      const steps = [
        {
          html: 'Using heat to bring out',
          className: "text-xl font-normal font-space mb-2 text-center md:text-2xl"
        },
        {
          html: 'the natural <span class="font-extrabold text-5xl md:text-7xl">charred aroma</span> of asparagus, then infusing it into juice.',
          className: "font-bold text-2xl md:text-4xl mb-8 text-center"
        },
        {
          html: 'And add fresh herbs<br>infuse together to create<br>the flavor of a <span class="font-extrabold text-5xl md:text-7xl">Warm Salad.</span>',
          className: "text-xl md:text-2xl font-normal font-space text-center mt-12"
        }
      ];

      return (
        <div className="relative flex flex-col justify-center items-center min-h-screen bg-white overflow-hidden">
          {/* 左上香草 - 1.5 倍大 */}
          <motion.img
            src={images['../assets/lemon_balm.svg']}
            alt="lemon_balm"
            className="absolute w-[64vw] max-w-[580px] left-[-13vw] top-[-20vw] z-0"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />

          {/* 右側蘆筍群組 */}
          <motion.img
            src={images['../assets/asparagus.svg']}
            alt="asparagus1"
            className="absolute w-[40vw] max-w-[360px] right-[-14vw] top-[20%] z-0"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />
          <motion.img
            src={images['../assets/asparagus.svg']}
            alt="asparagus2"
            className="absolute w-[20vw] max-w-[360px] right-[-20vw] top-[35%] z-0"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />
          <motion.img
            src={images['../assets/asparagus.svg']}
            alt="asparagus3"
            className="absolute w-[30vw] max-w-[360px] right-[-25vw] top-[50%] z-0"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />

          {/* 煙霧 - 從蘆筍上方冒出來，不重疊 */}
          <motion.img
            src={images['../assets/smoke.svg']}
            alt="smoke"
            className="absolute w-[20vw] max-w-[240px] right-[10vw] top-[50%] z-10"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />
          <motion.img
            src={images['../assets/smoke.svg']} 
            alt="smoke"
            className="absolute w-[20vw] max-w-[240px] left-[5vw] top-[35%] z-10"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />

          {/* 左下香草 - 超出左下角 */}
          <motion.img
            src={images['../assets/verbena.svg']}
            alt="verbena"
            className="absolute w-[70vw] max-w-[580px] left-[-30vw] bottom-[-35vw] z-0"
            variants={imgBreath}
            initial="initial"
            animate="animate"
            style={{ pointerEvents: 'none' }}
          />

          {/* 文字區塊 */}
          <div className="relative z-20 w-full max-w-[360px] md:max-w-[480px] mx-auto text-center px-4">
            <MultiStepTypewriter steps={steps} typeSpeed={30} delay={200} />
          </div>
        </div>
      );
    }
    if (page === 3) {
      // 合併上下段 lines，最後一段靠右下
      const lines = [
        'On top like a',
        '<span class="font-extrabold text-5xl md:text-7xl block leading-tight">salad dressing</span>',
        ', floating',
        'combines purple cabbage , beetroot , Don Julio Reposado ,',
        'and Ice Wine of Cabernet .',
        // 右下段
        '<div class="absolute right-0 bottom-0 mb-8 mr-2 text-right max-w-[13rem] md:max-w-[16rem] pr-0 leading-tight" style=\"line-height:1.1;\">' +
        '<span class="font-bold text-2xl md:text-3xl">Pillitteri\'s</span><br/>' +
        '<span class="font-extrabold text-5xl md:text-7xl block leading-tight">late<br/>harvest</span><br/>' +
        '<span class="text-xl md:text-2xl font-normal">icewine,</span><br/>' +
        '<span class="text-xl md:text-2xl font-normal">made from Cabernet grapes,<br>is rich in red berry flavors.</span>' +
        '</div>'
      ];
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

          {/* 主要內容：合併打字動畫 */}
          <div className="relative z-20 w-full h-full">
            <TypewriterSequenceHTML
              lines={lines}
              className="text-2xl md:text-3xl font-space font-bold leading-tight text-left mb-2"
              typeSpeed={30}
              delay={200}
            />
          </div>
        </div>
      );
    }
    if (page === 4) {
      const lines = [
        `<div class="flex flex-col md:flex-row items-start md:items-center w-full max-w-2xl mx-auto mb-6 md:gap-4">
          <img src="${images['../assets/plant_based_logo.svg']}" alt="plant-based-logo" class="w-14 h-14 md:w-20 md:h-20 mb-2 md:mb-0 md:mr-4 flex-shrink-0" style="z-index:2;" />
          <div class="flex flex-col justify-center w-full">
            <div class="font-extrabold font-space text-left leading-tight mb-1 mt-0 text-[clamp(2.2rem,7vw,3.5rem)] md:text-[clamp(3rem,5vw,4.5rem)]">Planta Mood</div>
            <div class="font-bold font-space text-left leading-snug max-w-2xl text-[clamp(1.1rem,3.5vw,1.7rem)] md:text-[clamp(1.3rem,2vw,2rem)]">The idea comes from plant-based. Bringing a natural feeling and creating a deeper connection to the senses.</div>
          </div>
        </div>`,
        `<div class="w-full max-w-2xl mx-auto text-left mt-2 mb-4">
          <div class="font-bold font-space mb-2 text-[clamp(1.1rem,3.5vw,1.7rem)] md:text-[clamp(1.3rem,2vw,2rem)]">Inspired by<br />the idea of a</div>
          <div class="font-extrabold leading-tight mb-2 text-[clamp(2.2rem,7vw,3.5rem)] md:text-[clamp(3rem,5vw,4.5rem)]">warm<br />salad,</div>
          <div class="font-bold font-space mt-2 text-[clamp(1.1rem,3.5vw,1.7rem)] md:text-[clamp(1.3rem,2vw,2rem)]">this cocktail combines grilled asparagus, fresh herbs, and soy whey from both<br />Canada and Taiwan.</div>
        </div>`
      ];
      return (
        <div className="flex flex-col min-h-screen bg-white px-4 pt-10 pb-8">
          {/* 內容區塊：逐行打字動畫 */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <TypewriterSequenceHTML
              lines={lines}
              className=""
              typeSpeed={30}
              delay={200}
            />
          </div>
          {/* 瓶子區塊，永遠有存在感且不會蓋住內容 */}
          <div className="absolute bottom-0 right-0 w-[45vw] max-w-[400px] h-[60vh] min-h-[280px]">
            <img
              src={images['../assets/don_julio_blanco.svg']}
              alt="don_julio_blanco"
              className="w-full h-full"
              style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
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
  );
} 