// File: components/navigation/account-toggle.js
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const AccountToggle = ({ userId, onToggle, toggleSize = 'default' }) => {
    const { data: session, update } = useSession();
    const [profileSelection, setProfileSelection] = useState('personal');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggle = async (profileType) => {
        if (isUpdating) return;
        setIsUpdating(true);
    
        try {
            const response = await fetch('/api/auth/update-profile-type', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileType })
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log("Database Update Response:", result);
                
                await update({ profileType });
                setProfileSelection(profileType);
            }
        } catch (error) {
            console.error('Failed to update profile type:', error);
        } finally {
            setIsUpdating(false);
        }
    };
    
    useEffect(() => {
        if (session?.user?.profileType) {
            setProfileSelection(session.user.profileType);
        }
        console.log("SESSION STATE UPDATED:", {
            profileType: session?.user?.profileType,
            timestamp: new Date().toISOString()
        });
    }, [session]);

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
            
            {/* Debug display - Remove this in production */}
            <div className="text-xs mt-1 text-gray-600">
                Current session mode: {session?.user?.profileType || 'loading...'}
            </div>
        </>
    );
}

export default AccountToggle;