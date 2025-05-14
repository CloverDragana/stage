"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; 
import PortfolioBar from "../../portfolio/portfolio-bar";
import CreatePortfolio from "../../portfolio/create-portfolio";
import FullViewPortfolio from "../../portfolio/portfolio-full-view";
import UserProfileDisplay from "../user-profile-display";
import Like from "@/components/interactions/likes";
import CommentCount from "@/components/interactions/comment-count";

function DisplayPortfolio({userData, onProfile, isOwnProfile, isExplore, content}) {

    const {data: session} = useSession();
    const router = useRouter();
    const [portfolios, setPortfolios] = useState([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState();
    const [loading, setLoading] = useState(true);
    const [updateCommentCounter, setUpdateCommentCounter] = useState(0);

    const [portfolioState, setPortfolioState] = useState({
        isOpen: false,
        stateType: null,
        portfolioId: null,
    });

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    }

    useEffect(() => {
        if (session?.accessToken) {

            if (content) {
                setPortfolios([content]);
                setLoading(false);
                return;
            }

            fetchUserPortfolios();
        }
        
    }, [session, userData, onProfile, isOwnProfile, isExplore]);

    const fetchUserPortfolios = async () => {
        if (!session?.accessToken) return;
        try {
            setLoading(true);

            let userId;
            let profileType;
            let apiEndpoint;

            if (isExplore){
                userId = session.user.id;
                profileType = session.user.profileType;
                apiEndpoint = `${getApiUrl()}/api/portfolios/get-explore-portfolios?userId=${userId}&profileType=${profileType}`;
            } else if (isOwnProfile) {
                userId = session.user.id;
                profileType = session.user.profileType;
                apiEndpoint = `${getApiUrl()}/api/portfolios/get-portfolios?userId=${userId}&profileType=${profileType}`;
            } else {
                userId = userData?.userId;
                profileType = userData?.profileType;
                apiEndpoint = `${getApiUrl()}/api/portfolios/get-portfolios?userId=${userId}&profileType=${profileType}`;
            }
            
            if (!userId || !profileType) {
                console.error('Missing userId or profileType:', { userId, profileType });
                setLoading(false);
                return;
            }
            const response = await fetch(apiEndpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.portfolios && Array.isArray(data.portfolios)) {
                    setPortfolios(data.portfolios);
                } else {
                    setPortfolios([]);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching portfolios:", error);
            setLoading(false);
        }
    };

    const openPortfolio = (stateType, portfolioId) => {

        const clickedPortfolio = portfolios.find(p => p.portfolioid === portfolioId);
        setSelectedPortfolio(clickedPortfolio);

        setPortfolioState({
            isOpen: true,
            stateType,
            portfolioId
        });
    };
    const closePortfolio = () => {
        setPortfolioState({
            isOpen: false,
            stateType: null,
            portfolioId: null,
        });
        
        setUpdateCommentCounter(prev => prev =1);
        setSelectedPortfolio(null);
    }; 

    const getPortfolioImages = (filePath, title) => {
        return (
            <div className="w-full h-56 overflow-hidden bg-white ">
                <img
                src={filePath}
                alt={title}
                className="w-full h-full object-cover"
                />
            </div>
        );
    };

    const getPortfolioText = (content) => {
        return (
            <div className={`${ onProfile || isExplore ? 'border-2 border-gray-100 ' : ''} w-full h-56 p-4 bg-white overflow-hidden`}>
                <p className="text-lg line-clamp-6">
                    {content}
                </p>
            </div>
        );
    };

    const getPortfolioPreviewDisplay = (portfolio) => {

        let parsedContent;

        if (typeof portfolio.content === 'string') {
            parsedContent = JSON.parse(portfolio.content);
        } else {
            parsedContent = portfolio.content;
        }

        const firstPortfolioContent = parsedContent[0];

        if (firstPortfolioContent.type === 'image') {
            const imagePath = `/uploads/portfolio/${firstPortfolioContent.fileName}`;
            return getPortfolioImages(imagePath, portfolio.title);        
        }

        if (firstPortfolioContent.type === 'text') {
            return getPortfolioText(firstPortfolioContent.content);            
        }
    };

    const handleRedirectToProfile = (portfolioUser) => {
        router.push(`/profile/${portfolioUser.userId}?profileType=${portfolioUser.profileType}`);
        router.refresh();
    };

    return (
        <div>
            {isOwnProfile === true && (
                <PortfolioBar onAddPortfolio={() => openPortfolio('create', null)}/>
            )}
            {portfolioState.isOpen && (
                <>
                    {portfolioState.stateType === 'create' && (
                        <CreatePortfolio 
                            onClose={closePortfolio}
                        />
                    )}
                    {portfolioState.stateType === 'view' && (
                        // Find the portfolio object through the id in the portfolio state
                        <FullViewPortfolio 
                            portfolio={selectedPortfolio}
                            onClose={closePortfolio}
                        />
                    )}
                </>
            )}
            {loading ? (
                <div className="mt-10 my-10 flex justify-center">
                    <div className="bg-white p-10 mx-6 rounded-md shadow-[0px_0px_6px_6px_rgba(0,_0,_0,_0.1)]">
                       <p>Loading portfolios...</p>
                    </div>
                </div>
            ) : portfolios.length === 0 ? (
                    <div className="mt-10 my-10 flex justify-center">
                        <div className="bg-white p-10 mx-6 rounded-md shadow-[0px_0px_6px_6px_rgba(0,_0,_0,_0.1)]">
                            {isOwnProfile ? 
                                "You haven't created any collections of work yet." 
                                : isExplore 
                                ? "No one outside of your network has created any collections of work yet."
                                : "This user hasn't created any collections of work yet."}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto">
                        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> */}
                        <div
                            className={`${ onProfile || isExplore ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''} gap-6`}>
                            {portfolios.map((portfolio) => (
                                
                                <div key={portfolio.portfolioid} 
                                    className={`${ onProfile || isExplore ? 'pb-3' : 'mb-20 shadow-xl hover:shadow-2xl border-2 border-gray-100'} flex flex-col`}>
                                    <div 
                                        className={`${ onProfile || isExplore ? 'hover:-translate-y-4 hover:transition-transform hover:duration-200' : ''} overflow-hidden cursor-pointer`}
                                        // {/* // className="overflow-hidden cursor-pointer hover:-translate-y-4 hover:transition-transform hover:duration-200" */}
                                        onClick={() => openPortfolio('view', portfolio.portfolioid)}
                                    >
                                        {getPortfolioPreviewDisplay(portfolio)}
                                        <div className="pl-2 bg-transparent">
                                            <h3 className="text-2xl font-bold text-black">
                                                {portfolio.title}
                                            </h3>
                                            <p className="text-black mt-1">
                                                {portfolio.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-transparent rounded-lg px-1">
                                            {!onProfile && !isOwnProfile && (() => {
                                                const portfolioUser = {
                                                    userId: portfolio.userid,
                                                    profileType: portfolio.profile_type,
                                                    username: portfolio.username,
                                                    fullname: portfolio.fullname,
                                                    profilePicture: portfolio.profile_picture
                                                };
                                                
                                                return (
                                                    <div className="bg-white rounded-lg">
                                                        <UserProfileDisplay 
                                                            user={portfolioUser}
                                                            onClick={handleRedirectToProfile}
                                                            isOnContent={true}
                                                            accessToken={session?.accessToken}
                                                            className="cursor-pointer"
                                                        />
                                                    </div>
                                                );
                                            })()}
                                    </div>
                                    <div className="flex flex-row justify-between px-2 py-2">
                                        <div className="flex flex-row gap-2">
                                            <Like isOnPortfolio={true} portfolioId={portfolio.portfolioid} isOnPost={false} postId={null}/>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <CommentCount isOnPortfolio={true} portfolioId={portfolio.portfolioid} isOnPost={false} postId={null} refreshCount={updateCommentCounter}/>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
        </div>
    );
}

export default DisplayPortfolio;