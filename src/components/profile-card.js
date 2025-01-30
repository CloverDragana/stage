import ProfilePicture from "@/components/profile/profile-picture";
import PersonalTags from "@/components/profile/personal-tags";

const ProfileCard = () => {
    return(
        <div className="w-full">
            <div className="w-full h-52 bg-blue-500 relative">
                <div className="absolute bottom-0 left-8 transform translate-y-1/2"> 
                    <ProfilePicture />
                </div>
            </div>
            <div className="bg-orange-200 h-auto pl-72 flex flex-row items-center gap-4">
                <div className="flex flex-col text-black ">
                    <h2 className="text-4xl font-bold mb-3">Username</h2>
                    <p className="text-xl mb-3">Descriptive few words</p>
                    <p className="text-base max-w-2xl">Bio (up to 100-150 words)</p>
                </div>
                <div className="ml-auto p-2">
                    <PersonalTags />
                </div>
            </div>
        </div>
    );
}

export default ProfileCard;