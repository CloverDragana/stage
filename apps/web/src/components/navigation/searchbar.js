"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserProfileDisplay from "../profile/user-profile-display";

const Search = () => {

    const [ searchQuery, setSearchQuery ] = useState("");
    const [ searchResult, setSearchResult ] = useState([]);
    const [ searchingUsers, setSearchingUsers ] = useState(false);
    const [ showSearchResults, setShowSearchResults]= useState(false);
    const searchRef = useRef(null);
    const router = useRouter();
    const {data: session } = useSession();
   
    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    useEffect ( () => {
        const handleClickOffSearch = (event) =>{
            if (searchRef.current && !searchRef.current.contains(event.target) ) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOffSearch);
        return () => {
            document.removeEventListener("mousedown", handleClickOffSearch);
        };
    }, []);

    useEffect ( () => {
        const searchForUsers = async () => {
            if ( searchQuery.trim().length < 2 ) {
                setShowSearchResults( [] );
                return;
            }

            setSearchingUsers(true);
            try {

                if (!session || !session.accessToken) {
                    console.error("No valid session token available");
                    setSearchResult([]);
                    setSearchingUsers(false);
                    return;
                  }

                const response = await fetch(`${getApiUrl()}/api/search/search-user?query=${encodeURIComponent(searchQuery)}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${session.accessToken}`,
                    }
                });

                if(!response.ok){
                    throw new Error("Search Query Failed");
                }

                const data = await response.json();
                setSearchResult(data.results);
                setShowSearchResults(true);
            } catch (error) {
                console.log("search error: ", error);
                setSearchResult( [] );
            } finally {
                setSearchingUsers(false);
            }
        };
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                searchForUsers();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);
     
    const handleSearch = (event) => {
        const { target } = event;
        setSearchQuery(target.value);
        console.log(target.value);
    }

    const handleClickedResult = (user) => {
        // console.log("Clicked user:", userId, profileType);
        router.push(`/profile/${user.userId}?profileType=${user.profileType}`);
        setShowSearchResults(false);
        setSearchQuery("");
    };

    const getProfileType = (user) => {
        // if (user.hasProfessionalProfile) return 'professional';
        // return 'personal';
        return user.profileType || (user.hasProfessionalProfile ? 'professional' : 'personal');
    }

    return(
        <div ref={searchRef} className="mx-1 rounded-3xl w-full flex flex-col relative">
            <div className="w-full flex content-center justify-center text-gray-600">
                <input type="search" name="search" placeholder="Search" value={searchQuery} onChange={handleSearch} onClick={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)} className="w-full p-3 content-center rounded-full shadow-[inset_0px_0px_10px_4px_rgba(217,_217,_217,_1)] focus:outline-none"/>
                {/* <button type="submit" className=" mt-3 mr-4"> </button> */}
            </div>
            {showSearchResults && searchResult.length > 0 && (
                <div className="absolute top-14 left-0 right-0 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {searchResult.map((user) => (
                        <UserProfileDisplay 
                            key={`${user.userId}-${user.profileType}`} 
                            user = {user}
                            className="p-3 hover:bg-gray-100 cursor-pointer flex items-center"
                            onClick={handleClickedResult}
                        />
                     ))}
                </div>
            )}
            {showSearchResults && searchQuery.trim().length >= 2 && searchResult.length === 0 && !searchingUsers && (
                <div className="fixed top-14 left-0 right-0 bg-white rounded-lg shadow-lg z-[1000] p-4 text-center">
                    No users found matching "{searchQuery}"
                </div>
            )}
        </div>
    );
};

export default Search;