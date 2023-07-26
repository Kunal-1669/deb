import "./App.css";
import {
  BooleanParam,
  QueryParamProvider,
  useQueryParam,
} from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useCallback, useRef } from "react";
import { Dialog } from "@headlessui/react";

const Content = (): JSX.Element => {
  const startWalkthroughRef = useRef(null);
  const [walkthroughSkipped, setWalkthroughSkipped] = useQueryParam(
    "ws",
    BooleanParam
  );
  const handleSkip = useCallback(() => {
    setWalkthroughSkipped(true);
  }, [setWalkthroughSkipped]);

  return (
    <>
      <div className="h-full relative p-2 flex items-center justify-center">
        <span className="font-[Inter] uppercase text-bblue text-3xl text-center font-medium tracking-wider">
          DATA EQUITY BANK
        </span>

        <Dialog
          open={!walkthroughSkipped}
          as="div"
          className="absolute inset-10 flex justify-center items-center"
          initialFocus={startWalkthroughRef}
          onClose={handleSkip}
        >
          <div className="rounded-3xl bg-blue-700 shadow h-full max-h-[34rem]">
            <div className="flex flex-col gap-y-10 h-full items-center justify-between">
              <Dialog.Title className="font-[Inter] max-w-xs text-blue-50 text-2xl font-black tracking-normal p-5 text-center">
                Welcome to Data&nbsp;Equity&nbsp;Bank!
              </Dialog.Title>

              <div className="flex flex-col gap-y-10 mb-10 grow justify-center">
                <button
                  ref={startWalkthroughRef}
                  className="w-48 bg-blue-50 text-blue-800 text-center font-[Inter] font-semibold text-lg rounded-xl leading-none p-3 tracking-tight cursor-pointer relative group"
                >
                  <div className="absolute inset-0 rounded-xl bg-blue-900/[0.1] opacity-0 group-hover:opacity-75 group-active:opacity-100 h-full w-full"></div>
                  <span>Start Walkthrough</span>
                </button>

                <button className="w-48 text-blue-50 font-medium text-lg p-3 leading-none rounded-xl text-center font-[Inter] tracking-tight cursor-pointer relative group" onClick={handleSkip}>
                  <div className="absolute inset-0 rounded-xl bg-blue-50/[0.1] opacity-0 group-hover:opacity-100 group-active:opacity-75 h-full w-full"></div>
                  Skip
                </button>
              </div>
            </div>
          </div>
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
