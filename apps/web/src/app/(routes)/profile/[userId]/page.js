"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams, useRouter } from "next/navigation";


import Navbar from "@/components/navigation/navbar";
import Topbar from "@/components/navigation/topbar";
import ProfileCard from "@/components/profile/profile-card";
import ContentDisplay from "@/components/profile/display-content";
// import DisplayPost from "@/components/posting/display-post";
// import FileType from "@/components/file-upload/file-types";

export default function Profile() {

  const {data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [ profileData, setProfileData ] = useState(null);


  const userId = params?.userId || session?.user?.id;
  const profileType = searchParams.get('profileType') || session?.user?.profileType || 'personal';
  const isOwnProfile =  !params.userId || (params.userId === session?.user?.id.toString()) ;

  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  };

  useEffect( () => {
    if(status === "unauthenticated"){
      router.push("/login");
      router.refresh();
    }

    if (status === "loading" || !session) {
      return;
    }
  
    const fetchProfileData = async () => {
      try{
        const fetchUserId = userId || session.user.id;
        const fetchProfileType = profileType || session.user.profileType || 'personal';

        console.log("Fetching profile data:", { userId: fetchUserId, profileType: fetchProfileType });

        if (!fetchUserId) {
          throw new Error("User ID not available");
        }
        const response = await fetch(`${getApiUrl()}/api/profiles/get-profile-content?id=${fetchUserId}&profileType=${fetchProfileType}`,{
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`
          }
        });
  
        if (!response.ok){
          const profileError = await response.json();
          throw new Error(profileError.error || "Failed to load profile");
        }
  
        const data = await response.json();
        setProfileData(data);
        console.log("data :", data);
      } catch (error){
        console.log("Error getting profile data", error);
      }
    };

    fetchProfileData();
  
  }, [userId, profileType, status, session]);

  if(status === "loading"){
    return <p className="my-80 text-center text-7xl">Your Adventure Awaits...</p>;
  }
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <Topbar />
      {/* <Navbar /> */}
      <div className="ml-[194px] mt-[78px]">
        <ProfileCard userData={profileData} isOwnProfile={isOwnProfile}/>
        <ContentDisplay userData={profileData} />
      </div>
    </div>
  );
}
