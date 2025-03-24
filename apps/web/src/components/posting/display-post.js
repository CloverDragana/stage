"use client";

import CreatePost from "./create-post";

function DisplayPost(){
    return(
        <div className="bg-white w-auto mx-6 my-3 items-center rounded-md shadow-xl" >
            <div className="flex flex-row gap-8 px-4">
                <p className="text-xl">Username</p>
                <p>date post</p>
            </div>
            <CreatePost/>
            <div className="flex flex-row justify-between px-10">
                <p>Like</p>
                <p>Comment</p>
                <p>Share</p>
            </div>
        </div>
    );
}

export default DisplayPost;