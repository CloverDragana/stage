"use client";

import { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

function StarWork({ userId, profileType, isEditing = false, imageUpdate, isOwnProfile }) {
    const { data: session } = useSession();
    const inputFileRefs = [useRef(null), useRef(null), useRef(null)];
    const [starWorkImages, setStarWorkImages] = useState([null, null, null]);
    const [previewStarWorkImages, setPreviewStarWorkImages] = useState([null, null, null]);
    const [isLoading, setIsLoading] = useState(true);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    useEffect(() => {

        console.log("Star Work rendering for:", {
            userId,
            profileType,
            isOwnProfile
        });
        if (!userId || !profileType) {
            console.log("Missing or invalid userId or profileType, using default image");
            setIsLoading(false);
            return;
        }

        const fetchStarWorkImages = async () => {
            try {
                if (isOwnProfile && session?.user?.id) {
                    
                    const localStorageStarWorks = localStorage.getItem(`starWorkImages-${session?.user?.id}-${session?.user?.profileType}`);
                    if (localStorageStarWorks) {
                        try {
                            const arrayImages = JSON.parse(localStorageStarWorks);
                            if(Array.isArray(arrayImages)){
                                setStarWorkImages(arrayImages);
                            }
                        } catch (error){
                            console.log("Error getting star work images", error)
                        }
                    }
                }

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                
                const response = await fetch(
                    `${getApiUrl()}/api/profiles/get-star-work?userId=${userId}&profileType=${profileType}`,
                    { 
                        method: "GET", 
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${session.accessToken}` } }
                );
                
                if (response.ok) {
                    const data = await response.json();

                    console.log("Star work data from API:", data);
                    console.log("Star work array structure:", data.starWork);
                    
                    if (data.starWork) {
                        // const imageNames = data.starWork;
                        
                        const imagePaths = data.starWork.map(image =>
                            image ? `/uploads/profile/${image}` : null );
                        
                        setStarWorkImages(imagePaths);
                        
                        if (isOwnProfile) {
                            localStorage.setItem(`starWorkImages-${session?.user?.id}-${session?.user?.profileType}`, JSON.stringify(imagePaths));
                        }
                    } else {
                        console.log("No star work images found, setting defaults");
                        const defaultImages = [null, null, null];
                        setStarWorkImages(defaultImages);
                    }
                } 
            } catch (error) {
                console.log("Failed to retrieve star work images", error)
            } finally {
                setIsLoading(false);
            }
        };

        fetchStarWorkImages();
    }, [userId, profileType, isOwnProfile, session]);

    const handleImageChangeClick = (image) => {
        return () => {
            if (isEditing && inputFileRefs[image].current){
                inputFileRefs[image].current.click();
            }
        }
    };

    const handleImageUpload = (event, image) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const fileReader = new FileReader();

            console.log("Image upload triggered for index:", image);3

            fileReader.onload = () => {
                const base64Image = fileReader.result;

                const previewImage = [...previewStarWorkImages];
                previewImage[image] = base64Image;
                setPreviewStarWorkImages(previewImage);

                if(imageUpdate){
                    console.log("Calling imageUpdate with index:", image);
                    imageUpdate(file, base64Image, 'starWork', image);
                }
            };

            fileReader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        return () => {
            previewStarWorkImages.forEach(previewImage => {
                if (previewImage) {
                    URL.revokeObjectURL(previewImage);
                }
            })
        };
    }, [previewStarWorkImages]);

    const displayPreview = previewStarWorkImages || starWorkImages || "/userIcon.jpeg";

    // const getImageUrl = (filename) => {
    //     if (!filename) return null;
        
    //     if (filename.startsWith('data:') || filename.startsWith('http')) {
    //       return filename;
    //     }
        
    //     // If it's just a filename, construct the full URL
    //     if (filename.includes('/uploads/')) {
    //       return `${`http://localhost:3000`}${filename}`;
    //     } else {
    //       return `${getApiUrl()}/uploads/profile/${filename}`;
    //     }
    //   };

    return(
        <div className="flex flex-row justify-evenly m-6">
            {[0, 1, 2].map((starWorkIndex) => (
                <div 
                    key={starWorkIndex}
                    className="relative"
                    onClick={handleImageChangeClick(starWorkIndex)}
                >
                    {(previewStarWorkImages[starWorkIndex] || starWorkImages[starWorkIndex]) ? (
                        <img 
                        src={previewStarWorkImages[starWorkIndex] || starWorkImages[starWorkIndex]}
                            alt={`star work ${starWorkIndex + 1}`} 
                            className="w-48 h-48 object-cover"
                            onError={(e) => {
                                console.log("Error loading image, falling back to default");
                                console.log("Failed URL:", e.target.src);
                                e.target.src = "/userIcon.jpeg";
                                setStarWorkImages("/userIcon.jpeg");
                            }}
                        />
                    ) : (
                        <img src="/image_icon.png" alt="image icon" className=" w-48 h-48" />
                    )}
                    
                    {isEditing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer">
                            <div className="text-white text-center text-xl font-light hover:-translate-y-2 transition-transform duration-200">Upload Work to Feature</div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={inputFileRefs[starWorkIndex]}
                                onChange={(e) =>handleImageUpload(e, starWorkIndex)}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default StarWork;