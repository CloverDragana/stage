"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Navbar from "@/components/navigation/navbar";
import Topbar from "@/components/navigation/topbar";

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
        {/* <CreatePost /> */}
        </>
    );
}

// export default Home;