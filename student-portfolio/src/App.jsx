import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import NotFound from './components/NotFound';

function App() {
  const name = 'Bhumi Baldania';
  const skills = ['React', 'Python', 'C/C++', 'Embedded Systems', 'IoT', 'Java'];
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="app-shell">
      <NavBar
        studentName={name}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        showIntro={showIntro}
        onToggleIntro={() => setShowIntro((prev) => !prev)}
      />
      <main>
        <Routes>
          <Route path="/" element={<Home showIntro={showIntro} />} />
          <Route path="/about" element={<About skills={skills} />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
