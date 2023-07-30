import "./App.css";
import {
  BooleanParam,
  NumberParam,
  QueryParamProvider,
  StringParam,
  useQueryParam,
} from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import { useCallback, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

const WalkthroughCard = (props: { children: React.ReactNode, height?: string }): JSX.Element => {
  const { height } = props

  // TODO: reduce duplication here
  if (height == null) {
  return (
    <div className="rounded-3xl bg-blue-700 shadow-xl h-[calc(100%-5rem)] w-[calc(100%-2.5rem)] max-w-[25rem] max-h-[34rem]">
      <div className="flex flex-col gap-y-10 h-full items-center justify-between">
        {props.children}
      </div>
    </div>
  );
  }

  return (
    <div className="rounded-3xl bg-blue-700 shadow-xl w-[calc(100%-2.5rem)] max-w-[25rem] max-h-[34rem]">
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

const AssetsHeader = (): JSX.Element => {
  return (
    <div className="w-full rounded-t-2xl py-8 flex flex-col gap-y-2">
      <div className="text-3xl font-bold font-[Inter] text-bdarkblue leading-none tracking-wide">
        Assets
      </div>

      {/* subheading */}
      <div className="text-md text-bblue/[0.75] font-medium">
        Select a simulation below to begin.
      </div>
    </div>
  );
};

const useSimulatorState = () => {
  return useQueryParam("sim", StringParam);
};

const AssetPlaceholder = (): JSX.Element => {
  const [, setSimulatorState] = useSimulatorState();

  const handleClick = useCallback(() => {
    setSimulatorState("open");
  }, [setSimulatorState]);

  return (
    <>
      <div
        onClick={handleClick}
        className="rounded-lg bg-boffwhite p-2 flex gap-2 shadow-sm select-none cursor-pointer relative group"
      >
        <div className="absolute inset-0 rounded-lg bg-bblue/[0.1] opacity-0 group-hover:opacity-50 group-active:opacity-100 h-full w-full z-10"></div>
        <div className="w-10 h-10 rounded-md bg-boffwhiteandblue"></div>
        <div className="grow flex flex-col gap-y-1.5">
          <div className="h-2 rounded-md w-[60%] bg-blue-100"></div>
          <div className="h-2 rounded-md w-[35%] bg-blue-100/[0.75]"></div>
        </div>
        <div className="self-end flex flex-col gap-y-0.5 items-end">
          <span className="text-bdarkblue font-bold text-2xl leading-none flex items-start">
            <span style={{ fontSize: "0.8em" }} className="translate-y-0.5">
              $
            </span>
            <span>50</span>
          </span>
          <span className="text-bblue/[0.75] leading-none font-light">
            per month
          </span>
        </div>
      </div>
    </>
  );
};

const AssetSelection = (): JSX.Element => {
  return (
    <>
      <div className="max-w-md mx-auto w-full border border-bblue/[0.5] pb-5 px-5 rounded-2xl">
        <AssetsHeader />
        <div className="flex flex-col gap-y-2.5">
          <AssetPlaceholder />
          <AssetPlaceholder />
          <AssetPlaceholder />
        </div>
      </div>
    </>
  );
};

const Home = (): JSX.Element => {
  const [simulatorState] = useSimulatorState();

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
          <div className="absolute inset-0 rounded-xl bg-blue-900/[0.3] opacity-0 group-hover:opacity-25 group-active:opacity-100 h-full w-full z-10"></div>
          <span>Start Walkthrough</span>
        </button>

        <button
          className="w-48 text-blue-50 font-medium text-lg p-3 leading-none rounded-xl text-center font-[Inter] tracking-tight cursor-pointer relative group"
          onClick={handleSkip}
        >
          <div className="absolute inset-0 rounded-xl bg-blue-50/[0.1] opacity-0 group-hover:opacity-100 group-active:opacity-75 h-full w-full z-10"></div>
          <span>Skip</span>
        </button>
      </div>
    </WalkthroughCard>,

    <WalkthroughCard key={1}>
      <Dialog.Title className="font-[Inter] max-w-xs text-blue-50 text-2xl font-black tracking-normal px-5 py-10 -my-2">
        1. Select a simulation.
      </Dialog.Title>

      <div className="flex flex-col gap-y-10 mb-10 grow justify-end h-full p-5 pb-0">
        <button
          ref={stepButtonRefs[1]}
          className="w-48 text-blue-50 font-medium text-lg p-3 leading-none rounded-xl text-center font-[Inter] tracking-tight cursor-pointer relative group"
          onClick={handleNext}
        >
          <div className="absolute inset-0 rounded-xl bg-blue-50/[0.1] opacity-0 group-hover:opacity-100 group-active:opacity-75 h-full w-full z-10"></div>
          <span>Next</span>
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
          <div className="absolute inset-0 rounded-xl bg-blue-50/[0.1] opacity-0 group-hover:opacity-100 group-active:opacity-75 h-full w-full z-10"></div>
          <span>Next</span>
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
          <div className="absolute inset-0 rounded-xl bg-blue-900/[0.3] opacity-0 group-hover:opacity-25 group-active:opacity-100 h-full w-full z-10"></div>
          <span>Start earning data wages</span>
        </button>
      </div>
    </WalkthroughCard>,
  ];

  const dragControls = useDragControls();

  const [, setSimulatorState] = useSimulatorState()

  const stopSimulation = useCallback(() => {
    setSimulatorState('closed')
  }, [setSimulatorState])

  return (
    <>
      <div className="h-full relative p-2 flex flex-col items-stretch justify-start bg-blue-100/[0.8] gap-y-10">
        <Link
          to="/"
          className="font-[Inter] uppercase text-bblue/[0.8] text-md text-center tracking-wider font-bold bg-boffwhite rounded-lg relative group min-h-[2rem] flex items-center justify-center"
        >
          <div className="absolute inset-0 rounded-lg bg-bblue/[0.2] opacity-0 group-hover:opacity-50 group-active:opacity-100 h-full w-full z-10"></div>
          <span>DATA EQUITY BANK</span>
        </Link>

        <AssetSelection />

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

        <Dialog
          open={simulatorState === "open"}
          as="div"
          className="absolute inset-0 flex justify-center items-center overflow-hidden"
          initialFocus={stepButtonRefs[walkthroughStep ?? 0]}
          onClose={handleSkip}
        >
          <div className="absolute -left-1/2 -right-1/2 mx-auto w-full max-w-[22.5rem] h-full top-0 bottom-0 max-h-full flex items-center justify-center">
            <WalkthroughCard height="auto">
              <Dialog.Title className="font-[Inter] max-w-xs text-blue-50 text-2xl font-black tracking-normal px-5 py-10 -my-2 text-center">
                Success!
              </Dialog.Title>

              <div className="font-[Inter] max-w-xs text-blue-50 font-semibold px-5 py-10 text-center">
                You have completed the simulation.
              </div>

      <button
        onClick={stopSimulation}
        className="block font-[Inter] uppercase text-boffwhite border border-boffwhite rounded-xl px-4 py-3 text-center tracking-wider font-bold relative group cursor-pointer mb-10"
      >
        <div className="absolute inset-0 rounded-xl bg-boffwhite/[0.2] opacity-0 group-hover:opacity-50 group-active:opacity-100 h-full w-full z-10"></div>
        <span>Take Again</span>
      </button>
            </WalkthroughCard>
          </div>
        </Dialog>
      </div>
    </>
  );
};

const Signin = (): JSX.Element => {
  return (
    <div className="h-full relative p-2 flex flex-col items-center justify-around">
      <Link
        to="/"
        className="block font-[Inter] uppercase text-bblue text-xl sm:text-3xl text-center tracking-wider font-bold"
      >
        DATA EQUITY BANK
      </Link>

      <Link
        to="/?signin=google&step=0"
        className="block font-[Inter] uppercase text-bblue border border-bblue rounded-xl px-4 py-3 text-center tracking-wider font-bold relative group"
      >
        <div className="absolute inset-0 rounded-xl bg-bblue/[0.2] opacity-0 group-hover:opacity-50 group-active:opacity-100 h-full w-full z-10"></div>
        <span>SIGN IN WITH GOOGLE</span>
      </Link>
    </div>
  );
};

const Content = (): JSX.Element => {
  const [signedIn] = useQueryParam("signin", StringParam);

  if (signedIn === "google") {
    return <Home />;
  }

  return <Signin />;
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
