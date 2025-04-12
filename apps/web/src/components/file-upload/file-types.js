"use client";

import { useRef } from "react";

function FileType({ onFileSelected }) {
    const inputFileRef = useRef(null);
    
    const FileTitles = [
        { title: "Image", type: "image", icon:"/image_icon.png"},
        // { title: "Video", type: "video", icon:"/video_icon.png"},
        // { title: "Audio", type: "audio", icon:"/audio_icon.png"}
    ];

    const handleFileClicked = () => {
        if (inputFileRef.current) {
            inputFileRef.current.click();
        }       
    }

    return(
        <div className="w-full flex flex-row items-centered justify-evenly gap-4">
            {FileTitles.map((file) => (
                <div key={file.title} className="flex flex-col items-center">
                    <button onClick={handleFileClicked} className={`w-auto rounded-lg flex items-center justify-center p-2 `}>
                        <img src={file.icon} alt={file.title} className="w-[50px] h-[50px] rounded-md transition-transform duration-200 ease-in-out hover:-translate-y-2"/>
                    </button>
                    {/* <span className="text-center text-black font-semibold text-md">{file.title}</span> */}
                    <input
                    type="file"
                    accept="image/*"
                    ref={inputFileRef}
                    className="hidden"
                    onChange={onFileSelected}
                    />
                </div>
            ))}
        </div>
    );
}

export default FileType;