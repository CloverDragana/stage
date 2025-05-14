"use client";

import { useState, useEffect } from "react";

function PostContent({postData}) {
    const [imageError, setImageError] = useState(false);
    const [postImage, setPostImage] = useState(null);

    useEffect(() => {
        if (postData && postData.post_image) {
            const localStoragePostImage = localStorage.getItem(`postImage-${postData.postid}`);
                if (localStoragePostImage) {
                    setPostImage(localStoragePostImage);
                }
        }
    },[postData]);


    if (!postData) {
        return (
            <div className="px-4 py-2">
                <p className="ml-[50px] text-gray-500 italic">No post content available</p>
            </div>
        );
    }
    
    const postText = postData.post_text || postData.postText || "";
    const mediaUrl = postImage || (postData.post_image ? `/uploads/posts/${postData.post_image}` : null)
    const postType = postData.post_type || postData.postType || "text";

    return(
        <div className="py-2 text-lg">
            {postType === 'text' ? (
                <div className="px-4">
                    {postText ? (
                        <p className="">{postText}</p>
                    ) : (
                        <p className="ml-[50px] text-gray-500 italic">Empty post</p>
                    )}
                </div>
            ):(
                <div>
                    {postText && (
                        <p className="px-4">{postText}</p>
                    )}
                    {mediaUrl && !imageError && (
                        <div className="flex justify-center">
                            <img 
                                src={mediaUrl}
                                alt="Post media"
                                className="max-w-full w-auto max-h-96"
                                onError={() => setImageError(true)}
                            />
                        </div>
                    )}
                    {!postText && !mediaUrl && (
                        <p className="ml-[50px] text-gray-500 italic">Empty post</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default PostContent;
