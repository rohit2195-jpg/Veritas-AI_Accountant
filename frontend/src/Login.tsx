import { useState } from 'react';
import './css/Login.css';
import {Link, useNavigate} from "react-router-dom";
import {firebaseConfig} from "./firebase-config.ts";


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider} from "firebase/auth";
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
    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            navigate('/home');
        } catch (error) {
            console.error("Error signing in with Google:", error);
        }
    };


    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            outline: 'none',
            marginLeft: '500px',
            marginRight: '500px',
            marginTop: '100px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            padding: '40px',
        }}>
            <div>
    <h2 style={{
        textAlign: "center"

    }} >Login</h2>
    <form style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    }}onSubmit={handleSubmit}>
    <div>
    <label htmlFor="email" >Email:</label> <br/>
    <input
    type="email"
    id="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}

    required
    />
    <label htmlFor="password" style={{ display: 'block' }}>Password:</label>
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

        <button onClick={handleGoogleSignIn} style={{marginBottom: "10px", padding:"7px",
            backgroundColor: "#4285F4",
            color: "white",
            borderRadius: "10px" }}>Sign in with Google</button>

        <button type="submit" style={{padding: "20px", borderRadius: "10px",
        backgroundColor: "#d9534f",
            color: "white",
            fontSize: "20px",
        }}className={"btn-primary"}>
        Login
        </button>
        </form>
        </div>

        </div>
    );
}

export default Login;