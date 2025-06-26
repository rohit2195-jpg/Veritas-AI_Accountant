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
    const [inoutgraph, setinoutgraph] = useState<any>(null);

    useEffect(() => {
        getCategories();
        getTimeGraphs();
        getinoutgraph();
    }, []);

    async function getCategories() {
        const formData = new FormData();
        formData.append("userid", "11");

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/expensesby-category', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            console.log("Category data:", response.data);
            setGraphs(response.data);
        } catch (error) {
            console.error("Error fetching category data:", error);
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
            console.log("Time graph data:", response.data);
            settimeGraphs(response.data);
        } catch (error) {
            console.error("Error fetching time graph data:", error);
        }
    }
    async function getinoutgraph() {
        const formData = new FormData();
        formData.append("userid", "11");

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/inoutgraph', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            console.log("Time graph data:", response.data);
            setinoutgraph(response.data);
        } catch (error) {
            console.error("Error fetching time graph data:", error);
        }
    }

    if (!graphs || !timeGraph || !inoutgraph) return <p>Loading chart...</p>;

    return (
        <div>
            <h2>Home Page</h2>
            <p>Welcome to the Home page!</p>
            <h3>Expenses by Category</h3>
            <div className="charts" style={{ height: 400 }}>
                {graphs && <Pie data={graphs} />}
                {timeGraph && <Bar data={timeGraph} />}
                {inoutgraph && <Bar data={inoutgraph} />}



            </div>






        </div>
    );
}

export default Home;
