"use client";

import { useState } from "react";
import NetworkList from "./display-network";
import DisplayPost from "../../posting/display-post";
import DisplayPortfolio from "./display-portfolio";
import DisplayInteractions from "@/components/interactions/display-interactions";
//documented
function ContentDisplay({ userData, isOwnProfile }) {

    const [ activeFilter, setActiveFilter ] = useState("Profile");
    
    const ContentTitles = [
        { title: "Profile"},
        { title: "Collections"},
        { title: "Interactions"},
        { title: "Network"}
    ];

    const changeContent = () => {
        switch(activeFilter){
            case "Profile":
                return <DisplayPost userData={userData} isOwnProfile={isOwnProfile} onProfile={true}/>;
            case "Collections":
                return <DisplayPortfolio userData={userData} isOwnProfile={isOwnProfile} onProfile={true}/>;
            case "Interactions":
                return <DisplayInteractions userData={userData} isOwnProfile={isOwnProfile}/>;
            case "Network":
                return <NetworkList userData={userData} />;
            default:
                return null;
        }
    };

    return(
        <div className=" w-full">
            <ul className="flex flex-row py-1 shadow-lg">
                {ContentTitles.map((filter) => (
                    <li key={filter.title} className={`w-full flex items-center justify-center border-white border -x-2 h-12
                        ${activeFilter === filter.title ? "bg-transparent" : "bg-[rgb(217,217,217)]"}`}>
                        <button onClick={() => setActiveFilter(filter.title)} className={`px-2 py-2 rounded-full w-36
                            ${activeFilter === filter.title ? "bg-secondary text-white relative" : "bg-transparent text-black"}`}>
                            {filter.title}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="w-full mt-10 pb-6 px-6">
                {changeContent()}  
            </div>
        </div>
    );
}

export default ContentDisplay;
