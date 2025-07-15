import { useState } from 'react';
import './css/Login.css';
import {Link, useNavigate} from "react-router-dom";
import {firebaseConfig} from "./firebase-config.ts";


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries



// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);







function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();


    const handleSubmit = async (event:any) => {
        event.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            console.log("User signed in:", userCred.user);
            navigate('/home');
        } catch (err) {
            console.error("Login failed:", err);

        }
    };


    return (
        <div>
    <h2>Login</h2>
    <form onSubmit={handleSubmit}>
    <div>
    <label htmlFor="email" >Email:</label>
    <input
    type="email"
    id="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}

    required
    />
    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
    <input
    type="password"
    id="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    />
    </div>
    {error && <p >{error}</p>}
        <p>Not a user? <Link to="/signup">Sign up</Link></p>
    <button type="submit" className={"btn-primary"}>
        Login
        </button>
        </form>
        </div>
    );
}

export default Login;