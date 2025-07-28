import { useState } from 'react';
import {Link, useNavigate} from "react-router-dom";
import screenshot from "./assets/screenshot.png"
import ai_pic from "./assets/Screenshot 2025-07-28 at 1.46.16 PM.png"
import dash from "./assets/Screenshot 2025-07-28 at 1.43.53 PM.png"

function Start() {

    const navigate = useNavigate();

    return (
        <div>
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontSize: '100px',
                fontWeight: 'bold'

            }}
        >
            Welcome to The Financial Analyst
            <div className="buttons" style={{
                display: 'flex',
                gap: '10px',
            }}>
                <button onClick={() => navigate('/login')} style={{
                    backgroundColor: 'blue',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '5px',
                    gap: '10px',
                    width: '300px',
                    height: '100px',
                    fontSize: '40px',

                }}>
                    Login
                </button>
                <button onClick={() => navigate('/signup')} style={{
                    backgroundColor: 'green',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '5px',
                    gap: '10px',
                    width: '300px',
                    height: '100px',
                    fontSize: '40px',
                }}>
                    Sign up
                </button>
            </div>
        </div>

            <h2 style={{
                fontSize: '50px',
                fontWeight: 'bold',

            }}> Visualize your spending</h2>

            <div style={{
                display: 'flex',
                flexDirection: 'row',
                padding: '20px',
                gap: '10px',
                fontSize: '38px',


            }}>
            <p>Our dashboard user interface makes it easy to track spending, income, and trends.
            There are a variety of graphs to show spending for the last month up to years.
            The detail will help individuals analyse and learn their spending habits

            </p>
                <img src={dash} alt="photo" style={{width: '55%'}} />
            </div>


            <h2 style={{
                fontSize: '50px',
                fontWeight: 'bold',

            }}> Categorize Transactions using AI </h2>

            <div style={{
                display: 'flex',
                flexDirection: 'row',
                padding: '10px',
                gap: '10px',
                fontSize: '38px',


            }}>

            <p>
                This application uses an API from Gemini LLMs to ingest and categorize transactions.
                LLM's use of natural language makes it particularly strong at inferencing the correct category.
                The categories are customizable by the user.
            </p>
            <img src={screenshot} alt="photo" style={{width: '60%'}} />
            </div>

            <h2 style={{
                fontSize: '50px',
                fontWeight: 'bold',

            }}> Get personalized LLM powered advice</h2>


            <div style={{
                display: 'flex',
                flexDirection: 'row',
                padding: '10px',
                gap: '10px',
                fontSize: '38px',


            }}>
            <p>
                You can also ask questions about your financial data to an LLM, and it will output personalized advice after reviewing the dataset.
                The LLM uses a retrieval agumented generation structure, where it searches the database by executing python/pandas code.
                With those results, it generates a personalized response
            </p>
            <img src={ai_pic} alt="photo" style={{width: '55%'}} />
            </div>


        </div>





    );
}

export default Start;