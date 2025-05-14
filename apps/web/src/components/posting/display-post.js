"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import UserProfileDisplay from "../profile/user-profile-display";
import PostContent from "./post-content";
import Like from "../interactions/likes";
import CommentCount from "../interactions/comment-count";
import Comments from "../interactions/get-comments";
import ConfirmationPopUp from "../popup-actions/popup-structure";
import { TrashIcon } from "@heroicons/react/24/outline";

function DisplayPost({userData, onProfile, isOwnProfile, isExplore, content}) {
    const { data: session } = useSession();
    const router = useRouter();

    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletePost, setDeletePost] = useState(null);
    const [showComments, setShowComments] = useState(false);
    const [updateCommentCounter, setUpdateCommentCounter] = useState(0);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    }

    useEffect(() => {
        setPosts([]);
        setIsLoading(true);

        if (content) {
            setPosts([content]);
            setIsLoading(false);
            return;
        }

        if (!session?.user?.userId || !session?.user?.profileType || !session?.accessToken) {
            setIsLoading(false);
            return;
        }

        if (onProfile && !userData) {
            setIsLoading(false);
            return;
        }
        
        fetchPosts();
    }, [session, userData, onProfile, isExplore, content]);

    const fetchPosts = async () => {

        try {
            const userId = onProfile ? userData.userId || userData.id : session.user.id;
            const profileType = onProfile ? userData.profileType : session.user.profileType;
            let apiEndpoint;

            if (isExplore){
                apiEndpoint = `${getApiUrl()}/api/posts/get-explore-posts?userId=${userId}&profileType=${profileType}`; 
            } else if (onProfile && userData){
                apiEndpoint = `${getApiUrl()}/api/posts/get-profile-posts?userId=${userId}&profileType=${profileType}`;
            } else {
                apiEndpoint = `${getApiUrl()}/api/posts/get-homepage-posts?userId=${userId}&profileType=${profileType}`;
            }

            const response = await fetch(apiEndpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                }
            });

            if (response.ok){
                const data = await response.json();

                if (data.posts && Array.isArray(data.posts)) {
                    setPosts(data.posts);
                } else {
                    setPosts([]);
                }
            } else {
                const errorData = await response.json();
                console.error("Error fetching posts:", errorData);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const checkPostOwner = (post) => {
        return session?.user?.id === post.userid && session?.user?.profileType === post.profile_type;
    };

    const handleDeletePost = async (postId) => {
        if (!deletePost) return;
        try {
            const response = await fetch(`${getApiUrl()}/api/posts/delete-post`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ postId: deletePost }),
            });

            if (response.ok) {
                console.log("Post deleted successfully");
                // setPosts(posts.filter(post => post.postid !== postId));
                window.location.reload();
            } else {
                const errorData = await response.json();
                console.error("Error deleting post:", errorData);
            }
        } catch (error){
            console.error('Error deleting post', error);

        } finally {
            setDeletePost(null);
        }
    };

    const handleRedirectToProfile = (postUser) => {
        router.push(`/profile/${postUser.userId}?profileType=${postUser.profileType}`);
        router.refresh();
    };

    const handleNewComment = () =>{
        setUpdateCommentCounter(prev => prev =1);
    }

    if (isLoading) {
        return (
            <div className="mt-10 my-10 flex justify-center">
                <div className="bg-white p-10 rounded-md shadow-md">
                    Loading posts...
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="mt-10 my-10 flex justify-center">
                <div className="bg-white p-10 mx-6 rounded-md shadow-[0px_0px_6px_6px_rgba(0,_0,_0,_0.1)]">
                    {/* {onProfile && isOwnProfile ? "No posts to display in your feed yet." : "No posts on this profile yet."} */}

                    {onProfile && isOwnProfile ?
                         "No posts to display in your feed yet." 
                    : isExplore ?
                        "No one outside of your network has created a post yet."
                    : "No posts on this profile yet."}
                </div>
            </div>
        );
    }

    return(
        <div className={`${isExplore ? 'flex flex-row gap-4 min-w-full overflow-x-auto' : 'flex justify-center items-center'}`}>
        <div className={`${isExplore ? 'flex flex-row gap-14' : 'pb-2 w-full max-w-4xl'}`}>
            {posts.map((post, index) => {
                
                const postUser = {
                    userId: post.userid,
                    id: post.userid,
                    profileType: post.profile_type,
                    username: post.username,
                    fullname: post.fullname,
                    postid: post.postid
                };

                const isOwnPost = checkPostOwner(post);
                
                return (
                    <div key={`post-${post.postid}`} 
                    className={`bg-white rounded-md shadow-xl border-2 border-gray-100 h-auto ${
                        isExplore 
                            ? 'w-[600px] md:w-[700px] flex-shrink-0 inline-block ' 
                            : 'w-4/5 mx-auto my-6 items-center'
                    }`}
                    >
                        <div className="flex flex-col px-4 py-2">
                            <div className="flex flex-row items-center justify-between w-full">
                                <UserProfileDisplay 
                                    user={onProfile ? userData : postUser}
                                    onClick={() => handleRedirectToProfile(postUser)} 
                                    isOnContent={true} 
                                    accessToken={session?.accessToken}
                                />
                                {isOwnPost && (
                                    <button onClick={() => setDeletePost(post.postid)} className="mr-4">
                                        <TrashIcon className="w-6 h-8" />
                                    </button>
                                )}
                            </div>
                            <p className="ml-[59px] -mt-3 text-sm">
                                Posted On: {post.created_at ? new Date(post.created_at).toLocaleDateString('en-GB') : 'Unknown date'}
                            </p>
                        </div>
                        <PostContent postData={post} />
                        <div className="flex flex-row justify-between px-36 py-2">
                            <div className="flex flex-row gap-2">
                                <Like isOnPost={true} postId={post.postid} isOnPortfolio={false} portfolioId={null}/>
                            </div>
                            <div onClick={() => setShowComments(prev => !prev)} className="flex flex-row gap-2">
                                <CommentCount isOnPost={true} postId={post.postid} isOnPortfolio={false} portfolioId={null} refreshCount={updateCommentCounter}/>
                            </div>
                        </div>
                        {showComments && (
                            <Comments isOnPost={true} postId={post.postid} isOnPortfolio={false} portfolioId={null} onNewComment={handleNewComment}/>
                        )}
                    </div>
                );
            })}
            {deletePost && (
                    <ConfirmationPopUp
                        title = "Are you sure you want to delete your post?"
                        message = "This action can't be reversed!"
                        onConfirm = {handleDeletePost}
                        onClose = {() => setDeletePost(null)}
                        confirmLabel = "Yes"
                        closeLabel = "No"
                    />
                )}
        </div>
        </div>
    );
}

export default DisplayPost;
