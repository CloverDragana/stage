"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

function CommentCount({isOnPost, postId, isOnPortfolio, portfolioId, refreshCount}){

    const { data: session } = useSession();
    const [commentCount, setCommentCount] = useState();
    const [showComments, setShowComments] = useState(false);

    const getApiUrl = () => {
            return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        }

        useEffect(() => {

            if (isOnPost){
                if (!postId) {
                    console.log("No valid postId provided");
                    return;
                }
            }
            
            if (isOnPortfolio){
                if (!portfolioId) {
                    console.log("No valid portfolioId provided");
                    return;
                }
            }
    
            if (session?.accessToken) {
                fetchCommentCount();
            }
        }, [session, isOnPost, postId, isOnPortfolio, portfolioId, refreshCount]);

    const fetchCommentCount = async () => {
        try {
            let endpoint;

            if (isOnPost && postId){
                endpoint = `${getApiUrl()}/api/posts/get-comment-count?postId=${postId}`;
            } else if (isOnPortfolio && portfolioId){
                endpoint = `${getApiUrl()}/api/portfolios/get-comment-count?portfolioId=${portfolioId}`;
            } 

            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                }
            })

            if (response.ok){
                const commentCount = await response.json();
                setCommentCount(commentCount);
            } else {
                console.error("Error fetching total comment number", response.status);
                setCommentCount();
            }
        } catch (error){
            console.error("Error fetching comment tally", error);
            setCommentCount();
        }
    }

    return (
        <div className="flex flex-row gap-2">
            <p>{commentCount}</p>
            {isOnPost ? (
                <div className="flex flex-row gap-2">
                    {commentCount === 1 ? (
                        <p>Comment</p>
                    ) : (
                        <p>Comments</p>
                    )}
                    <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-black" />
                </div>
            ) : (
                <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-black" />
            )}
        </div>
    );
}

export default CommentCount;