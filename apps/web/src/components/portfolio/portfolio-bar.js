"use client"

import { useState } from "react";

function PortfolioBar({onAddPortfolio}) {

     const [ activeFilter, setActiveFilter ] = useState("Profile");
        
    const buttonTitles = [
        { title: "Add Portfolio", function: onAddPortfolio},
        { title: "Delete Portfolio", function:""}
    ];

    const handleButtonClick = (button) => {
        setActiveFilter(button.title);
        if (button.function) {
            button.function();
        }
        setActiveFilter();
    }
    return (
        <div className="flex flex-row pb-8">
            {buttonTitles.map((button) => (
                <li key={button.title} className="w-full flex items-center justify-center border-white border -x-2 h-12">
                    <button onClick={() => handleButtonClick(button)} className={`px-2 py-3 rounded-full w-44
                        ${activeFilter === button.title ? "bg-secondary text-white relative" : "bg-[rgb(217,217,217)] text-black hover:bg-secondary hover:text-white transition-colors duration-200"}`}>
                        {button.title}
                    </button>
                </li>
            ))}
        </div>
    );
}
export default PortfolioBar;