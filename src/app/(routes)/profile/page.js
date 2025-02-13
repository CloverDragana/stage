"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Navbar from "@/components/navigation/navbar";
import Topbar from "@/components/navigation/topbar";
import ProfileCard from "@/components/profile/profile-card";
import ContentDisplay from "@/components/profile/display-content";
import CreatePost from "@/components/posting/create-post";

export default function Profile() {

  const {data: session, status } = useSession();
  const router = useRouter();

  console.log("Session data:", session); 
  console.log("Session status:", status);

  // Change into a component to call in all pages
  useEffect( () => {
    if(status === "unauthenticated"){
      router.push("/login");
      router.refresh();
    }
  }, [status]);

  if(status === "loading"){
    return <p className="my-80 text-center text-7xl">Your Adventure Awaits...</p>;
  }
  
    return (
      <div className="min-h-screen">
        <Topbar />
        <Navbar />
        <div className="ml-[194px] mt-[78px]">
            <ProfileCard />
            <ContentDisplay />
            <div className=" shadow-[inset_0px_0px_38px_23px_rgba(0,_0,_0,_0.35)] flex flex-col justify-center align-middle">
              <CreatePost />
              <p className="text-black">hello</p>
              <p className="text-black">hello</p>
              <p className="text-black">hello</p>
              <p className="text-black">hello</p>
              <p className="text-black">hello</p>
              <p className="text-black">hello</p>
              <p className="text-black">hello</p>
              <p className="text-black">hello</p>
              <p className="text-black">hello</p>
              <p className="text-black">hello</p>
              <p className="text-black">hello</p>

            </div>
        </div>
      </div>
    );
}
