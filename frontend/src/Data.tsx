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
import './css/Transaction.css';

function Data() {
    const [categories, setCategories] = useState<Transaction[]>([]);


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
    useEffect(() => {


        getCategories();
    }, []); // Empty dependency array = run once on mount

    async function clearData() {
        const formData = new FormData();
        formData.append("userid", "11");

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/clear_transactions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            console.log('Upload successful:', response.data);
            getCategories();

        } catch (error) {
            console.error('Upload failed:', error);
        }
    }
    async function downloadData() {
        const formData = new FormData();
        formData.append("userid", "11");

        try {
            const response = await axios.post(
                'http://127.0.0.1:5000/api/download_transactions',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    responseType: 'blob', // Important: tells axios to expect binary data
                }
            );
            console.log('Upload successful:', response.data);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'transactions.csv'); // Filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Upload failed:', error);
        }
    }

    return (
        <div className={"container"}>
            <h2>Transaction Data: </h2>
            <table cellPadding="8" className="table">
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

            <button onClick={downloadData}> Download Transaction csv</button>
            <button onClick={clearData}>Clear All Data</button>
        </div>
    );
}

export default Data;
