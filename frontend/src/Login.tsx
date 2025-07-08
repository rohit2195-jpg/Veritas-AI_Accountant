import { useState } from 'react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const login = true

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        setError(''); // Clear previous errors

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        try {


            // For this example, we'll simulate success or failure
            if (email === 'user@example.com' && password === 'password123') {
                alert('Login successful!');
                // Redirect or update application state for authenticated user
            } else {
                setError('Invalid email or password.');
            }
        } catch (err) {
            setError('An error occurred during login. Please try again.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '8px' }}>
    <h2>Login</h2>
    <form onSubmit={handleSubmit}>
    <div style={{ marginBottom: '15px' }}>
    <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
    <input
    type="email"
    id="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
    required
    />
    </div>
    <div style={{ marginBottom: '15px' }}>
    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
    <input
    type="password"
    id="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
    required
    />
    </div>
    {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
    <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Login
        </button>
        </form>
        </div>
    );
}

export default Login;