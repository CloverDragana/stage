
"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import UserProfileDisplay from "../profile/user-profile-display";
import { CameraIcon } from "@heroicons/react/24/outline";

// https://www.youtube.com/watch?v=pWd6Enu2Pjs
// https://www.geeksforgeeks.org/file-uploading-in-react-js/

function CreatePost({ onClose }){
    const { data: session } = useSession();

    const inputFileRef = useRef(null);
    const [ content, setContent ] = useState("");
    const [ file, setFile ] = useState(null);
    const [ fileUploadPreview, setFileUploadPreview ] = useState(null);
    const [ statusMessage, setStatusMessage ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const [userData, setUserData] = useState(null);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    useEffect(() => {
        if (session?.user?.id){
            const fetchUserData = async () => {
                try {

                    setUserData(session.user);

                    const response = await fetch(
                        `${getApiUrl()}/api/profiles/get-profile-content?id=${session.user.id}&profileType=${session.user.profileType}`,
                    {
                        method: "GET", 
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${session.accessToken}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // setUserData(data);
                        // console.log("User data fetched successfully:", data);

                        const updateData = {
                            ...session.user,
                            ...data
                        }; 

                        setUserData(updateData);
                        console.log("User data:", userData);
                    } else {
                        setUserData(session?.user);
                    }

                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUserData(session?.user);
                }
            };

            fetchUserData();
        }
    }, [session]);

    const handleImagePostUpload = () => {
        if (inputFileRef.current) {
            inputFileRef.current.click();
        } 
    };

    const handleImageUpload = (event) => {
        if(event.target.files && event.target.files[0]){
            const selectedFile = event.target.files[0];
            const fileReader = new FileReader();

            setFile(selectedFile);

            fileReader.onload = () => {
                const base64Image = fileReader.result;
                setFileUploadPreview(base64Image);
                setStatusMessage("");
            };

            fileReader.readAsDataURL(selectedFile);
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!content.trim() && !file) {
            setStatusMessage("Please enter a message or upload a file");
            return;
        }

        setStatusMessage("Creating your post...");
        setLoading(true);

        try{
            const formData = new FormData();

            if (!session?.user?.id || !session?.user?.profileType) {
                throw new Error("Missing required user information");
            }

            formData.append("userId", session?.user?.id);
            formData.append("profileType", session?.user?.profileType);
            formData.append("postText", content);

            if (file){
                formData.append("file", file);
            }

            const response = await fetch(`${getApiUrl()}/api/posts/create-post`,{
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.accessToken}`
                },
                body : formData
            });

            if (response.ok){
                const data = await response.json();
                console.log("Post created successfully:", data);

                if (data.postImage){
                    const localStoragePostImage = `postImage-${data.postId}`;
                    const imagePath = `/uploads/posts/${data.postImage}`;
                    localStorage.setItem(localStoragePostImage, imagePath);
                    console.log("Stored post image URL in localStorage:", localStoragePostImage, imagePath);
                }

                setStatusMessage("Post created successfully");
                setTimeout(() => {
                    onClose();
                }, 1000);

                window.location.reload();

            } else {
                const errorData = await response.json();
                console.error("Error response data:", errorData);
                throw new Error(errorData.error || "Failed to create post");
            }

        } catch(error){
            console.error("Error creating post:", error);
            setStatusMessage(error.message || "Failed to create post. Please try again.");
        } finally{
            setLoading(false);
        }
    }

    const disableButton = (content.length < 1 && !file) || loading;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[10000] w-full h-full">
            <div className="bg-white p-4 rounded-lg shadow-lg relative z-[10000] w-2/5 max-h-[80vh] overflow-y-auto">
                <form className="flex flex-col" onSubmit={handleSubmit}>
                    {statusMessage && (
                        <p className="bg-primary/50 border border-secondary/85 text-secondary px-4 py-3 mb-4 rounded relative">
                            {statusMessage}
                        </p>
                    )}
                    <div className="flex gap-4 items-start w-full">
                        <div className="flex flex-col w-full">
                            <div>
                                <UserProfileDisplay
                                    user = {userData || session?.user}
                                    isOnContent={true}
                                    accessToken={session?.accessToken}
                                />
                            </div>

                            <label className="w-full pt-3">
                                <input
                                    className="bg-transparent flex-1 border-none outline-none w-full"
                                    type="text"
                                    placeholder="What's on your mind today..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </label>

                            {/* Preview File */}
                            {fileUploadPreview && (
                                <div className="w-auto p-2 mt-2 flex justify-center border-dashed border-2 border-gray-300">
                                    <div className="relative overflow-hidden group">
                                         <img src={fileUploadPreview} alt="post image preview" className="max-w-full h-auto shadow-lg"/>
                                            {!loading && (
                                            <button 
                                                onClick={() => {
                                                    setFileUploadPreview(null);
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
                                </div>
                            )}
                            <div className="flex">
                                <button 
                                    type="button"
                                    onClick={handleImagePostUpload} 
                                    className="flex flex-row items-center justify-center rounded-lg w-auto"
                                >
                                    <CameraIcon className="h-12 w-7" />
                                </button>

                                <input
                                    className="bg-transparent flex-1 border-none outline-none hidden"
                                    ref={inputFileRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <div className="text-neutral-500">Characters: {content.length}</div>
                        <div className="flex flex-row justify-center gap-6">
                            <button 
                                type="submit" 
                                disabled={disableButton}
                                className={`rounded-full p-2 w-auto bg-white border-2 border-green-600 transition-all duration-300 ${disableButton ? "opacity-50 cursor-not-allowed" : "hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]"}`}
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