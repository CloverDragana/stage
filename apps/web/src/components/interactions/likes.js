"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { HeartIcon } from '@heroicons/react/24/solid';

function Like({ isOnPost, postId, isOnPortfolio, portfolioId }){
    const { data: session } = useSession();
    const [likes, setLikes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    //use 'some' to check if objects in like Array contain the same userId and profileType as session
    const sessionUserLike = likes.some(like => 
        like.userid === session?.user?.id && 
        like.profiletype === session?.user?.profileType
    );

    const getApiUrl = () => {
            return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    }

    useEffect(() => {

        if (isOnPost){
            if (!postId) {
                console.log("No valid postId provided");
                setIsLoading(false);
                return;
            }
        }
        
        if (isOnPortfolio){
            if (!portfolioId) {
                console.log("No valid portfolioId provided");
                setIsLoading(false);
                return;
            }
        }

        if (session?.accessToken) {
            fetchContentLikes();
        }
    }, [session, isOnPost, postId, isOnPortfolio, portfolioId]);

    const fetchContentLikes = async () => {
        // if(!postId) return;
        try {

            let endpoint;

            if (isOnPost && postId){
                endpoint = `${getApiUrl()}/api/posts/get-post-likes?postId=${postId}`;
            } else if (isOnPortfolio && portfolioId){
                endpoint = `${getApiUrl()}/api/portfolios/get-portfolio-likes?portfolioId=${portfolioId}`;
            } else {
                setIsLoading(false);
                return;
            }
            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                }
            });

            if (response.ok){
                const likesData = await response.json();

                if (likesData.likes && Array.isArray(likesData.likes)) {
                    setLikes(likesData.likes);
                } else {
                    setLikes([]);
                }
            } else {
                console.error("Error fetching likes:", response.status);
                setLikes([]);
            }
        } catch (error) {
            console.error("Error fetching likes:", error);
            setLikes([]);
        } finally{
            setIsLoading(false);
        }
    };

    const handleLikeToggle = async () => {
        if (!postId && isOnPost) {
            console.error("Cannot like post: postId is undefined");
            return;
        }

        if (!portfolioId && isOnPortfolio) {
            console.error("Cannot like post: postId is undefined");
            return;
        }

        if (!session?.user?.id || !session?.user?.profileType) {
            console.error("Cannot like content without user id and profile type");
            return;
        }
        try {
            const actionEndpoint = sessionUserLike ? 'unlike' : 'like';
            const contentEndpoint = isOnPost ? 'posts' : isOnPortfolio ? 'portfolios': null;

            const response = await fetch(`${getApiUrl()}/api/${contentEndpoint}/${actionEndpoint}-${contentEndpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({
                    postId: postId,
                    portfolioId: portfolioId,
                    userId: session?.user?.id,
                    profileType: session?.user?.profileType
                })
            });
    
            if (response.ok) {
                console.log(`content ${sessionUserLike ? 'unliked' : 'liked'} successfully`);
                
                const likeData = await response.json();
                const likesArray = Array.isArray(likeData.likes) ? likeData.likes : [];
                setLikes(likesArray);
                fetchContentLikes();
            } else {
                console.error(`Error ${sessionUserLike ? 'unliking' : 'liking'} content:`, response.status);
            }
        } catch (error) {
            console.error("Error liking content:", error); 
        }
    }

    return (
        <div className="flex flex-row gap-2">
            <p>{likes.length}</p>
            {likes.length === 1 ? (
                <p>Like</p>
            ) : (
                <p>Likes</p>
            )}
            <button onClick={handleLikeToggle}>
                {sessionUserLike ? (
                    <HeartIcon className="w-5 h-5 fill-red-600" />
                ) : (
                    <HeartIcon className="w-5 h-5 stroke-black stroke-2 fill-transparent" />
                )}
            </button>
        </div>
    );
}

export default Like;