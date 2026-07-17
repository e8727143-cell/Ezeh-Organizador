import React, {StrictMode, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

const Root = () => {
  useEffect(() => {
    console.log('Ezeh Organizer: App Mounted Successfully');
    window.addEventListener('error', (event) => {
      console.error('Ezeh Organizer: Global Error Caught:', event.error);
    });
  }, []);
  
  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<Root />);
} else {
  console.error('Ezeh Organizer: Root element not found');
}
