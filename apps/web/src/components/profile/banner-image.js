"use client";

import { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

function BannerImage({ userId, profileType, isEditing = false, imageUpdate, isOwnProfile }) {
    const { data: session } = useSession();
    const inputFileRef = useRef(null);
    const [bannerImage, setBannerImage] = useState(null);
    const [previewBannerImage, setPreviewBannerImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    useEffect(() => {

        if (!userId || !profileType) {
            console.log("Missing or invalid userId or profileType, using default image");
            setBannerImage("/userIcon.jpeg");
            setIsLoading(false);
            return;
        }

        const fetchBannerImage = async () => {
            try {
                if (isOwnProfile && session?.user?.id) {
                    
                    const localStorageBannerImage = localStorage.getItem(`bannerImage-${session?.user?.id}-${session?.user?.profileType}`);
                    if (localStorageBannerImage && (localStorageBannerImage.startsWith('data:image')) || localStorageBannerImage.startsWith('/uploads')) {
                        setBannerImage(localStorageBannerImage);
                    }
                }
                
                const response = await fetch(
                    `${getApiUrl()}/api/profiles/get-banner-image?userId=${userId}&profileType=${profileType}`, 
                    { 
                        method: "GET", 
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${session.accessToken}` } }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.bannerImage) {
                        const imagePath = `/uploads/profile/${data.bannerImage}`;
                        setBannerImage(imagePath);
                        
                        if (isOwnProfile) {
                            localStorage.setItem(`bannerImage-${session?.user?.id}-${session?.user?.profileType}`, imagePath);
                        }
                    } else {
                        console.log("No profile picture in database, using default");
                        setBannerImage("/userIcon.jpeg");
                    }
                } else {
                    setBannerImage("/userIcon.jpeg");
                }
            } catch (error) {
                setBannerImage("/userIcon.jpeg");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBannerImage();
    }, [userId, profileType, isOwnProfile, session]);

    const handleImageChangeClick = () => {
        if (isEditing && inputFileRef.current){
            inputFileRef.current.click();
        }
    };

    const handleImageUpload = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const fileReader = new FileReader();

            fileReader.onload = () => {
                const base64Image = fileReader.result;
                setPreviewBannerImage(base64Image);

                if(imageUpdate){
                    imageUpdate(file, base64Image, 'banner');
                }
            };

            fileReader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        return () => {
            if (previewBannerImage) {
                URL.revokeObjectURL(previewBannerImage);
            }
        };
    }, [previewBannerImage]);

    const displayPreview = previewBannerImage || bannerImage;

    return(
        <div className="w-full h-full relative overflow-hidden" onClick={handleImageChangeClick}>
            <img 
                src={displayPreview} 
                alt="banner" 
                className="w-full h-full object-cover"
                onError={(e) => {
                    console.log("Error loading image, falling back to default");
                    e.target.src = "/theater-background.jpg";
                    setBannerImage("/theater-background.jpg");
                }}
            />
            
            {isEditing && (
                <>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer">
                    <div className="text-white text-3xl font-light transition-transform duration-200 hover:-translate-y-2">Add a Banner Image</div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={inputFileRef}
                        onChange={handleImageUpload}
                    />
                </div>
                </>
            )}
        </div>
    );
}

export default BannerImage;