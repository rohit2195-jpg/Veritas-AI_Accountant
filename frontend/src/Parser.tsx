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



type UploadStatus  = "idle" | "uploading" | "success" | "error";
const Parser: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([
        { name: 'Food', notes: '' },
        { name: 'Entertainment', notes: '' }
    ]);
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);

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


    async function getCategories() {
        const formData = new FormData();
        formData.append("userid", "11");

        try {
            const token = await auth.currentUser?.getIdToken(true)

            const response = await axios.post('http://127.0.0.1:5000/load_categories', formData, {
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
            const response = await axios.post('http://127.0.0.1:5000/uploadcsv', formData, {
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

            {status === "uploading" && <p>{progress}</p>}
            {status === "success" && <p>file uplaoded</p>}
            <h2>3. Upload!</h2>
            {file && status !== "uploading" && <button className={"upload"} onClick={handleUpload}>Upload</button>}
        </div>
    );
};

export default Parser;
