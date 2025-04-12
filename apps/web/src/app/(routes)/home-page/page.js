"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Navbar from "@/components/navigation/navbar";
import Topbar from "@/components/navigation/topbar";
import DisplayPost from "@/components/posting/display-post";

export default function Home() {

    const { data : session, status } = useSession();
    const router = useRouter();

    useEffect( () => {
        if(status === "unauthenticated"){
            router.push("/login");
            router.refresh();
        }
    }, [status]);

    return (
        <>
            <Navbar />
            <Topbar />
            <div className="bg-blue-900 ml-[194px] mt-[85px] h-screen">
                <DisplayPost userData={session?.user} onProfile={false} isOwnProfile={false} />
            </div>
        </>
    );
}

// export default Home;