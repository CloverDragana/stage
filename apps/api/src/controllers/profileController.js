// const profileModel = require('../models/profiles');
import * as profileModel from '../models/profiles.js';

export const updateProfileData = async (userId, requestUserId, profileData) => {
  const { profileType, creativeSlogan, bio } = profileData;
  
  // Validate required fields
  if (!userId || !profileType) {
    throw new Error('UserId and Profile Type are required');
  }
  
  // Ensure users can only update their own profiles
  if (userId !== requestUserId) {
    throw new Error('Forbidden: Cannot update another user\'s profile');
  }

  if (String(userId) !== String(requestUserId)) {
    throw new Error('Forbidden: Cannot update another user\'s profile');
  }
  
  // Update profile in database
  const updatedProfile = await profileModel.updateProfile(userId, profileType, { creativeSlogan, bio });
  
  if (!updatedProfile) {
    throw new Error('Profile not found');
  }
  
  return {
    message: 'Profile data successfully updated!',
    creativeSlogan,
    bio
  };
};

export const updateProfilePicture = async (userId, requestUserId, profileType, profilePicturePath) => {
  if (!userId || !profileType) {
    throw new Error('UserId and Profile Type are required');
  }

  // Ensure users can only update their own profiles
  if (parseInt(userId, 10) !== parseInt(requestUserId, 10)) {
    throw new Error('Forbidden: Cannot update another user\'s profile');
  }

  if (!profilePicturePath) {
    throw new Error('Profile picture path is required');
  }
  console.log(`Updating profile picture for user ${userId}, profile type ${profileType}, with image ${profilePicturePath}`)

  const updatedProfile = await profileModel.updateProfilePicture(
    userId, 
    profileType, 
    profilePicturePath
  );

  if (!updatedProfile) {
    throw new Error('Profile not found');
  }

  return {
    message: 'Profile picture updated successfully',
    profilePicture: profilePicturePath
  }
};

export const updateProfileType = async (userId, profileType) => {
  // Validate profile type
  if (!profileType || !['personal', 'professional'].includes(profileType)) {
    throw new Error('Invalid profile type');
  }
  
  // Check if user exists and has the requested profile type
  const userSettings = await profileModel.getUserAccountSettings(userId);
  
  if (!userSettings) {
    throw new Error('User not found');
  }
  
  const hasProfile = profileType === 'personal' 
    ? userSettings.personal_account 
    : userSettings.professional_account;
  
  if (!hasProfile) {
    return { 
      profileExists: false 
    };
  }
  
  // Update user's active profile type
  await profileModel.updateUserProfileType(userId, profileType);
  
  return {
    message: 'Profile type updated successfully',
    profileType,
    profileExists: true
  };
};

export const createSecondProfile = async (userId, requestUserId, profileType) => {
  // Validate required fields
  if (!userId || !['personal', 'professional'].includes(profileType)) {
    throw new Error('User ID and Profile Type required to add additional profile');
  }
  
  // Ensure users can only create profiles for themselves
  if (userId !== requestUserId) {
    throw new Error('Forbidden: Cannot create a profile for another user');
  }
  
  // Check if profile already exists
  const profileExists = await profileModel.checkProfileExists(userId, profileType);
  
  if (profileExists) {
    throw new Error('This profile type already exists');
  }
  
  // Create new profile
  await profileModel.createProfile(userId, profileType);
  
  // Update user table to reflect new profile type
  const accountField = profileType === 'personal' ? 'personal_account' : 'professional_account';
  await profileModel.updateUserAccountSetting(userId, accountField, true);
  
  return { message: 'New Profile successfully added' };
};

export const getProfileContent = async (userId, profileType) => {
  // Validate required fields
  if (!userId || !['personal', 'professional'].includes(profileType)) {
    throw new Error('User ID and Profile Type required to retrieve profile');
  }
  
  // Get profile data
  const profileData = await profileModel.getProfileByUserIdAndType(userId, profileType);
  
  if (!profileData) {
    throw new Error('Profile data not found');
  }

  let profilePicture = null;
  if (profileData.profile_picture) {
    // Return just the filename - the frontend will construct the full path
    profilePicture = profileData.profile_picture;
  }
  
  return {
    message: 'Profile data retrieved successfully',
    userId: profileData.userid,
    username: profileData.username,
    fullname: profileData.fullname,
    profileId: profileData.profileid,
    profileType: profileData.profile_type,
    // profilePicture: profilePicture,
    creativeSlogan: profileData.creative_slogan,
    bio: profileData.bio
  };
};

export const getProfileId = async (userId, profileType) => {
  // Validate required fields
  if (!userId || !['personal', 'professional'].includes(profileType)) {
    throw new Error('User ID and Profile Type required to retrieve profile');
  }
  
  // Get profile data
  const profileData = await profileModel.getProfileIdByUserIdAndType(userId, profileType);
  
  if (!profileData) {
    throw new Error('Profile data not found');
  }
  
  return {
    message: 'Profile data retrieved successfully',
    profileId: profileData.profileid
  };
};

export const getProfilePicture = async (userId, profileType) => {
  // Validate required fields
  if (!userId || !['personal', 'professional'].includes(profileType)) {
    throw new Error('User ID and Profile Type required to retrieve profile');
  }
  
  // Get profile data
  const profileData = await profileModel.getProfilePictureByUserIdAndType(userId, profileType);
  
  if (!profileData) {
    throw new Error('Profile data not found');
  }
  
  return {
    message: 'Profile data retrieved successfully',
    profilePicture: profileData.profile_picture
  };
};