"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserProfileDisplay from "../profile/user-profile-display";

const Search = () => {
    const {data: session } = useSession();
    const searchRef = useRef(null);
    const router = useRouter();
    
    const [ searchQuery, setSearchQuery ] = useState("");
    const [ searchResult, setSearchResult ] = useState([]);
    const [ searchingUsers, setSearchingUsers ] = useState(false);
    const [ showSearchResults, setShowSearchResults]= useState(false);
   
   
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
            // prevents unneccessary API calls for queires that are below 2 characters
            if (searchQuery.trim().length < 2 ) {
                setSearchResult([]);
                return;
            }
            setSearchingUsers(true);
            try {
                // check if their is an active session or the session is authenticated
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
                // retrieve the successful response from the API call
                const data = await response.json();
                // update array state to contain the retrieved search results
                setSearchResult(data.results);
                // all the results ot be displayed
                setShowSearchResults(true);
            } catch (error) {
                console.log("search error: ", error);
                //reset the array to empty if there is an error
                setSearchResult([]);
            } finally {
                // reset the searching state
                setSearchingUsers(false);
            }
        };
        // wait 300ms after changes to searchQuery state before making API request
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                searchForUsers();
            }
        }, 300);
        // clear pending timeouts to execute only the latest search query
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);
     
    // documented
    const handleSearch = (event) => {
        const { target } = event;
        setSearchQuery(target.value);
    }

    const handleClickedResult = (user) => {
        // redirect to profile of search result
        router.push(`/profile/${user.userId}?profileType=${user.profileType}`);
        // refresh router for caching problems
        router.refresh();
        setShowSearchResults(false); //close results modal
        setSearchQuery(""); // clear query value 
    };
 
    return(
        <div ref={searchRef} className="mx-1 rounded-3xl w-full flex flex-col relative">
            <div className="w-full flex content-center justify-center text-gray-600">
                <input 
                    type="search" 
                    name="search" 
                    placeholder="Search" 
                    value={searchQuery} 
                    onChange={handleSearch} 
                    onClick={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)} 
                    className="w-full p-3 content-center rounded-full shadow-[inset_0px_0px_10px_4px_rgba(217,_217,_217,_1)] focus:outline-none"/>
            </div>
            {showSearchResults && searchResult.length > 0 && (
                <div className="absolute top-14 left-0 right-0 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {searchResult.map((user) => (
                        <UserProfileDisplay 
                            key={`${user.userId}-${user.profileType}`} 
                            user = {user}
                            className="p-3 hover:bg-gray-100 cursor-pointer flex items-center"
                            onClick={handleClickedResult}
                            isOnContent={false}
                            accessToken={session.accessToken}
                        />
                     ))}
                </div>
            )}
            {showSearchResults && searchQuery.trim().length >= 2 && searchResult.length === 0 && !searchingUsers && (
                // <div className="absolute top-14 left-0 right-0 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="absolute top-[60px] left-0 right-0 bg-white rounded-lg shadow-lg z-50 p-4 text-center">
                    No users found matching "{searchQuery}"
                </div>
            )}
        </div>
    );
};

export default Search;