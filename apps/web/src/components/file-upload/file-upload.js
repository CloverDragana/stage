"use client"

import { useState } from "react";

function FileUpload({ fileType, onClose }) {

    const [ selectedFile, setSelectedFile ] = useState(null);
    const [ textUpload, setTextUpload ] = useState("");

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleTextUpload = (event) => {
        setTextUpload(event.target.value);
    }

    return (
        <div>
            <div>
                <h2>Create a {fileType} Post</h2>
            </div>
        </div>
    );
}

export default FileUpload;