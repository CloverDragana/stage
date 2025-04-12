"use client";

import { useState } from "react";
import Search from "./searchbar";
import CreatePost from "../posting/create-post";

function Topbar() {

    const [createPostPopUp, setCreatePostPopUp] = useState(false);

    const handleCreatePost = () => {
        setCreatePostPopUp(true);
    }

    return(
        <>
            <div className="fixed top-0 py-1 h-auto w-full items-center align-middle shadow-2xl bg-white z-50">
                <header className="flex flex-row justify-between items-center align-middle px-3 w-full">
                    <div className="w-auto">
                    <h1 className="block px-2 py-1 text-secondary text-5xl/5 w-1/4 font-bold"><a href="/home-page">S.T.A.G.E.</a></h1>
                    </div>
                    <div className="w-3/6">
                    <Search />
                    </div>
                    <div className=" relative w-auto rounded-full mr-4">
                        <button id="createPostButton" onClick={handleCreatePost}>
                            <img src="/create-post.png" alt="create-post" className="w-[70px] h-[70px] shadow-[0px_0px_40px_-17px_rgba(0,_0,_0,_1)] rounded-full "/>
                        </button>
                        {createPostPopUp && (
                                <CreatePost onClose={ () => setCreatePostPopUp(false)} />
                        )}
                    </div>
                </header>
            </div>
            
        </>
    );
}
export default Topbar;
