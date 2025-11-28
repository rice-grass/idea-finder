import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LocationStart from './pages/LocationStart'
import ThemeSelectorPage from './pages/ThemeSelectorPage'
import DistanceDifficulty from './pages/DistanceDifficulty'
import CourseLoading from './pages/CourseLoading'
import CourseResult from './pages/CourseResult'
import OasisMatching from './pages/OasisMatching'
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
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LocationStart />} />
          <Route path="/theme-selector" element={<ThemeSelectorPage />} />
          <Route path="/distance-difficulty" element={<DistanceDifficulty />} />
          <Route path="/course-loading" element={<CourseLoading />} />
          <Route path="/course-result" element={<CourseResult />} />
          <Route path="/oasis" element={<OasisMatching />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
