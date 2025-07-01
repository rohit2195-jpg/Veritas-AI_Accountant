import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Parser from './Parser';
import Data from './Data';
import Assistant from './Assistant';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <h1>My React App</h1>

                {/* Navigation Links */}
                <nav>
                    <Link to="/">Home</Link> | <Link to="/parser">Parser</Link> | <Link to="/data">Data</Link> | <Link to ="/assistant">AI Assistant</Link>
                </nav>

                {/* Route Definitions */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/parser" element={<Parser />} />
                    <Route path="/data" element={<Data/>}/>
                    <Route path = "/assistant" element={<Assistant/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
