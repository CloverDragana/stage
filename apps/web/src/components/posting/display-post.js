"use client";

import UserProfileDisplay from "../profile/user-profile-display";
import PostContent from "./post-content";

function DisplayPost({userData, onProfile, isOwnProfile}) {
    return(
        <div className="mt-10 my-10">
            <div className="bg-white w-auto mx-6 my-10 items-center rounded-md shadow-[0px_0px_6px_6px_rgba(0,_0,_0,_0.1)]" >
                <div className="flex flex-col px-4 py-2">
                    {/* <UserProfileDisplay user={userData} isOnPost={true}/> */}
                    <p>date post</p>
                </div>
                <PostContent userData={userData} />
                <div className="flex flex-row justify-between px-10 py-2">
                    <p>Like</p>
                    <p>Comment</p>
                    <p>Share</p>
                </div>
            </div>
        </div>
    );
}

export default DisplayPost;