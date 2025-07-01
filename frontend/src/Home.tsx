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

import {Bar, Pie, Line} from "react-chartjs-2";




function Home() {
    const [graphs, setGraphs] = useState<any>(null);
    const [timeGraph, settimeGraphs] = useState<any>(null);
    const [inoutgraph, setinoutgraph] = useState<any>(null);
    const [qoute, setqoute] = useState<any>(null);
    const [author, setauthor] = useState<any>(null);
    const currTime = new Date().toLocaleTimeString();
    const currDate = new Date().toLocaleDateString();

    const [recent_transactions, setRecentTransactions] = useState<any>(null);
    const [report, setReport] = useState({
        earning: null,
        spending: null,
        net: null
    });




    useEffect(() => {
        getCategories();
        getTimeGraphs();
        getinoutgraph();
        getQoute()
        getEarningReport()
    }, []);


    async function getEarningReport() {
        const formData = new FormData();
        formData.append("userid", "11");

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/earning_report', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setReport({
                earning: response.data.earning,
                spending: response.data.spending,
                net: response.data.net
            });

        } catch (error) {
            console.error("Error fetching category data:", error);
        }
    }

    async function getQoute() {
        const formData = new FormData();
        formData.append("userid", "11");

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/daily_qoute', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            console.log("Category data:", response.data);
            setqoute(response.data.qoute);
            setauthor(response.data.author);

        } catch (error) {
            console.error("Error fetching category data:", error);
        }
    }

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

            <div className="wid1">
                <p> {currTime}  </p>
                <p> {currDate} </p>
            </div>
            <div className="wid2">
            <p>Quote of the day:{author} {qoute} </p>
            </div>
            <div className="charts" style={{ height: 400 }}>
                {graphs && <Pie data={graphs} />}

                <div className="earning-report">
                    <p>Earnings: {report.earning}</p>
                    <p>Spending: {report.spending}</p>
                    <p>Net: {report.net}</p>
                </div>

                {timeGraph && <Bar data={timeGraph} />}
                {inoutgraph && <Bar data={inoutgraph} />}


            </div>




        </div>
    );
}

export default Home;
