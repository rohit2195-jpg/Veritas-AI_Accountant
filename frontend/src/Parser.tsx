import React, {useEffect, useState} from 'react';
import Uploader from "./Components/Uploader.tsx";
import axios from 'axios';
import './css/Parser.css';


// Define the shape of a category
interface Category {
    name: string;
    notes: string;
}

import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {firebaseConfig} from "./firebase-config.ts";
import {API_BASE} from "./config.ts";


type UploadStatus  = "idle" | "uploading" | "success" | "error";
const Parser: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([
        { name: 'Food', notes: '' },
        { name: 'Entertainment', notes: '' }
    ]);
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [file, setFile] = useState<File | null>(null);
    // @ts-ignore
    const [progress, setProgress] = useState(0);



    const app = initializeApp(firebaseConfig);

    const auth = getAuth(app);


    async function getCategories() {
        const formData = new FormData();
        formData.append("userid", "11");

        try {
            const token = await auth.currentUser?.getIdToken(true)

            const response = await axios.post(`${API_BASE}/load_categories`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
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
    }, []);

    async function handleUpload(){
        if (!file) return;
        setStatus("uploading");
        setProgress(0);
        const formData = new FormData();
        formData.append("filename", file);
        formData.append('categories', JSON.stringify(categories));
        const token = await auth.currentUser?.getIdToken(true)


        try {
            const response = await axios.post(`${API_BASE}/uploadcsv`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                onUploadProgress: progressEvent => {
                    let progress = 0;
                    if (progressEvent.lengthComputable && typeof progressEvent.total === 'number') {
                        progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    }
                    setProgress(progress);
                }
            });
            setStatus("success");
            setProgress(100);
            console.log('Upload successful:', response.data);
        } catch (error) {
            setStatus("error");
            console.error('Upload failed:', error);
            setProgress(0);
        }
    }


    // Add a new blank category
    const handleAddCategory = () => {
        setCategories([...categories, { name: '', notes: '' }]);
    };


    // Remove a category by index
    const handleRemoveCategory = (index: number) => {
        setCategories(prev => prev.filter((_, i) => i !== index));
    };

    // Update category name
    const handleNameChange = (index: number, newName: string) => {
        const updated = [...categories];
        updated[index].name = newName;
        setCategories(updated);
    };

    // Update category notes
    const handleNotesChange = (index: number, newNotes: string) => {
        const updated = [...categories];
        updated[index].notes = newNotes;
        setCategories(updated);
    };

    return (
        <div className="container">
            <div className="step0">
                <h2>0. Verify your csv is correctly formatted</h2>
                <p> The CSV should have 4 columns, <br/>
                    date / Y-m-d, <br/>
                    description / small description about the transaction, <br/>
                    amount / negative for money going out, postive for money coming in ,<br/>
                    type / credit-money received, debit-money payed,<br/>
                    <br/>
                    Example:
                </p>

                <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '15px' }}>
                    date,description,amount,type <br/>
                    2024-12-31,Salary Payment,3250.00,credit <br/>
                    2025-01-02,Grocery Shopping,-154.78,debit <br/>
                    2025-01-03,Starbucks Coffee,-8.45,debit <br/>
                    2025-01-05,Freelance Income,450.00,credit <br/>
                    2025-01-07,Spotify Subscription,-10.99,debit <br/>
                    2025-01-08,Amazon Purchase,-89.20,debit <br/>
                    2025-01-10,Gas Station,-47.60,debit <br/>
                </pre>



            </div>
            <div className="step1">
                <h2>1. Upload financial transaction history</h2>
                <Uploader file={file} setFile={setFile} />
            </div>
            <div className="step2">

            <div className="step2-info">
                <h2>2. Set your desired categories</h2>
                <button onClick={handleAddCategory}>Add Category</button>
            </div>



            {categories.map((category, index) => (
                <div
                    key={index}
                    className="step2-category"
                >
                    <input
                        type="text"
                        value={category.name}
                        placeholder="Category name"
                        onChange={(e) => handleNameChange(index, e.target.value)}
                    />

                    <textarea
                        value={category.notes}
                        placeholder="Notes for this category..."
                        onChange={(e) => handleNotesChange(index, e.target.value)}
                    />

                    <button
                        onClick={() => handleRemoveCategory(index)}
                    >
                        Remove
                    </button>
                </div>
            ))}
            </div>

            {status === "uploading" && <p>File is still being processed. Please stay on this page until finished</p>}
            {status === "success" && <p>Finished! File is processed</p>}
            <h2>3. Upload!</h2>
            {file && status !== "uploading" && <button className={"upload"} onClick={handleUpload}>Upload</button>}
        </div>
    );
};

export default Parser;
