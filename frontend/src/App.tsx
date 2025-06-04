import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Parser from './Parser';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <h1>My React App</h1>

                {/* Navigation Links */}
                <nav>
                    <Link to="/">Home</Link> | <Link to="/parser">Parser</Link>
                </nav>

                {/* Route Definitions */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/parser" element={<Parser />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
