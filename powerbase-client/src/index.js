import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const App = () => {
  return (
    <div>
      <h1>Hello World</h1>
      <p>{process.env.NODE_ENV}</p>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
