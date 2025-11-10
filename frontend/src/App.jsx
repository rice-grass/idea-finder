import { useEffect } from 'react'
import './App.css'
import Home from './pages/Home'
import { healthCheck } from './services/api'

function App() {
  useEffect(() => {
    // Keep backend awake by pinging every 10 minutes
    const keepAlive = async () => {
      try {
        await healthCheck();
        console.log('✅ Backend keepalive ping sent');
      } catch (error) {
        console.log('⚠️ Backend keepalive ping failed (backend might be sleeping)');
      }
    };

    // Initial ping
    keepAlive();

    // Ping every 10 minutes (600000ms)
    const interval = setInterval(keepAlive, 600000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <Home />
    </div>
  )
}

export default App
