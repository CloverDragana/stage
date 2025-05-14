"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/navigation/navbar";
import Topbar from "@/components/navigation/topbar";
import DisplayPost from "@/components/posting/display-post";
import DisplayPortfolio from "@/components/profile/profile-filter/display-portfolio";

export default function Home() {

    const { data : session, status } = useSession();
    const router = useRouter();
    // const [ notFollowedData, setNotFollowedData ] = useState(null);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    useEffect( () => {
        if(status === "unauthenticated"){
            router.push("/login");
            router.refresh();
        }
    }, [status, session]);

    useEffect( () => {
        if(!session?.user){
        }
    }, [session]);

    return (
        <>
            <Navbar />
            <Topbar />
            <div className="ml-[202px] mt-[85px] h-screen pt-1">
                <div className="w-full bg-secondary pb-8">
                    <h1 className="text-[243px] -mt-20 font-extrabold text-white">DISCOVER</h1>
                    <h1 className="text-8xl -mt-20 font-semibold py-6 text-white">NEW AND EXCITING</h1>
                    <h1 className="text-6xl -mt-13 font-semibold py-6 text-white">CONTENT BEYOND YOUR NETWORK</h1>
                </div>
                <div className="flex flex-col w-full">
                    <div className="w-full items-center pt-5 bg-white ">
                        <h2 className="text-secondary font-bold text-7xl p-4 ">PORTFOLIOS</h2>
                        <div className=" p-10">
                                <DisplayPortfolio
                                    userData={null} 
                                    isOwnProfile={false}
                                    isExplore={true}
                                />
                        </div>
                    </div>
                    <div className="w-full items-center pt-5 pb-9 bg-white">
                        <h2 className="text-secondary font-bold text-7xl p-4 ">POSTS</h2>
                        <div className="flex flex-row overflow-x-auto bg-secondary rounded-lg gap-4 py-10 mx-4 scrollbar-hide px-4">
                            <DisplayPost 
                                userData={null} 
                                onProfile={false}
                                isOwnProfile={false}
                                isExplore={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}