"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import UserProfileDisplay from "../profile/user-profile-display";

function Comments({isOnPost, postId, isOnPortfolio, portfolioId, onNewComment}){

    const {data: session} = useSession();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    };

    useEffect( () => {
        fetchComments();
    },[postId, portfolioId]);

    const fetchComments = async () => {
        try{
            let endpoint;

            if (isOnPost && postId){
                endpoint = `${getApiUrl()}/api/posts/get-comments?postId=${postId}`;
            } else if (isOnPortfolio && portfolioId){
                endpoint = `${getApiUrl()}/api/portfolios/get-comments?portfolioId=${portfolioId}`;
            } else {
                console.error("Invalid parameters for fetching comments");
                return;
            }

            const response = await fetch(endpoint,{
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                }
            })

            if(response.ok){
                const commentData = await response.json();

                if (commentData.comments && Array.isArray(commentData.comments)) {
                    setComments(commentData.comments);
                } else {
                    setComments([]);
                }
            } else{
                console.error("Failed to fetch comments", response.status);
            }
        }catch(error){
            console.error("Error feetching comments", error)
        }
    }

    const handleNewComment = async () => {
        if (!newComment.trim()) return;

        const endpoint = `${getApiUrl()}/api/${isOnPost ? 'posts' : 'portfolios'}/create-comment`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({
                    postId,
                    portfolioId,
                    userId: session?.user?.id,
                    profileType: session?.user?.profileType,
                    comment: newComment.trim(),
                })
            });

            // body: JSON.stringify({
            //     postId: isOnPost ? postId : null,
            //     portfolioId: isOnPortfolio ? portfolioId : null,
            //   })
    
            if (response.ok){
                setNewComment("");
                fetchComments();
                if(onNewComment) onNewComment();
            } else {
                console.error("Unable to add a new comment", response.status);
            }
        } catch (error){
            console.error("Error adding a new comment", error);
        }
    };

    return(
        <div className="p-4 border-t mt-2 flex flex-col gap-3">
            <div className="flex gap-2 mt-2">
                <input
                    type="text"
                    placeholder="Add a new comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-grow border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <button onClick={handleNewComment} className="bg-secondary text-white text-sm px-3 py-1 rounded">Post</button>
            </div>
            {comments.length === 0 && <p className="text-sm text-gray-600">No comments have been posted yet.</p>}
            {comments.map((comment) => (
                <div key={comment.interactionid} className="bg-gray-100 p-2 rounded">
                    <UserProfileDisplay 
                            user={{
                                userId: comment.userid,
                                profileType: comment.profile_type,
                                username: comment.username,
                                fullname: comment.fullname,
                            }}
                            isOnContent={true}
                            accessToken={session?.accessToken}
                    />
                    <p>{comment.comment}</p>
                    <p>
                        {new Date(comment.created_at).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            ))}
        </div>
    );
};
export default Comments;