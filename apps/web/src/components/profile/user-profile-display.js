"use client";

const UserProfileDisplay = ({ user, onClick }) => {

    const handleClick = () => {
        if (onClick) {
        onClick(user);
        } 
    };

    return (
        <div 
            className="p-3 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={handleClick}
            >
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 mr-3">
                {user.profilePicture ? (
                    <img 
                        src={user.profilePicture} 
                        alt={user.displayName || ""} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-white text-xl">
                        {(user.profileType === 'personal' ? user.username : user.fullname || "").charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <div className="flex-1">
                {user.profileType === 'personal' ? (
                <div className="font-bold">{user.username}</div>
                ) : (
                <div className="font-bold">{user.fullname}</div>
                )}
                {user.bio && (
                <div className="text-sm text-gray-600 truncate max-w-xs">{user.bio}</div>
                )}
            </div>
            <div className="text-xs text-gray-500 ml-2">
                {user.profileType === 'personal' ? 'Personal Profile' : 'Professional Profile'}
            </div>
        </div>
    );
};

export default UserProfileDisplay;
