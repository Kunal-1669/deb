import cx from "classnames";
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

const usePage = () => useQueryParam("page", StringParam);

const useExplorerMode = () => useQueryParam("em", StringParam);

const WalkthroughCard = (props: {
  children: React.ReactNode;
  height?: string;
}): JSX.Element => {
  const { height } = props;

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

const PaymentHistoryHeader = (): JSX.Element => {
  return (
    <div className="w-full rounded-t-2xl py-8 flex flex-col gap-y-2">
      <div className="text-3xl font-bold font-[Inter] text-bdarkblue leading-none tracking-wide">
        Transactions
      </div>

      {/* subheading */}
      <div className="text-md text-bblue/[0.75] font-medium">
        Find data wage invoices below.
      </div>
    </div>
  );
};

const WithdrawalsHeader = (): JSX.Element => {
  return (
    <div className="w-full rounded-t-2xl py-8 flex flex-col gap-y-2">
      <div className="text-3xl font-bold font-[Inter] text-bdarkblue leading-none tracking-wide">
        Start a withdrawal
      </div>

      {/* subheading */}
      <div className="text-md text-bblue/[0.75] font-medium">
        Sign in with PayPal below to begin.
      </div>
    </div>
  );
};

// TODO: refactor this into useSimulator
//
//   example:
//
//     const {state, open, close} = useSimulator()
//
//     return <button onClick={open}>{state}</button>
//
const useSimulatorState = () => {
  return useQueryParam("sim", StringParam);
};

const PaymentTransactionPlaceholder = (props: {
  icon?: "dollar" | "bank" | "cash";
  time?: string;
  withdrawal?: boolean;
}): JSX.Element => {
  const { icon = "dollar", time = "Jul 22", withdrawal = false } = props;

  return (
    <>
      <div className="flex gap-2 relative items-center">
        <div className="w-10 h-10 rounded-full bg-boffwhiteandblue text-bblue/[0.5] flex items-center justify-center">
          {icon === "dollar" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : icon === "bank" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
              />
            </svg>
          )}
        </div>
        <div className="grow flex flex-col gap-y-1.5">
          <div className="h-2 rounded-md w-[60%] bg-bdarkblue/[0.5]"></div>
          <div className="font-[Inter] font-light leading-none h-2 rounded-md w-[35%] text-bdarkblue/[0.5]">
            {time}
          </div>
        </div>
        <div className="self-end flex flex-col gap-y-0.5 items-start">
          {withdrawal ? (
            <span className="text-red-700 font-bold text-md leading-none flex items-start">
              <span style={{ fontSize: "0.95em" }}>-</span>
              <span style={{ fontSize: "0.9em" }}>$</span>
              <span>25.00</span>
            </span>
          ) : (
            <span className="text-green-700 font-bold text-md leading-none flex items-start">
              <span style={{ fontSize: "0.95em" }}>+</span>
              <span style={{ fontSize: "0.9em" }}>$</span>
              <span>25.00</span>
            </span>
          )}
        </div>
      </div>
    </>
  );
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

const ExplorerModeSelector = (): JSX.Element => {
  const [explorerMode, setExplorerMode] = useExplorerMode();

  const handleStackClick = useCallback(() => {
    setExplorerMode("stack");
  }, [setExplorerMode]);

  const handleCardClick = useCallback(() => {
    setExplorerMode("card");
  }, [setExplorerMode]);

  const iconClassName = "w-8 h-8";

  const rowsIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={iconClassName}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122"
      />
    </svg>
  );

  const stackIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={iconClassName}
    >
      <path
        fillRule="evenodd"
        d="M6 4.75A.75.75 0 016.75 4h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 4.75zM6 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 10zm0 5.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM1.99 4.75a1 1 0 011-1H3a1 1 0 011 1v.01a1 1 0 01-1 1h-.01a1 1 0 01-1-1v-.01zM1.99 15.25a1 1 0 011-1H3a1 1 0 011 1v.01a1 1 0 01-1 1h-.01a1 1 0 01-1-1v-.01zM1.99 10a1 1 0 011-1H3a1 1 0 011 1v.01a1 1 0 01-1 1h-.01a1 1 0 01-1-1V10z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div className="mb-10">
      <button
        onClick={handleCardClick}
        className={cx(
          "inline-block border-b-4 p-2",
          explorerMode !== "stack"
            ? "border-bblack text-bblack"
            : "text-bblack/[0.5] border-transparent p-2"
        )}
      >
        {rowsIcon}
      </button>

      <button
        onClick={handleStackClick}
        className={cx(
          "inline-block border-b-4 p-2",
          explorerMode === "stack"
            ? "border-bblack text-bblack"
            : "text-bblack/[0.5] border-transparent p-2"
        )}
      >
        {stackIcon}
      </button>
    </div>
  );
};

const SimulationListingEntry = (): JSX.Element => {
  return (
    <>
      <div className="flex flex-col gap-y-5">
        <div
          style={{
            backgroundImage: ` url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M81.28 88H68.413l19.298 19.298L81.28 88zm2.107 0h13.226L90 107.838 83.387 88zm15.334 0h12.866l-19.298 19.298L98.72 88zm-32.927-2.207L73.586 78h32.827l.5.5 7.294 7.293L115.414 87l-24.707 24.707-.707.707L64.586 87l1.207-1.207zm2.62.207L74 80.414 79.586 86H68.414zm16 0L90 80.414 95.586 86H84.414zm16 0L106 80.414 111.586 86h-11.172zm-8-6h11.173L98 85.586 92.414 80zM82 85.586L87.586 80H76.414L82 85.586zM17.414 0L.707 16.707 0 17.414V0h17.414zM4.28 0L0 12.838V0h4.28zm10.306 0L2.288 12.298 6.388 0h8.198zM180 17.414L162.586 0H180v17.414zM165.414 0l12.298 12.298L173.612 0h-8.198zM180 12.838L175.72 0H180v12.838zM0 163h16.413l.5.5 7.294 7.293L25.414 172l-8 8H0v-17zm0 10h6.613l-2.334 7H0v-7zm14.586 7l7-7H8.72l-2.333 7h8.2zM0 165.414L5.586 171H0v-5.586zM10.414 171L16 165.414 21.586 171H10.414zm-8-6h11.172L8 170.586 2.414 165zM180 163h-16.413l-7.794 7.793-1.207 1.207 8 8H180v-17zm-14.586 17l-7-7h12.865l2.333 7h-8.2zM180 173h-6.613l2.334 7H180v-7zm-21.586-2l5.586-5.586 5.586 5.586h-11.172zM180 165.414L174.414 171H180v-5.586zm-8 5.172l5.586-5.586h-11.172l5.586 5.586zM152.933 25.653l1.414 1.414-33.94 33.942-1.416-1.416 33.943-33.94zm1.414 127.28l-1.414 1.414-33.942-33.94 1.416-1.416 33.94 33.943zm-127.28 1.414l-1.414-1.414 33.94-33.942 1.416 1.416-33.943 33.94zm-1.414-127.28l1.414-1.414 33.942 33.94-1.416 1.416-33.94-33.943zM0 85c2.21 0 4 1.79 4 4s-1.79 4-4 4v-8zm180 0c-2.21 0-4 1.79-4 4s1.79 4 4 4v-8zM94 0c0 2.21-1.79 4-4 4s-4-1.79-4-4h8zm0 180c0-2.21-1.79-4-4-4s-4 1.79-4 4h8z' fill='%231a3f70' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
          className="w-full aspect-square rounded-xl bg-boffwhiteandblue"
        ></div>
        <div className="grow flex flex-col gap-y-1.5 -mb-2">
          <div className="h-2 rounded-md w-[60%] bg-blue-100"></div>
          <div className="h-2 rounded-md w-[35%] bg-blue-100/[0.75]"></div>
          <div className="flex gap-1 items-center text-bblue/[0.75] mt-1">

            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
          <div className="font-[Inter] font-light leading-none">45m</div>
          </div>
        </div>
        <div className="flex gap-1 items-end">
          <span className="text-bdarkblue font-bold text-xl leading-none flex items-start">
            <span style={{ fontSize: "0.8em" }} className="translate-y-0.5">
              $
            </span>
            <span>50</span>
          </span>

          <span className="text-bblue/[0.75] leading-none font-light">
            /month
          </span>
        </div>
      </div>
    </>
  );
};

const AssetSelection = (): JSX.Element => {
  const [explorerMode] = useExplorerMode();

  return (
    <>
      <div className="max-w-md mx-auto w-full pb-5 rounded-2xl px-2">
        <ExplorerModeSelector />

        {explorerMode === "stack" ? (
          <div className="flex flex-col gap-y-2.5">
            <AssetPlaceholder />
            <AssetPlaceholder />
            <AssetPlaceholder />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-y-12">

            <SimulationListingEntry />
            <SimulationListingEntry />
            <SimulationListingEntry />
            </div>
          </>
        )}
      </div>
    </>
  );
};

const GoToPaymentHistory = (): JSX.Element => {
  const [, setPage] = usePage();

  const onClick = useCallback(() => {
    setPage("payment-history");
  }, [setPage]);

  return (
    <button
      onClick={onClick}
      className="font-[Inter] uppercase text-[#8dd5ff] text-md text-center tracking-wider font-bold bg-boffwhiteandblue rounded-lg relative group min-h-[2rem] flex items-center justify-center px-2"
    >
      <div className="absolute inset-0 rounded-lg bg-bblue/[0.4] opacity-0 group-hover:opacity-50 group-active:opacity-100 h-full w-full z-10"></div>
      <span>Transactions</span>
    </button>
  );
};

const GoToHome = (): JSX.Element => {
  const [, setPage] = usePage();

  const onClick = useCallback(() => {
    setPage("home");
  }, [setPage]);

  return (
    <button
      onClick={onClick}
      className="font-[Inter] uppercase text-[#8dd5ff] text-md text-center tracking-wider font-bold bg-boffwhiteandblue rounded-lg relative group min-h-[2rem] flex items-center justify-center px-2"
    >
      <div className="absolute inset-0 rounded-lg bg-bblue/[0.4] opacity-0 group-hover:opacity-50 group-active:opacity-100 h-full w-full z-10"></div>
      <span>Explore</span>
    </button>
  );
};

const Header = (): JSX.Element => {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="text-center text-bblue/[0.5] font-semibold text-xs">
        DATA EQUITY BANK
      </div>

      <div className="flex gap-2 flex-wrap">
        <GoToHome />

        <GoToPaymentHistory />

        <Link
          to="/"
          className="font-[Inter] uppercase text-bblue/[0.8] text-md text-center tracking-wider font-bold bg-boffwhite rounded-lg relative group min-h-[2rem] flex items-center justify-center px-2 grow"
        >
          <div className="absolute inset-0 rounded-lg bg-bblue/[0.2] opacity-0 group-hover:opacity-50 group-active:opacity-100 h-full w-full z-10"></div>
          <span>Sign Out</span>
        </Link>
      </div>
    </div>
  );
};

const useWithdrawFlow = () => {
  const [state, setState] = useQueryParam("withdraw", StringParam);

  const open = useCallback(() => {
    setState("open");
  }, [setState]);

  const close = useCallback(() => {
    setState("closed");
  }, [setState]);

  return { state, open, close };
};

const PaymentHistory = (): JSX.Element => {
  const withdrawFlow = useWithdrawFlow();

  return (
    <>
      <div className="h-min min-h-full relative p-2 flex flex-col items-stretch justify-start bg-blue-100/[0.8] gap-y-10">
        <Header />

        <div className="max-w-md mx-auto w-full pb-5 px-5 rounded-2xl bg-boffwhite shadow-sm">
          <PaymentHistoryHeader />

          <div className="flex flex-col gap-y-10">
            <PaymentTransactionPlaceholder time="Jun 26" />
            <PaymentTransactionPlaceholder
              time="Jun 22"
              icon="bank"
              withdrawal
            />
            <PaymentTransactionPlaceholder time="Jul 3" icon="cash" />
          </div>
        </div>

        <div className="max-w-md mx-auto w-full pb-5 px-5 rounded-2xl bg-boffwhite shadow-sm">
          <WithdrawalsHeader />

          <div className="flex justify-center">
            <button
              onClick={withdrawFlow.open}
              className="block font-[Inter] uppercase text-bblue border border-bblue rounded-xl px-4 py-3 text-center tracking-wider font-bold relative group"
            >
              <div className="absolute inset-0 rounded-xl bg-bblue/[0.2] opacity-0 group-hover:opacity-50 group-active:opacity-100 h-full w-full z-10"></div>
              <span>SIGN IN WITH PAYPAL</span>
            </button>
          </div>
        </div>
      </div>

      <Dialog
        open={withdrawFlow.state === "open"}
        as="div"
        className="absolute inset-0 flex justify-center items-center overflow-hidden"
        onClose={withdrawFlow.close}
      >
        <div className="absolute -left-1/2 -right-1/2 mx-auto w-full max-w-[22.5rem] h-full top-0 bottom-0 max-h-full flex items-center justify-center">
          <WalkthroughCard height="auto">
            <Dialog.Title className="font-[Inter] max-w-xs text-blue-50 text-2xl font-black tracking-normal px-5 py-10 -my-2 text-center">
              Success!
            </Dialog.Title>

            <div className="font-[Inter] max-w-xs text-blue-50 font-semibold px-5 py-10 text-center">
              You have completed the withdrawal.
            </div>

            <button
              onClick={withdrawFlow.close}
              className="block font-[Inter] uppercase text-boffwhite border border-boffwhite rounded-xl px-4 py-3 text-center tracking-wider font-bold relative group cursor-pointer mb-10"
            >
              <div className="absolute inset-0 rounded-xl bg-boffwhite/[0.2] opacity-0 group-hover:opacity-50 group-active:opacity-100 h-full w-full z-10"></div>
              <span>Close</span>
            </button>
          </WalkthroughCard>
        </div>

        <div
          onClick={withdrawFlow.close}
          className="fixed inset-0 bg-blue-900/[0.1] z-0"
        />
      </Dialog>
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

  const [, setSimulatorState] = useSimulatorState();

  const stopSimulation = useCallback(() => {
    setSimulatorState("closed");
  }, [setSimulatorState]);

  const [explorerMode] = useExplorerMode();

  return (
    <>
      <div
        className={cx(
          "h-min min-h-full relative p-2 flex flex-col items-stretch justify-start gap-y-10",
          explorerMode === "stack" ? "bg-blue-100/[0.8]" : "bg-blue-100/[0.4]"
        )}
      >
        <Header />

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
              className="absolute -left-1/2 -right-1/2 mx-auto w-full max-w-[22.5rem] h-full top-0 bottom-0 max-h-full flex items-center justify-center z-10"
            >
              {walkthroughStep == null ? steps[0] : steps[walkthroughStep]}
            </motion.div>
            <div
              onClick={handleSkip}
              className="fixed inset-0 bg-blue-900/[0.1] z-0"
            ></div>
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

          <div
            onClick={stopSimulation}
            className="fixed inset-0 bg-blue-900/[0.1] z-0"
          />
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
  const [page] = usePage();

  if (signedIn === "google") {
    if (page === "payment-history") {
      return <PaymentHistory />;
    }

    // if page == null || page == 'home'
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
