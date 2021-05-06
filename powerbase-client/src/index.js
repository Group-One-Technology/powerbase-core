import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const App = () => {
  return (
    <div className="p-4 bg-gray-800 text-white h-screen w-full flex items-center justify-center">
      <div className="w-96 text-center">
        <h1 className="text-3xl">Hello World</h1>
        <p>{process.env.NODE_ENV}</p>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
