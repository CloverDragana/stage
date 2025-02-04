"use client";

import Search from "@/components/navigation/searchbar";

function Topbar() {
    return(
        <div className="fixed top-0 py-2 h-16 w-full flex flex-row items-center shadow-2xl z-50 bg-white">
            <header className="flex flex-row items-center w-full">
                <h1 className="block px-2 py-1 text-secondary text-5xl/5 w-1/4 font-bold"><a href="/">S.T.A.G.E.</a></h1>
                <Search />
            </header>
        </div>
    );
}
export default Topbar;