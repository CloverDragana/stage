"use client";

import { useState } from "react";
import StarWork from "@/components/profile/star-work";

function ContentDisplay() {

    const [ activeFilter, setActiveFilter ] = useState("Profile");
    
    const ContentTitles = [
        { title: "Profile"},
        { title: "Collections"},
        { title: "Interactions"},
        { title: "Network"}
    ];

    return(
        <div className=" w-full">
            <div className="w-full">
                <StarWork />
            </div>
            <ul className="flex flex-row py-1">
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
            
        </div>
    );
}

export default ContentDisplay;
