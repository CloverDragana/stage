"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import LogoutPopUp from "../popup-actions/logout"
import AccountToggle from "./account-toggle";
import CreateSecondProfile from "../popup-actions/profile-type-popup";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { InboxIcon } from "@heroicons/react/24/outline";
import { BellAlertIcon } from "@heroicons/react/24/outline";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

function Navbar(){

    const { data: session } = useSession();
    const [logoutPopUp, setLogoutPopUp] = useState(false);
    const [secondProfile, setSecondProfile] = useState(false);


    const navItems = [
        { title: "Profile", href: session?.user?.id ? 
            `/profile/${session.user.id}?profileType=${session.user.profileType || 'personal'}` : 
            "#", icon: <UserCircleIcon className="w-7 h-10 inline-block ml-2"/>},
        { title: "Explore", href: "/explore", icon:<GlobeAltIcon className="w-7 h-10 inline-block ml-2 "/>},
        // { title: "Alerts", href: "", icon: <BellAlertIcon className="w-7 h-10 inline-flex ml-2"/>},
        // { title: "Messages", href: "", icon: <InboxIcon className="w-7 h-10 inline-block ml-2"/>},
        { title: "Settings", href: "/account-setting", icon: <WrenchScrewdriverIcon className="w-6 h-9 inline-block ml-2" />},
        { title: "Log Out", href: "/", icon: <ArrowRightStartOnRectangleIcon className="w-7 h-10 inline-block ml-2"/>},
    ];

    const handleLogout = () => {
        setLogoutPopUp(true);
    }

    return(
        <>
            <nav className="fixed top-[78px] left-0 h-screen w-[202px] m-0 flex flex-col bg-primary text-black text-xl shadow-lg">
                <div className="py-3 px-1 mt-2">
                    <AccountToggle toggleSize="navbar" usedInSignUp ={false}/>
                </div>
                <ul className="flex flex-col flex-grow">
                    {navItems.map((item) => (
                        <li key={item.title} className={`w-full ${item.title === "Log Out" ? "mt-[250px]" : ""}`}>
                            {item.title === "Log Out" ? (
                                <button onClick={ () => setLogoutPopUp(true)} className="block w-full px-3 py-2 text-black hover:bg-secondary hover:text-white transition-colors">
                                    <span>Log Out</span>
                                    {item.icon}
                                </button>
                            ) : (
                            <Link 
                                href={item.href} 
                                className="flex justify-between items-center w-full px-2 py-3 transition-colors font-semibold hover:bg-secondary hover:text-white">
                                {item.title}
                                {item.icon}
                            </Link>
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