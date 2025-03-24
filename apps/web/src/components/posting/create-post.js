
"use client";

import { useState } from "react"
import { useSession } from "next-auth/react"
import FileType from "../file-upload/file-types";

// https://www.youtube.com/watch?v=pWd6Enu2Pjs
// https://www.geeksforgeeks.org/file-uploading-in-react-js/

function CreatePost({ onClose }){
    const { data: session } = useSession();
    const [ content, setContent ] = useState("");
    const [ file, setFile ] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [ fileUploadPreview, setFileUploadPreview ] = useState(null);
    const [ statusMessage, setStatusMessage ] = useState("");
    const [ loading, setLoading ] = useState(false);

    const disableButton = content.length < 1 || loading;

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    const handleFileUpload = (event) => {
        if(event.target.files && event.target.files[0]){
            const selectedFile = event.target.files[0];
            setFile(selectedFile);

            if (fileUrl){
                URL.revokeObjectURL(fileUrl);
            }

            if (selectedFile){
                const url = URL.createObjectURL(selectedFile);
                setFileUrl(url);
                setStatusMessage("");

                const fileReader = new FileReader();
                fileReader.onload = (event) => {
                    setFileUploadPreview(event.target.result);
                };

                fileReader.readAsDataURL(selectedFile);
            } else {
                // setStatusMessage("Please add a valid image file");
                setFileUrl(null);
                setFileUploadPreview(null);
            }
        }
    }

    const handleSubmit = async (error) => {
        error.preventDefault();
        
        if (!content.trim() && !file) {
            setStatusMessage("Please enter a message or file");
            return;
        }

        setStatusMessage("Creating your post...");
        setLoading(true);

        try{
            const formData = new FormData();

            formData.append("content", content);

            if (file){
                formData.append("file", file);
            }

            formData.append("userId", session?.user?.id);
            formData.append("profileType", session?.user?.profileType);

            const response = await fetch(`${getApiUrl()}/api/posts/create-post`,{
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.accessToken}`
                },
                body : formData
            });

            if (!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create post");
            }
            setStatusMessage("Post created successfully");
            setTimeout(() => {
                onClose();
            }, 1000);

        } catch(error){
            console.error("Error creating post:", error);
            setStatusMessage(error.message || "Failed to create post. Please try again.");
        } finally{
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[10000] w-full h-full">
            <div className="bg-white p-4 rounded-lg shadow-lg relative z-[10000] w-2/5 max-h-[80vh] overflow-y-auto">
                <form className="flex flex-col" onSubmit={handleSubmit}>
                    {statusMessage && (
                        <p className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 mb-4 rounded relative">
                            {statusMessage}
                        </p>
                    )}

                    <div className="flex gap-4 items-start pb-4 w-full">
                        <div className="flex flex-col gap-2 w-full">
                            <div>{session?.user?.name}</div>

                            <label className="w-full">
                                <input
                                    className="bg-transparent flex-1 border-none outline-none w-full"
                                    type="text"
                                    placeholder="Post a thing..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </label>

                            {/* Preview File */}
                            {fileUrl && file && (
                                <div className="w-auto p-2 mt-2 flex justify-center border-dashed border-2 border-gray-300">
                            
                                    {file.type.startsWith("image/") ? (
                                        <div className="relative overflow-hidden group">
                                            <img src={fileUrl} alt={file.name} className="max-w-full h-auto shadow-lg"/>
                                            {!loading && (
                                            <button 
                                                onClick={() => {
                                                    setFileUrl(null);
                                                    setFile(null);
                                                }}
                                                className="absolute inset-0 flex items-center justify-center bg-[rgb(0,0,0)] opacity-0 group-hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                                                type="button"
                                            >
                                                <span className="text-white font-bold text-xl">
                                                    Remove
                                                </span>
                                            </button>
                                        )}
                                        </div>
                                    ) : (
                                        <div className="relative overflow-hidden group">
                                            <video src={fileUrl} alt={file.name} className="max-w-full h-auto shadow-lg"/>
                                            {!loading && (
                                            <button 
                                                onClick={() => {
                                                    setFileUrl(null);
                                                    setFile(null);
                                                }}
                                                className="absolute inset-0 flex items-center justify-center bg-[rgb(0,0,0)] opacity-0 group-hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                                                type="button"
                                            >
                                                <span className="text-white font-bold text-xl">
                                                    Remove
                                                </span>
                                            </button>
                                        )}
                                        </div>
                                    )}
                                </div>
                            )}
                            <label className="flex">
                                <div className="py-2 flex flex-row items-center justify-center px-4 rounded-lg w-auto">
                                    <FileType onFileSelected={handleFileUpload}/>
                                </div>

                                <input
                                    className="bg-transparent flex-1 border-none outline-none hidden"
                                    name="media"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-5">
                        <div className="text-neutral-500">Characters: {content.length}</div>
                        <div className="flex flex-row justify-center gap-6">
                            <button 
                                type="submit" 
                                disabled={disableButton}
                                className={`rounded-full p-2 w-auto bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)] ${disableButton ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Creating..." : "Post"}
                            </button>
                            <button 
                                type="button" 
                                onClick={onClose} 
                                disabled={loading}
                                className="rounded-full p-2 w-auto text-red-600 border-2 border-red-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(229,_82,_82,_0.4)]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreatePost;


// "use client";

// import { useState, useEffect } from "react"
// import { useSession } from "next-auth/react"
// import FileType from "../file-upload/file-types";

// // https://www.youtube.com/watch?v=pWd6Enu2Pjs
// // https://www.geeksforgeeks.org/file-uploading-in-react-js/

// function CreatePost({ onClose }){
//     const { data: session } = useSession();
//     const [ file, setFile ] = useState("");
//     const [ selectedFileType, setSelectedFileType ] = useState("text");
//     const [ textPost, setTextPost ] = useState("");
//     const [ fileUploadPreview, setFileUploadPreview ] = useState(null);
//     const [ uploadState, setUploadState ] = useState({status: "idle"});

//     const getApiUrl = () => {
//         return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
//     };

//     const handleFileType = (type) => {
//         setSelectedFileType(type);
//         setFile(null);
//         setFileUploadPreview(null);
//     }

//     const handleFileUpload = (event) => {
//         if(event.target.files && event.target.files[0]){
//             const selectedFile = event.target.files[0];
//             setFile(selectedFile);
//             setUploadState({status: "idle"});

//             if (selectedFileType === "image" && selectedFile.type.startsWith("image/")){
//                 const fileReader = new FileReader();
//                 fileReader.onload = (event) => {
//                     setFileUploadPreview(event.target.result);
//                 };

//                 fileReader.readAsDataURL(selectedFile);
//             } else if (selectedFileType === "video" && selectedFile.type.startsWith("video/")) {
//                 const videoUrl = URL.createObjectURL(selectedFile);
//                 setFileUploadPreview(videoUrl);
//             }  else if (selectedFileType === "audio" && selectedFile.type.startsWith("audio/")) {
//                 const audioUrl = URL.createObjectURL(selectedFile);
//                 setFileUploadPreview(audioUrl);
//             } else {
//                 setUploadState({status:'error'});
//                 // setUploadState(`Please add a valid ${selectedFileType} file`);
//                 setFile(null);
//                 setFileUploadPreview(null);
//             }
//         }
//     }

//     const handleTextUpload = (event) => {
//         setTextPost(event.target.value);
//     }

//     const handlePostUpload = async () => {
        
//         if (selectedFileType !== "text" && !file) {
//             setUploadState({status: "error"});
//             // setError(`Please add in a ${selectedFileType} file to create a post.`);
//             console.log("need a selected file type to create a post");
//             return;
//         }

//         if (selectedFileType === "text" && !textPost.trim()) {
//             setUploadState({status: "error"});
//             // setError("Please write something to create a post.");
//             console.log("no Text entered for a text post");
//             return;
//         }

//         setUploadState("uploading");

//         try{
//             const formData = new FormData();

//             formData.append("postType", selectedFileType);
//             formData.append("postText", textPost);

//             if (file){
//                 formData.append("file", file);
//             }

//             formData.append("userId", session?.user?.id);
//             formData.append("profileType", session?.user?.profileType);

//             const response = await fetch(`${getApiUrl()}/api/posts/create-post`,{
//                 method: "POST",
//                 headers: {
//                     "Authorization": `Bearer ${session.accessToken}`
//                 },
//                 body : formData
//             });

//             if (!response.ok){
//                 const errorData = await response.json();
//                 throw new Error(errorData.error || "Failed to create post");
//             }
//             setUploadState({status: "success"});
//             onClose();

//         } catch(error){
//             console.error("Error creating post:", error);
//             // setError(error.message || "Failed to create post. Please try again.");
//             setUploadState({status: error});
//         } finally{
//             setUploadState({status: "idle"});
//         }
//     }

//     return(
//         <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[10000] w-full h-full">
//                 <div className=" bg-white p-4 rounded-lg shadow-lg flex flex-col text-center relative z-[10000] w-2/5 max-h-[80vh] overflow-y-auto">
//                 <h2 className="text-2xl font-bold">Create a post</h2>
//                 {uploadState === "error" && (
//                     <div>
//                         {error}
//                     </div>
//                 )}
//                     <div className="flex flex-col justify-center items-center w-full" >
//                         <div className="mt-2 py-2 flex flex-row items-center justify-center px-4 border-4 border-[rgb(217,217,217)] rounded-lg w-auto">
//                             <p className="pr-2 min-w-44">Add to post</p>
//                             <FileType fileTypeSelected={handleFileType} selectedType={selectedFileType} onFileSelected={handleFileUpload}/>
//                         </div>
//                         {fileUploadPreview && (
//                             <div className="w-full flex justify-center">
//                                 {selectedFileType === "image" && (
//                                     <img src={fileUploadPreview} alt="Upload Preview" className="max-w-full h-auto rounded-lg shadow-md"/>
//                                 )}
//                             </div>
//                         )}
//                         <div className="flex flex-col items-center justify-center rounded-lg w-full p-3 my-4 min-h-44 shadow-[inset_0px_0px_10px_8px_rgba(217,_217,_217,_1)]">
//                             <textarea 
//                                 value={textPost}
//                                 onChange={handleTextUpload} 
//                                 placeholder="What's on your mind today?" 
//                                 className="px-2 focus:outline-none rounded-lg w-full min-h-36 resize-none"/>
//                         </div>
//                         {selectedFileType !=="text" && (
//                             <div>
//                                 <label>Upload {selectedFileType}</label>
//                                 <input 
//                                     type="file" 
//                                     accept={
//                                         selectedFileType === "image" ? "image/*" : 
//                                         selectedFileType === "video" ? "video/*" : 
//                                         selectedFileType === "audio" ? "audio/*" : ""
//                                     } 
//                                     onChange={handleFileUpload} />
//                             </div>
//                         )}
//                         {fileUploadPreview && (
//                             <div>
//                                 {selectedFileType === "image" && (
//                                     <img src={fileUploadpreview} alt="imagePreview"></img>
//                                 )}
//                                 {selectedFileType === "video" && (
//                                     <video controls>
//                                         <source src={fileUploadPreview} type={file.type}/>
//                                     </video>
//                                 )}
//                                 {selectedFileType === "audio" && (
//                                     <audio controls >
//                                         <source src={fileUploadPreview} type={file.type}/>
//                                     </audio>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                     <div className="flex flex-row justify-center gap-6">
//                         <button 
//                             type="button" 
//                             onClick={handlePostUpload}
//                             className="rounded-full p-2 w-auto bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]">
//                                 {file && uploadState === "uploading" ? "Uploading..." : "Upload"}
//                         </button>
//                         <button 
//                             type="button" 
//                             onClick={onClose} 
//                             className="rounded-full p-2 w-auto text-red-600 border-2 border-red-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(229,_82,_82,_0.4)]">
//                             Cancel
//                         </button>
//                     </div>
//                 </div>
//         </div>
//     );
// }

// export default CreatePost;