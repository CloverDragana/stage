// import ProfileSetUpPopUp from "@/components/navigation/profile-setup-popup";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const AccountToggle = ({ userId, onToggle, toggleSize = 'default' }) => {

    const {data: session} = useSession();
    const [profileSelection, setProfileSelection] = useState('personal');
    // const [showProfileSetUp, setShowProfileSetUp] = useState(false);
    // const [profileSetUpType, setProfileSetUpType] = useState(null);

    // useEffect(() => {
    //     const getProfileType = async () => {
    //         try{
    //             const response = await fetch(`/api/auth/profile-filter?userId=${userId}`);
    //             const data = await response.json();

    //             if (!response.ok) {
    //                 throw new Error(data.error || 'Failed to check profile type set up');
    //             }

    //             if(data.personal_account && !data.professional_account){
    //                 setProfileSelection('personal');
    //             } else if(!data.professional_account && data.professional_account){
    //                 setProfileSelection('professional');
    //             } else if (data.personal_account && data.professional_account){
    //                 setProfileSelection('personal');
    //             }
    //         } catch (error){
    //             console.error('Couldnt check profile type set up', error);
    //         }
    //     }; 
    //     if (userId){
    //         getProfileType();
    //     }
    // }, [userId]);

    useEffect(() => {
        if (session?.user?.profileType) {
            setProfileSelection(session.user.profileType);
        }
    }, [session]);
    
    const handleToggle = async (profileType) => {
        setProfileSelection(profileType);
        
        console.log("in-memory profileSelection:", profileSelection)

        if(onToggle){
            onToggle(profileType);
        }

        // console.log("Toggling profile type:", profileType); // Debugging line

        // if (!profileType) {
        //     console.error("Profile type is undefined!");
        //     return;
        // }

        // try{
        //     const response = await fetch(`/api/auth/profile-filter`, {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json'},
        //         body: JSON.stringify({ userId, profileType})
        //     });

        //     const data = await response.json();

        //     if (!response.ok) {
        //         throw new Error(data.error || 'Failed to check profile type set up');
        //     }
        //     console.log("Profile filter response:", data);

        //     if(!data.profileExists){
        //         setShowProfileSetUp(true);
        //         setProfileSetUpType(profileType);
        //     }
        // } catch (error){
        //     console.error('Couldnt check profile type set up', error);
        // }
    };
    const toggleSizes = {
        default:{
            container: 'p-1 gap-2 bg-slate-800',
            buttonBase: 'w-[160px] py-2 text-lg',
            personal: {
                selected: 'bg-white text-gray-800 shadow-sm',
                unselected: 'text-white hover:border-2 hover:border-gray-300'
            },
            professional:{
                selected: 'bg-white text-gray-800 shadow-sm',
                unselected: 'text-white hover:border-2 hover:border-gray-300'
            }
        },
        navbar:{
            container: 'p-0.5 gap-0.5 bg-white',
            buttonBase: 'w-[90px] py-1 text-xs font-bold bg-primary hover:border-primnary',
            personal: {
                selected: 'bg-secondary text-white',
                unselected: 'bg-white text-black hover:border-primary'
            },
            professional:{
                selected: 'bg-secondary text-white',
                unselected: 'bg-white text-black hover:border-primary'
            }
        }
    }

    const currentSize = toggleSizes[toggleSize] || toggleSize.default;
return (
        <div className={`rounded-full inline-flex ${currentSize.container}`}>
            <button onClick={ () => handleToggle('personal')} className={`rounded-full transition-all border-2 border-transparent whitespace-nowrap ${profileSelection === 'personal' ? currentSize.personal.selected : currentSize.personal.unselected} ${currentSize.buttonBase}`}>Personal</button>
            <button onClick={ () => handleToggle('professional')} className={` rounded-full transition-all border-2 border-transparent whitespace-nowrap ${profileSelection === 'professional'? currentSize.professional.selected : currentSize.professional.unselected} ${currentSize.buttonBase}`}>Professional</button>
            {/* {showProfileSetUp && <ProfileSetUpPopUp userId={userId} profileType={profileSetUpType} onClose={ () => setShowProfileSetUp(false)} />} */}
        </div>
    )

} 
export default AccountToggle;