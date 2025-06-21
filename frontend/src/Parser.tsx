import React, {useEffect, useState} from 'react';
import Uploader from "./Components/Uploader.tsx";
import axios from 'axios';


// Define the shape of a category
interface Category {
    name: string;
    notes: string;
}

type UploadStatus  = "idle" | "uploading" | "success" | "error";
const Parser: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([
        { name: 'Food', notes: '' },
        { name: 'Entertainment', notes: '' }
    ]);
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);

    async function getCategories() {
        const formData = new FormData();
        formData.append("userid", "11");

        try {
            const response = await axios.post('http://127.0.0.1:5000/load_categories', formData, {
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
    }, []);

    async function handleUpload(){
        if (!file) return;
        setStatus("uploading");
        setProgress(0);
        const formData = new FormData();
        formData.append("filename", file);
        formData.append('categories', JSON.stringify(categories));

        try {
            const response = await axios.post('http://127.0.0.1:5000/uploadcsv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
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
        <div>
            <h2>Parser Page</h2>
            <Uploader file={file} setFile={setFile} />
            <button onClick={handleAddCategory}>Add Category</button>


            {categories.map((category, index) => (
                <div
                    key={index}
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

            {status === "uploading" && <p>{progress}</p>}
            {status === "success" && <p>file uplaoded</p>}

            {file && status !== "uploading" && <button onClick={handleUpload}>Upload</button>}
        </div>
    );
};

export default Parser;
