import { useState } from 'react';
import './css/Login.css';
import {Link, useNavigate} from "react-router-dom";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, createUserWithEmailAndPassword} from "firebase/auth";
import {firebaseConfig} from "./firebase-config.ts";




// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);




function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();



    const handleSubmit = async (event: any) => {
        event.preventDefault(); // Prevent default form submission behavior
        setError(''); // Clear previous errors

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }


        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up
                const user = userCredential.user;
                console.log("user signed in", user);
                // ...

                navigate('/home')


            })
            .catch((error) => {
                const errorCode: string = error.code;
                const errorMessage: string = error.message;
                console.log("error", errorCode);
                setError(errorMessage);
                // ..
            });

    };

    return (
        <div className="login">
            <h2>Sign up</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
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
                <p>Existing user? <Link to="/">Log in</Link></p>
                <button type="submit" className={"btn-primary"}>
                    Login
                </button>
            </form>
        </div>
    );
}

export default Signup;