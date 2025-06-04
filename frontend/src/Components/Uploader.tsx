import {type ChangeEvent} from "react";

type Props = {
    file: File | null;
    setFile: (file: File | null) => void;
};

const Uploader: React.FC<Props> = ({ file, setFile }) => {

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files !== null) {
            setFile(e.target.files[0])
        }
    }
    return <div>
        <input type="file" name="filename" onChange={handleFileChange} accept="text/csv" />
        {file && <p>
            File: {file.name}
            Size: {(file.size / 1024).toFixed(2)} KB
            Type: {file.type}
        </p>}
    </div>
}

export default Uploader;