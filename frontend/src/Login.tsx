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
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: '100px auto',
                maxWidth: '400px',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                padding: '40px',
                fontFamily: 'Segoe UI, sans-serif',
            }}
        >
            <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Log in</h2>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    gap: '16px',
                }}
            >
                <div>
                    <label htmlFor="email" style={{ fontWeight: 500 }}>
                        Email:
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            marginTop: '4px',
                        }}
                    />
                </div>

                <div>
                    <label htmlFor="password" style={{ fontWeight: 500 }}>
                        Password:
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            marginTop: '4px',
                        }}
                    />
                </div>

                {error && (
                    <p style={{ color: 'red', fontSize: '14px', marginTop: '-8px' }}>{error}</p>
                )}

                <p style={{ textAlign: 'center', fontSize: '14px' }}>
                    Not a user? <Link to="/signup">Sign up</Link>
                </p>

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    style={{
                        padding: '10px',
                        backgroundColor: '#4285F4',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                    }}
                >
                    Sign in with Google
                </button>

                <button
                    type="submit"
                    style={{
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: '#d9534f',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;