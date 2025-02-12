"use client";

import { useState } from "react";
import LogoutPopUp from "@/components/navigation/logout"
import AccountToggle from "@/components/navigation/account-toggle";
import CreateSecondProfile from "@/components/popup-actions/profile-type-popup";

function Navbar(){

    const [logoutPopUp, setLogoutPopUp] = useState(false);
    const [secondProfile, setSecondProfile] = useState(false);

    const navItems = [
        { title: "Profile", href: "/profile"},
        { title: "Explore", href: ""},
        { title: "Notifications", href: ""},
        { title: "Messages", href: ""},
        { title: "Settings", href: "/account-setting"},
        { title: "Log Out", href: "/login"}
    ];

    const handleLogout = () => {
        setLogoutPopUp(true);
    }

    return(
        <>
        <nav className="fixed top-[78px] left-0 h-screen w-42 m-0 flex flex-col bg-primary text-black text-xl shadow-lg">
                <div className="py-3 px-1">
                    <AccountToggle toggleSize="navbar"/>
                </div>
            {/* <nav className="fixed top-16 left-0 h-screen w-42 m-0 mt-6 flex flex-col bg-primary text-black text-xl shadow-lg"> */}
                <ul className="flex flex-col flex-grow">
                    {navItems.map((item) => (
                        <li key={item.title} className={`w-full ${item.title === "Log Out" ? "mt-[350px]" : ""}`}>
                            {item.title === "Log Out" ? (
                                <button onClick={ () => setLogoutPopUp(true)} className="block w-full px-3 py-3 text-black hover:bg-secondary hover:text-white transition-colors">Log Out</button>
                                
                                // <button onClick={ () => setLogoutPopUp(true)} className="block w-full px-2 py-3 -mt-9 hover:bg-secondary hover:text-white transition-colors">
                                //     {item.title}
                                // </button>
                            ) : (
                            <a href={item.href} className="block w-full px-2 py-3 hover:bg-secondary hover:text-white transition-colors">
                                {item.title}
                            </a>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
            {logoutPopUp && <LogoutPopUp onClose={ () => setLogoutPopUp(false)} />}
            {secondProfile && <CreateSecondProfile onClose= {() => setSecondProfile(false)} />}
        </>
    );
}

export default Navbar;