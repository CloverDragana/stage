"use client";

import {useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Comments from "../interactions/get-comments";

function FullViewPortfolio ({portfolio, onClose}) {

    const [content, setContent ] = useState([]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {

        if (portfolio && portfolio.content) {
            try {

                let parsedContent;
                if (Array.isArray(portfolio.content)) {
                    parsedContent = portfolio.content;
                } else if (typeof portfolio.content === 'string') { 
                    parsedContent = JSON.parse(portfolio.content);
                } else {
                    parsedContent = portfolio.content;
                }
                
                setContent(parsedContent);
            } catch (error) {
                setContent([]);
            }
        }
    }, [portfolio]);

    const DisplayPortfolioContent = (content) => {

        if (content && content.length > 0) {
           const contentItems = content.map((item, index) => {

                if (item.type === 'image' && item.fileName) {
                    const imagePath = `/uploads/portfolio/${item.fileName}`;
                    return(
                        <div key={index} className="w-full">
                            <img 
                            src={imagePath}
                            alt={`Portfolio Index ${index + 1}`}
                            className="w-full h-auto max-h-[600px] object-contain"/>
                        </div>
                    );
                } else if (item.type === 'text' && item.content) {
                    return(
                        <div key={index} className="w-full">
                            <p className="text-xl whitespace-pre-wrap text-black">{item.content}</p>
                        </div>
                    );
                }
                return null;
            });
            return contentItems;
        }
        return <div className="text-black">No content to display</div>;
    }

    if (!portfolio){
        return (
            <div className="fixed inset-0 bg-black/90 z-[10000] overflow-hidden flex flex-col items-center justify-center">
                <div className="text-white">Loading portfolio...</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/90 z-[10000] flex flex-col">
            <div className="flex justify-between pb-2">
                <div className="flex flex-col text-white mt-3 ml-16">
                    <h1 className="font-semibold text-4xl">{portfolio?.title || 'Untitled'}</h1>
                    <h2 className="font-semibold text-2xl">{portfolio?.description || 'No description'}</h2>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex mr-3 mt-3 justify-end cursor-pointer"
                    >
                    <XMarkIcon className="h-10 w-10 text-white hover:text-red-700"/>
                </button>
            </div>
            <div className="flex flex-1 overflow-hidden justify-center items-start">
                <div className="bg-white w-[1000px] overflow-y-auto max-h-full flex flex-col">
                    <div className="flex flex-col items-center">
                            {DisplayPortfolioContent(content)}
                    </div>
                    <Comments isOnPost={false} postId={null} isOnPortfolio={true} portfolioId={portfolio.portfolioid}/>
                </div>
            </div>
        </div>
    );
} 

export default FullViewPortfolio;