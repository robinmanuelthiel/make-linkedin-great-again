import React from 'react';

function App() {
  console.log('Hello World');

  React.useEffect(() => {
    // Register the message listener on load
    // eslint-disable-next-line
    chrome.runtime.onMessage.addListener(action => {
      switch (action.type) {
        case 'filter-useless-posts': {
          console.log('received click event from context menu');
          break;
        }
        default:
          break;
      }
    });
  }, []);

  return <div className="App">Hello World</div>;
}

export default App;
