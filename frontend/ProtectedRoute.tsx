// ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import type { User } from 'firebase/auth';
import { useNavigate } from "react-router-dom";
import {initializeApp} from "firebase/app";

function ProtectedRoute({ children }: any) {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const firebaseConfig = {
        apiKey: "AIzaSyCkuBOBiRyBJFWMXWK0GqYwcVGIweE0JwQ",
        authDomain: "veritas-ai-accountant.firebaseapp.com",
        projectId: "veritas-ai-accountant",
        storageBucket: "veritas-ai-accountant.firebasestorage.app",
        messagingSenderId: "556788428259",
        appId: "1:556788428259:web:b14bfb2ccd71fb6fea44d6",
        measurementId: "G-MF0LJS5PFM"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, [auth]);

    if (user === undefined) {
        return (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p>Loading...</p>
            </div>
        );
    }
    if (!user) navigate("/");

    return children;
}

export default ProtectedRoute;
