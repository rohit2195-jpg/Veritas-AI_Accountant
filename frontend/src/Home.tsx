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

interface Transaction {
    id: number;
    date: string;
    description: string;
    amount: number;
    type: string;
    category: string;
}
import {Bar, Pie, Line} from "react-chartjs-2";

import './css/Home.css';
import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";



function Home() {
    const [graphs, setGraphs] = useState<any>(null);
    const [timeGraph, settimeGraphs] = useState<any>(null);
    const [inoutgraph, setinoutgraph] = useState<any>(null);
    const [qoute, setqoute] = useState<any>(null);
    const [author, setauthor] = useState<any>(null);
    const [time, setTime] = useState(new Date());
    const currDate = new Date().toLocaleDateString();

    const [recent_transactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [report, setReport] = useState({
        earning: null,
        spending: null,
        net: null
    });
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
        const intervalId = setInterval(() => {
            setTime(new Date());
        }, 1000); // Update every second

        // Cleanup function to clear the interval
        return () => clearInterval(intervalId);
    }, []);


    useEffect(() => {
        getCategories();
        getTimeGraphs();
        getinoutgraph();
        getQoute();
        getEarningReport();
        getTransactionView();
    }, []);

    async function getTransactionView() {
        const formData = new FormData();
        formData.append("userid", "11");
        const token = await auth.currentUser?.getIdToken(true)


        try {
            const response = await axios.post('http://127.0.0.1:5000/api/recent_transactions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Upload successful:', response.data);
            setRecentTransactions(response.data); // Save data to state
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }


    async function getEarningReport() {
        const formData = new FormData();
        formData.append("userid", "11");
        const token = await auth.currentUser?.getIdToken(true)



        try {
            const response = await axios.post('http://127.0.0.1:5000/api/earning_report', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
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
        const token = await auth.currentUser?.getIdToken(true)

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/daily_qoute', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
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
        const token = await auth.currentUser?.getIdToken(true)

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/expensesby-category', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
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
        const token = await auth.currentUser?.getIdToken(true)


        try {
            const response = await axios.post('http://127.0.0.1:5000/api/timegraphs', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
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
        const token = await auth.currentUser?.getIdToken(true)



        try {
            const response = await axios.post('http://127.0.0.1:5000/api/inoutgraph', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("Time graph data:", response.data);
            setinoutgraph(response.data);
        } catch (error) {
            console.error("Error fetching time graph data:", error);
        }
    }

    if (!graphs || !timeGraph || !inoutgraph) return <p>There is no available data yet. Upload your financial transaction info to the Parser tab to see your statistics.</p>;


    return (
        <div className="widgets">


            <div className="info">
                <span className={"time"}> {time.toLocaleTimeString()} <br/> </span>
                <span className = {"date"}> {currDate}</span>
            </div>
            <div className="pie">
                <h3 className="pietitle">This Month’s Spending by Category</h3>
                <div className="pie-chart-container">
                    {graphs && (
                        <Pie
                            data={graphs}
                            options={{
                                plugins: {
                                    legend: { display: false }
                                },
                                responsive: true,
                                maintainAspectRatio: false
                            }}
                        />
                    )}
                </div>
            </div>

            <div className="earning-report">
                <h2>This Month’s Report</h2>
                <div className="report-row">
                    <span>Earnings:</span>
                    <span className="report-value positive">
                      ${Math.round(report.earning ?? 0)}
                    </span>

                </div>
                <div className="report-row">
                    <span>Spending:</span>
                    <span className="report-value negative">${Math.round(report.spending ?? 0)}</span>
                </div>
                <div className="report-row">
                    <span>Net:</span>
                    <span className={`report-value ${Math.round(report.net ?? 0) >= 0 ? 'positive' : 'negative'}`}>
                      ${Math.round(report.net ?? 0)}
                    </span>
                </div>
            </div>

            <div className="quote">
                <h3 className="quote-title">Quote of the Day</h3>

                <div className="quote-content">
                    <q>{qoute}</q>
                </div>

                <div className="quote-author">
                    <span>~ {author}</span>
                </div>
            </div>


            <div className="transaction">
                <span className={"transaction-title"}> Your recent transaction data:</span>
                <table cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Category</th>
                    </tr>
                    </thead>
                    <tbody>
                    {recent_transactions.map((item, index) => (
                        <tr key={index}>
                            <td>{new Date(item.date).toLocaleDateString()}</td>
                            <td>{item.description}</td>
                            <td>{item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                            <td>{item.category}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>





            <div className="spending-month">
                {timeGraph && <Bar data={timeGraph} />}


            </div>

            <div className="spending-year">
                {inoutgraph && <Bar data={inoutgraph} />}

            </div>








        </div>
    );
}

export default Home;
