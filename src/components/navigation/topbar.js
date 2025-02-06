"use client";

import Search from "@/components/navigation/searchbar";

function Topbar() {
    return(
        <div className="fixed top-0 py-1 h-auto w-full items-center align-middle shadow-2xl z-50 bg-white">
            <header className="flex flex-row justify-between items-center align-middle px-3 w-full">
                <div className="w-auto">
                <h1 className="block px-2 py-1 text-secondary text-5xl/5 w-1/4 font-bold"><a href="/">S.T.A.G.E.</a></h1>
                </div>
                <div className="w-3/6">
                <Search />
                </div>
                <div className="w-auto rounded-full mr-4">
                    <img src="/create-post.png" alt="create-post" className="w-20 h-20 shadow-[0px_0px_40px_-17px_rgba(0,_0,_0,_1)] rounded-full "/>
                </div>
            </header>
        </div>
    );
}
export default Topbar;