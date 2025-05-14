import * as connectionModel from '../models/connections.js';

export const checkFollowExists = async (followerProfileId, followedProfileId) => {
  // Validate required fields
  if (!followerProfileId || !followedProfileId) {
    throw new Error("Profile ID's required to check follow status");
  }
  
  const followExists = await connectionModel.checkFollow(followerProfileId, followedProfileId);
  
  return {
    message: 'Follow found  successfully',
    isFollowing: !!followExists
  };
};

export const followProfileType = async (followerProfileId, followedProfileId) => {
    // Validate required fields
    if (!followerProfileId || !followedProfileId) {
      throw new Error("Profile ID's required to check follow status");
    }
    // recheck the existence of a follow to avoid db duplicates
    const alreadyFollowing = await connectionModel.checkFollow(followerProfileId, followedProfileId);
    if (alreadyFollowing) {
        return {
            message: 'Already following this profile',
            success: true
        };
    }
    
    const createFollow = await connectionModel.createFollow(followerProfileId, followedProfileId);
    
    if (!createFollow) {
      throw new Error('Unable to follow profile');
    }
    
    return {
      message: 'Follow successful',
      success: true
    };
};

export const unfollowProfileType = async (followerProfileId, followedProfileId) => {
    // Validate required fields
    if (!followerProfileId || !followedProfileId) {
      throw new Error("Profile ID's required to check follow status");
    }
    
    const deleteFollow = await connectionModel.deleteFollow(followerProfileId, followedProfileId);
    
    if (!deleteFollow) {
      throw new Error('No follow exists to delete');
    }
    
    return {
      message: 'Unfollowed successful',
      success: true
    };
};

export const getFollowers = async (profileId) => {
    // Validate required fields
    if (!profileId) {
      throw new Error("Profile ID required to get followers list");
    }
    
    const followersList = await connectionModel.getProfileFollowers(profileId);
    
    return {
      message: 'Followers retrieved successfully',
      users: followersList
    };
};

export const getFollowing = async (profileId) => {
    // Validate required fields
    if (!profileId) {
      throw new Error("Profile ID required to get following list");
    }
    
    const followingList = await connectionModel.getProfileFollowing(profileId);
    
    return {
      message: 'Following retrieved successfully',
      users: followingList
    };
};

// export const deleteFollow = async (userId) => {
//   const deleted = await userModel.deleteFollow(userId);
  
//   if (!deleted) {
//     throw new Error('Follow not found');
//   }
  
//   return { message: 'Follow deleted successfully!' };
// };