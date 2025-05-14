"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/navigation/navbar";
import Topbar from "@/components/navigation/topbar";
import DisplayPost from "@/components/posting/display-post";
import DisplayPortfolio from "@/components/profile/profile-filter/display-portfolio";
import TokenExpiryInfo from "@/components/session";

export default function Home() {

    const { data : session, status } = useSession();
    const router = useRouter();
    const [ homeFeed, setHomeFeed ] = useState([]);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    useEffect( () => {
        if(status === "unauthenticated"){
            router.push("/login");
            router.refresh();
        }
        if (session?.user?.id){
            // const fetchUserData = async () => {
            //     try {
            //         setUserData(session.user);
            //         const response = await fetch(`${getApiUrl()}/api/profiles/get-profile-content?id=${session.user.id}&profileType=${session.user.profileType}`, {
            //             method: "GET",
            //             headers: {
            //                 "Content-Type": "application/json",
            //                 "Authorization": `Bearer ${session.accessToken}`,
            //             }
            //         });
            //         if (response.ok) {
            //             const data = await response.json();

            //             const updateData = {
            //                 ...session.user,
            //                 ...data
            //             }; 
            //             setUserData(updateData);
            //         } else {
            //             setUserData(session?.user);
            //         }
            //     } catch(error) {
            //         console.error("Error fetching user data:", error);
            //         setUserData(session?.user);
            //     }
            // };
            // fetchUserData();

            fetchHomeFeedContent();
        }
    }, [status, session]);

    // const displayHomePost = (userData) => {
    //     return (
    //         <DisplayPost userData={userData} onProfile={false} />
    //     );
    // }

    // const displayHomePortfolio = () => {
    //     return(
    //         <DisplayPortfolio />
    //     );
    // };

    // const handleRedirectToProfile = (user) => {
    //     router.push(`/profile/${user.userId}?profileType=${user.profileType}`);
    //     router.refresh();
    // };

    const fetchHomeFeedContent = async () => {
        if (!session?.accessToken) return;
        try {
            
            const response = await fetch(`${getApiUrl()}/api/profiles/get-home-content?userId=${session.user.id}&profileType=${session.user.profileType}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.accessToken}`,
                }
            });
            if (response.ok) {
                const data = await response.json();

                // const updateData = {
                //     ...session.user,
                //     ...data
                // }; 

                setHomeFeed(data.homeFeed || []);
            } else {
                setHomeFeed([]);
                console.error("Error fetching home feed data:");
            }
        } catch(error) {
            console.error("Error fetching home feed data:", error);
            setHomeFeed([]);
        }
    };

    if (homeFeed.length === 0){
        return (
            <>
                <Navbar />
                <Topbar />
                <div className="ml-[202px] mt-[85px] h-screen pt-1">
                    <div className="mt-10 my-10 flex justify-center">
                        <div className="bg-white p-10 rounded-md shadow-[0px_0px_6px_6px_rgba(0,_0,_0,_0.1)]">
                        <p>You have no content to display on your home feed yet.</p>
                        <p>Expand your network or starting creating to see more.</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <Topbar />
            <div className="ml-[202px] mt-[85px] h-screen pt-1">
                <TokenExpiryInfo />
                <div className="max-w-4xl mx-auto">
                    {homeFeed.map((content) => {
                        const contentOwner = {
                            userId: content.userid,
                            profileType: content.profile_type,
                            username: content.username,
                            fullname: content.fullname,
                            profilePicture: content.profile_picture
                        }
                        if (content.contentType === 'post') {
                            return <DisplayPost key={`post-${content.postid}`} userData={contentOwner} onProfile={false} isExplore={false} content={content}/>;
                        } else if (content.contentType === 'portfolio'){
                            return <DisplayPortfolio key={`portfolio-${content.portfolioid}`} userData={contentOwner} onProfile={false} isExplore={false} content={content}/>;
                        }
                        return null;
                    })}
                </div>
            </div>
        </>
    );
}