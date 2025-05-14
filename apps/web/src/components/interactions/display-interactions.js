"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { HeartIcon } from "@heroicons/react/24/solid";
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

function DisplayInteractions({userData, isOwnProfile}){

    const { data: session } = useSession();
    const [interactions, setInteractions] = useState([]);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    }

    useEffect(() => {
        if (session?.accessToken) {
            fetchInteractions();
        }
    }, [session, userData, isOwnProfile]);

    const fetchInteractions = async () => {
        try{

            const response = await fetch(`${getApiUrl()}/api/profiles/get-interactions?userId=${userData.userId}&profileType=${userData.profileType}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // setInteractions(data);
                if (data.interactions && Array.isArray(data.interactions)) {
                    setInteractions(data.interactions);
                } else {
                    setInteractions([]);
                }
            } else{
                console.error("Failed to retrieve profiles interactions", response.status);
            }
        } catch (error) {
            console.error("Error fetching the profiles post and portfolio interactions", error);
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric'
        });
    };

    if(interactions.length === 0) {
        return (
            <div className="mt-10 my-10 flex justify-center">
                <div className="bg-white p-10 mx-6 rounded-md shadow-[0px_0px_6px_6px_rgba(0,_0,_0,_0.1)]">
                    {isOwnProfile ?
                         "You haven't interacted on any posts or portfolios yet." 
                    : isExplore ?
                        "No one outside of your network has created a post yet."
                    : "This porfile has not interacted on any posts or portfolios yet."}
                </div>
            </div>
        );
    };
    
    return (
        <div className="flex justify-center items-center">
        <div className="flex flex-col gap-6 items-center justify-center w-3/6">
            {interactions.map((interaction) => (
                <div key={interaction.interactionid} className="bg-gray-100 p-4 rounded-lg w-full  shadow-xl border-2 border-gray-200">
                    <div className="mb-2">
                        {interaction.post_id && interaction.postlike && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <HeartIcon className="h-5 w-5 text-red-500" />
                                <p>You liked this post on {formatDate(interaction.created_at)}</p>
                            </div>
                        )}
                        {interaction.post_id && interaction.comment && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-black" />
                                <p>You commented on this post on {formatDate(interaction.created_at)}</p>
                            </div>
                        )}

                        {interaction.portfolio_id && interaction.portfoliolike && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <HeartIcon className="h-5 w-5 text-red-500" />
                                <p>You liked this portfolio on {formatDate(interaction.created_at)}</p>
                            </div>
                        )}
                        {interaction.portfolio_id && interaction.comment && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-black" />
                                <p>You commented on this portfolio on {formatDate(interaction.created_at)}</p>
                            </div>
                        )}
                    </div>
                    <div className="bg-white rounded border-2 border-gray-200 ">
                            <div className="flex items-start gap-3 p-2 ">
                                <div>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {interaction.description || interaction.comment || ""}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        By {interaction.author_username || "Unknown user"}
                                    </p>
                                </div>
                            </div>
                    </div>
                </div>
            ))}
        </div>
        </div>
    );
}

export default DisplayInteractions;