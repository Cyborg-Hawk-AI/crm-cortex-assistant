
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './components/chat.css'

// Add responsive viewport meta tag
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
document.head.appendChild(meta);

createRoot(document.getElementById("root")!).render(<App />);
