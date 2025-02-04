"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Navbar from "@/components/navigation/navbar";
import Topbar from "@/components/navigation/topbar";
import ProfileCard from "@/components/profile/profile-card";
import ContentDisplay from "@/components/profile/display-content";

export default function Profile() {

  const {data: session, status } = useSession();
  const router = useRouter();

  console.log("Session data:", session); 
  console.log("Session status:", status);

  useEffect( () => {
    if(status === "unauthenticated"){
      router.push("/login");
    }
  }, [status]);

  if(status === "loading"){
    return <p className="text-center">Your Adventure Awaits...</p>;
  }
  
    return (
      <div className="min-h-screen">
        <Topbar />
        <main className="">
          <Navbar />
          <div className="ml-[172px] mt-16">
            <ProfileCard />
            <ContentDisplay />
            <div className=" shadow-[inset_0px_0px_38px_23px_rgba(0,_0,_0,_0.35)]">
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
        </main>
      </div>
    );
}
