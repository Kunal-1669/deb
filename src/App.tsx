import "./App.css";
import {
  BooleanParam,
  NumberParam,
  QueryParamProvider,
  useQueryParam,
} from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import { useCallback, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

const WalkthroughCard = (props: { children: React.ReactNode }): JSX.Element => {
  return (
    <div className="rounded-3xl bg-blue-700 shadow-xl h-[calc(100%-5rem)] w-[calc(100%-2.5rem)] max-w-[25rem] max-h-[34rem]">
      <div className="flex flex-col gap-y-10 h-full items-center justify-between">
        {props.children}
      </div>
    </div>
  );
};

// from https://codesandbox.io/s/framer-motion-image-gallery-pqvx3?from-embed=&file=/src/Example.tsx:522-978

/**
 * Experimenting with distilling swipe offset and velocity into a single variable, so the
 * less distance a user has swiped, the more velocity they need to register as a swipe.
 * Should accomodate longer swipes and short flicks without having binary checks on
 * just distance thresholds and velocity > 0.
 */
const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};
const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    };
  },
};

const Content = (): JSX.Element => {
  // TODO: rename this
  const [walkthroughSkipped, setWalkthroughSkipped] = useQueryParam(
    "ws",
    BooleanParam
  );

  const [walkthroughStep, setWalkthroughStep] = useQueryParam(
    "step",
    NumberParam
  );

  const handleSkip = useCallback(() => {
    setWalkthroughSkipped(true);
  }, [setWalkthroughSkipped]);

  const [direction, setDirection] = useState(0);

  const moveCarousel = useCallback(
    (newDirection: number) => {
      if (walkthroughStep != null) {
        const max = steps.length;
        const newStep = (((walkthroughStep + newDirection) % max) + max) % max;
        setWalkthroughStep(newStep);
        setDirection(newDirection);
        setTimeout(() => {
          const newStepButtonRef = stepButtonRefs[newStep];
          if (newStepButtonRef && newStepButtonRef.current) {
            newStepButtonRef.current.focus();
          }
        }, 100);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walkthroughStep, setWalkthroughStep]
  );

  const handleNext = useCallback(() => {
    if (walkthroughStep == null) {
      setWalkthroughStep(1);
      setTimeout(() => {
        const newStepButtonRef = stepButtonRefs[1];
        if (newStepButtonRef && newStepButtonRef.current) {
          newStepButtonRef.current.focus();
        }
      }, 100);
    } else {
      moveCarousel(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveCarousel, setWalkthroughStep, walkthroughStep]);

  const stepButtonRefs = [
    useRef<HTMLButtonElement>(null),
    useRef<HTMLButtonElement>(null),
    useRef<HTMLButtonElement>(null),
    useRef<HTMLButtonElement>(null),
  ];

  // TODO: i18n
  const steps = [
    <WalkthroughCard key={0}>
      <Dialog.Title className="font-[Inter] max-w-xs text-blue-50 text-2xl font-black tracking-normal px-5 py-10 -my-2 text-center">
        Welcome to Data&nbsp;Equity&nbsp;Bank!
      </Dialog.Title>

      <div className="flex flex-col gap-y-10 mb-10 grow justify-center">
        <button
          onClick={handleNext}
          ref={stepButtonRefs[0]}
          className="w-48 bg-blue-50 text-blue-800 text-center font-[Inter] font-semibold text-lg rounded-xl leading-none p-3 tracking-tight cursor-pointer relative group"
        >
          <div className="absolute inset-0 rounded-xl bg-blue-900/[0.3] opacity-0 group-hover:opacity-25 group-active:opacity-100 h-full w-full"></div>
          <span>Start Walkthrough</span>
        </button>

        <button
          className="w-48 text-blue-50 font-medium text-lg p-3 leading-none rounded-xl text-center font-[Inter] tracking-tight cursor-pointer relative group"
          onClick={handleSkip}
        >
          <div className="absolute inset-0 rounded-xl bg-blue-50/[0.1] opacity-0 group-hover:opacity-100 group-active:opacity-75 h-full w-full"></div>
          Skip
        </button>
      </div>
    </WalkthroughCard>,

    <WalkthroughCard key={1}>
      <Dialog.Title className="font-[Inter] max-w-xs text-blue-50 text-2xl font-black tracking-normal px-5 py-10 -my-2">
        1. Select an asset.
      </Dialog.Title>

      <div className="flex flex-col gap-y-10 mb-10 grow justify-end h-full p-5 pb-0">
        <button
          ref={stepButtonRefs[1]}
          className="w-48 text-blue-50 font-medium text-lg p-3 leading-none rounded-xl text-center font-[Inter] tracking-tight cursor-pointer relative group"
          onClick={handleNext}
        >
          <div className="absolute inset-0 rounded-xl bg-blue-50/[0.1] opacity-0 group-hover:opacity-100 group-active:opacity-75 h-full w-full"></div>
          Next
        </button>
      </div>
    </WalkthroughCard>,

    <WalkthroughCard key={2}>
      <Dialog.Title className="font-[Inter] max-w-xs text-blue-50 text-2xl font-black tracking-normal px-5 py-10 -my-2">
        2. Generate data.
      </Dialog.Title>

      <div className="flex flex-col gap-y-10 mb-10 grow justify-end h-full p-5 pb-0">
        <button
          ref={stepButtonRefs[2]}
          className="w-48 text-blue-50 font-medium text-lg p-3 leading-none rounded-xl text-center font-[Inter] tracking-tight cursor-pointer relative group"
          onClick={handleNext}
        >
          <div className="absolute inset-0 rounded-xl bg-blue-50/[0.1] opacity-0 group-hover:opacity-100 group-active:opacity-75 h-full w-full"></div>
          Next
        </button>
      </div>
    </WalkthroughCard>,

    <WalkthroughCard key={3}>
      <Dialog.Title className="font-[Inter] max-w-xs text-blue-50 text-2xl font-black tracking-normal px-5 py-10 -my-2">
        3. {/* possibly redeem */} Receive data wages.
      </Dialog.Title>

      <div className="flex flex-col gap-y-10 mb-10 grow justify-end h-full p-5 pb-0">
        <button
          ref={stepButtonRefs[3]}
          onClick={handleSkip}
          className="w-full bg-blue-50 text-blue-800 text-center font-[Inter] font-semibold text-lg rounded-xl leading-none p-3 tracking-tight cursor-pointer relative group"
        >
          <div className="absolute inset-0 rounded-xl bg-blue-900/[0.3] opacity-0 group-hover:opacity-25 group-active:opacity-100 h-full w-full"></div>
          <span>Start earning data wages</span>
        </button>
      </div>
    </WalkthroughCard>,
  ];

  const dragControls = useDragControls();

  return (
    <>
      <div className="h-full relative p-2 flex items-center justify-center">
        <Link to="/">
          <span className="font-[Inter] uppercase text-bblue text-3xl text-center font-medium tracking-wider font-bold">
            DATA EQUITY BANK
          </span>
        </Link>

        <Dialog
          open={!walkthroughSkipped}
          as="div"
          className="absolute inset-0 flex justify-center items-center overflow-hidden"
          initialFocus={stepButtonRefs[walkthroughStep ?? 0]}
          onClose={handleSkip}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={walkthroughStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              dragControls={dragControls}
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 350, damping: 45 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(_e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  moveCarousel(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  moveCarousel(-1);
                }
              }}
              className="absolute -left-1/2 -right-1/2 mx-auto w-full max-w-[22.5rem] h-full top-0 bottom-0 max-h-full flex items-center justify-center"
            >
              {walkthroughStep == null ? steps[0] : steps[walkthroughStep]}
            </motion.div>
          </AnimatePresence>
        </Dialog>
      </div>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <Routes>
          <Route path="/" element={<Content />} />
        </Routes>
      </QueryParamProvider>
    </BrowserRouter>
  );
}

export default App;
