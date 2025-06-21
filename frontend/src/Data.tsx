import { useEffect, useState } from 'react';
import axios from 'axios';
interface Transaction {
    id: number;
    date: string;
    description: string;
    amount: number;
    type: string;
    category: string;
}
function Data() {
    const [categories, setCategories] = useState<Transaction[]>([]);

    useEffect(() => {
        async function getCategories() {
            const formData = new FormData();
            formData.append("userid", "11");

            try {
                const response = await axios.post('http://127.0.0.1:5000/view_transactions', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                console.log('Upload successful:', response.data);
                setCategories(response.data); // Save data to state
            } catch (error) {
                console.error('Upload failed:', error);
            }
        }

        getCategories();
    }, []); // Empty dependency array = run once on mount

    return (
        <div>
            <h2>Transaction Data</h2>
            <p>Below is your transaction data:</p>
            <table cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Category</th>
                </tr>
                </thead>
                <tbody>
                {categories.map((item, index) => (
                    <tr key={index}>
                        <td>{item.id}</td>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                        <td>{item.description}</td>
                        <td>{item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                        <td>{item.type}</td>
                        <td>{item.category}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Data;
