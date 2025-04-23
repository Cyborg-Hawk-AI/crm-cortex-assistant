
// Import styles
import '../index.css';
import './sidepanel.css';

// Mount the React application in the extension context
import { createRoot } from 'react-dom/client';
import { ExtensionApp } from './ExtensionApp.jsx';

const root = createRoot(document.getElementById('extension-root'));
root.render(<ExtensionApp />);
