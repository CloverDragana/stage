"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation'; 
import CreateSecondProfile from "../popup-actions/profile-type-popup";

const AccountToggle = ({ onToggle, toggleSize = 'default', initialProfileType, usedInSignUp = false}) => {
    const { data: session, update } = useSession();
    const [profileSelection, setProfileSelection] = useState(initialProfileType || 'personal');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [pendingProfileCreation, setPendingProfileCreation] = useState(null);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    useEffect(() => {
        if (session?.user?.profileType) {
            console.log("Setting profile from session:", session.user.profileType);
            setProfileSelection(session.user.profileType);
        }
    }, [session]);

    const handleToggle = async (type) => {
        if (isUpdating) return;
        setIsUpdating(true);
        console.log('Toggle clicked:', type);
    
        try {
            if (usedInSignUp) {
                setProfileSelection(type);
                if (onToggle) {
                    onToggle(type);
                }
                return;
            }
    
            const response = await fetch(`${getApiUrl()}/api/profiles/update-profile-type`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.accessToken}`
                },
                body: JSON.stringify({
                    profileType: type 
                })
            });
    
            const data = await response.json();
            console.log(data);
    
            if(!usedInSignUp && !data.profileExists){
                setPendingProfileCreation(type);
                setShowPopup(true);
                return;
            }

            if (response.ok) {
                await update({ profileType: type });
                setProfileSelection(type);
                
                if (onToggle) {
                    onToggle(type);
                }

                const currentUrl = window.location.href;
                const isProfilePage = currentUrl.includes('/profile/');
                
                if (session?.user?.id) {
                    if (isProfilePage){

                        const newUrl = `/profile/${session.user.id}?profileType=${type}`;

                        window.history.pushState({}, '', newUrl);
                        window.location.reload();
                    }
                }
                
                console.log("Profile type updated successfully:", type);
            } else {
                console.error("Failed to update profile type");
            }
        } catch (error) {
            console.error('Failed to update profile type:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleSizes = {
        default: {
            container: 'p-1 gap-2 bg-white',
            buttonBase: 'w-[160px] py-2 text-lg',
            personal: {
                selected: 'bg-tertiary border-2 border-white text-black shadow-sm',
                unselected: 'text-black hover:border-2 hover:border-secondary'
            },
            professional: {
                selected: 'bg-tertiary border-2 border-white text-black shadow-sm',
                unselected: 'text-black hover:border-2 hover:border-secondary'
            }
        },
        navbar: {
            container: 'p-0.5 gap-0.5 border-2 border-white bg-zinc-100',
            buttonBase: 'py-1 text-xs font-bold bg-primary hover:border-primnary',
            personal: {
                selected: 'w-[85px] bg-secondary text-white',
                unselected: ' w-[85px] bg-transparent text-black hover:border-secondary'
            },
            professional: {
                selected: 'w-auto bg-secondary text-white',
                unselected: ' w-[85px] bg-transparent text-black hover:border-secondary'
            },
        },
    };

    const currentSize = toggleSizes[toggleSize] || toggleSizes.default;

    return (
        <>
            <div className={`rounded-full inline-flex ${currentSize.container}`}>
                <button 
                    type="button"
                    onClick={() => handleToggle('personal')}
                    disabled={isUpdating}
                    className={`rounded-full transition-all border-2 border-transparent whitespace-nowrap
                        ${profileSelection === 'personal' ? currentSize.personal.selected : currentSize.personal.unselected} 
                        ${currentSize.buttonBase}
                        ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Personal
                </button>
                <button 
                    type="button"
                    onClick={() => handleToggle('professional')}
                    disabled={isUpdating}
                    className={`rounded-full px-1 transition-all border-2 border-transparent
                        ${profileSelection === 'professional' ? currentSize.professional.selected : currentSize.professional.unselected} 
                        ${currentSize.buttonBase}
                        ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Professional
                </button>
            </div>
            {showPopup && (<CreateSecondProfile onClose={() => setShowPopup(false)} profileCreationType={pendingProfileCreation}/>)}
        </>
    );
};

export default AccountToggle;