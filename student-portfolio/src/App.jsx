import { useState } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Projects from './components/Projects';
import Footer from './components/Footer';

function App() {
  const [activePage, setActivePage] = useState('home');
  const name = 'Bhumi Baldania';
  const skillList = ['React.js', 'Java', 'Python', 'CSS3', 'GitHub', 'HTML5', 'Embedded Systems', 'C/C++'];

  const renderPage = () => {
    switch (activePage) {
      case 'about':
        return <About skills={skillList} />;
      case 'projects':
        return <Projects />;
      default:
        return <Home onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="app-shell">
      <Header studentName={name} onNavigate={setActivePage} />
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;
