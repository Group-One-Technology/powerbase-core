import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import cn from 'classnames';
import './index.css';

const App = () => {
  const [active, setActive] = useState(false);

  return (
    <div className="p-4 bg-gray-800 text-white h-screen w-full flex items-center justify-center">
      <div className="w-96 text-center">
        <h1 className={cn('text-3xl', { 'text-blue-400': active })}>
          Hello World
        </h1>
        <p>{process.env.NODE_ENV}</p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setActive((state) => !state)}
        >
          Toggle Text Color
        </button>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
