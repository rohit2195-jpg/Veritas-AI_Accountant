import { BrowserRouter as Router, Routes, Route, Link , useLocation} from 'react-router-dom';
import Home from './Home';
import Parser from './Parser';
import Data from './Data';
import Assistant from './Assistant';
import './css/App.css';
import Login from './Login';
import Signup from "./Signup.tsx";
import ProtectedRoute from "../ProtectedRoute.tsx";
import Start from "./Start.tsx";


function AppContent() {
    const location = useLocation();

    // Hide navbar on login and signup pages
    const hideNavbar = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/';



    return (
        <div className="App">
            {!hideNavbar && (
                <nav className="nav">
                    <Link to="/home">Home</Link>
                    <Link to="/parser">Parser</Link>
                    <Link to="/data">Data</Link>
                    <Link to="/assistant">AI Assistant</Link>
                </nav>
            )}

            <Routes>
                <Route path="/" element={<Start/>} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/home" element={<ProtectedRoute> <Home /> </ProtectedRoute>} />
                <Route path="/parser" element={<ProtectedRoute> <Parser /> </ProtectedRoute>} />
                <Route path="/data" element={<ProtectedRoute> <Data /> </ProtectedRoute>} />
                <Route path="/assistant" element={<ProtectedRoute> <Assistant /> </ProtectedRoute>} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
