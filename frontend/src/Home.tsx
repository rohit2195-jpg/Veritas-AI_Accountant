import axios from "axios";
import {useEffect, useState} from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

import {Bar, Pie} from "react-chartjs-2";




function Home() {
    const [graphs, setGraphs] = useState<any>(null);
    const [timeGraph, settimeGraphs] = useState<any>(null);

    async function getCategories() {
        const formData = new FormData();
        formData.append("userid", "11");

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/expensesby-category', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setGraphs(response.data);

            console.log('Upload successful:', response.data);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }

    async function getTimeGraphs() {
        const formData = new FormData();
        formData.append("userid", "11");

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/timegraphs', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            settimeGraphs(response.data);

            console.log('Upload successful:', response.data);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }
    useEffect(() => {
        getCategories();

    }, []);
    if (!graphs && !timeGraph) return <p>Loading chart...</p>;
    return (
        <div>
            <h2>Home Page</h2>
            <p>Welcome to the Home page!</p>
            <h3>Expenses by Category</h3>
            <div className="charts">
                <Pie data={graphs} />


            </div>






        </div>
    );
}

export default Home;
