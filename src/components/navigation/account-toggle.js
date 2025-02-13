"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CreateSecondProfile from "@/components/popup-actions/profile-type-popup"

const AccountToggle = ({ onToggle, toggleSize = 'default', initialProfileType, usedInSignUp = false }) => {
    const { data: session, update } = useSession();
    const [profileSelection, setProfileSelection] = useState(initialProfileType || 'personal');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [pendingProfileCreation, setPendingProfileCreation] = useState(null);

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
    
            const response = await fetch('/api/auth/update-profile-type', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileType: type })
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
            container: 'p-1 gap-2 bg-slate-800',
            buttonBase: 'w-[160px] py-2 text-lg',
            personal: {
                selected: 'bg-white text-gray-800 shadow-sm',
                unselected: 'text-white hover:border-2 hover:border-gray-300'
            },
            professional: {
                selected: 'bg-white text-gray-800 shadow-sm',
                unselected: 'text-white hover:border-2 hover:border-gray-300'
            }
        },
        navbar: {
            container: 'p-0.5 gap-0.5 bg-white',
            buttonBase: 'w-[90px] py-1 text-xs font-bold bg-primary hover:border-primnary',
            personal: {
                selected: 'bg-secondary text-white',
                unselected: 'bg-white text-black hover:border-primary'
            },
            professional: {
                selected: 'bg-secondary text-white',
                unselected: 'bg-white text-black hover:border-primary'
            }
        }
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
                    className={`rounded-full transition-all border-2 border-transparent whitespace-nowrap 
                        ${profileSelection === 'professional' ? currentSize.professional.selected : currentSize.professional.unselected} 
                        ${currentSize.buttonBase}
                        ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Professional
                </button>
            </div>
            {showPopup && (<CreateSecondProfile onClose={() => setShowPopup(false)} profileCreationType={pendingProfileCreation}/>)}
            {/* Debug display - Remove in production */}
            <div className="text-xs mt-1">
                Current session type: {session?.user?.profileType || 'loading...'}
            </div>
        </>
    );
};

export default AccountToggle;