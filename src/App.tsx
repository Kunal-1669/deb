import "./App.css";
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { parse, stringify } from 'querystring';

const Content = (): JSX.Element => {
  return (
    <div className="h-full font-[HelveticaNowDisplay] uppercase text-bblue text-3xl text-center p-2 font-medium tracking-wider flex items-center justify-center">DATA EQUITY BANK</div>
  )
}

function App() {
  return (
    <BrowserRouter>
    <QueryParamProvider 
      adapter={ReactRouter6Adapter}
      options={{
        searchStringToObject: parse,
        objectToSearchString: stringify as any,
      }}
    >
      <Routes>
        <Route path="/" element={<Content />}/>
      </Routes>
    </QueryParamProvider>
  </BrowserRouter>
  )
}

export default App;
