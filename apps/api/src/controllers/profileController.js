// const profileModel = require('../models/profiles');
import * as profileModel from '../models/profiles.js';
import * as postModel from '../models/posts.js';
import * as portfolioModel from '../models/portfolios.js';

export const getProfileContent = async (userId, profileType) => {
  // Validate required fields
  if (!userId || !['personal', 'professional'].includes(profileType)) {
    throw new Error('User ID and Profile Type required to retrieve profile');
  }
  
  // call model passing parameters from the route
  const profileData = await profileModel.getProfileByUserIdAndType(userId, profileType);
  
  // return with error if model response is empty
  if (!profileData) {
    throw new Error('Profile data not found');
  }

  let profilePicture = null;

  // check if profile picture exists with models reponse and store in variable
  if (profileData.profile_picture) {
    profilePicture = profileData.profile_picture;
  }
  
  // return model results in specified properties
  return {
    message: 'Profile data retrieved successfully',
    userId: profileData.userid,
    username: profileData.username,
    fullname: profileData.fullname,
    profileId: profileData.profileid,
    profileType: profileData.profile_type,
    creativeSlogan: profileData.creative_slogan,
    bio: profileData.bio,
    profilePicture: profilePicture
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
    profilePicture: profileData?.profile_picture
  };
};

export const getBannerImage = async (userId, profileType) => {
  // Validate required fields
  if (!userId || !['personal', 'professional'].includes(profileType)) {
    throw new Error('User ID and Profile Type required to retrieve profile');
  }
  
  // Get profile data
  const profileData = await profileModel.getBannerImageByUserIdAndType(userId, profileType);
  
  if (!profileData) {
    throw new Error('Profile data not found');
  }
  
  return {
    message: 'Profile data retrieved successfully',
    bannerImage: profileData.banner_image
  };
};

export const getStarWork = async (userId, profileType) => {
  // Validate required fields
  if (!userId || !['personal', 'professional'].includes(profileType)) {
    throw new Error('User ID and Profile Type required to retrieve profile');
  }
  
  // Get profile data
  const profileData = await profileModel.getStarWorkByUserIdAndType(userId, profileType);
  
  if (!profileData) {
    throw new Error('Profile data not found');
  }
  console.log("Star work data from database:", profileData);
  console.log("Star works array returned to client:", profileData.star_works);
  
  return {
    message: 'Profile data retrieved successfully',
    starWork: profileData.star_works
  };
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

  console.log(`Updating profile picture for user ${userId}, profile type ${profileType}, with image ${profilePicturePath}`);
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

export const updateBannerImage = async (userId, requestUserId, profileType, bannerImagePath) => {
  if (!userId || !profileType) {
    throw new Error('UserId and Profile Type are required');
  }

  // Ensure users can only update their own profiles
  if (parseInt(userId, 10) !== parseInt(requestUserId, 10)) {
    throw new Error('Forbidden: Cannot update another user\'s profile');
  }

  if (!bannerImagePath) {
    throw new Error('Banner Image path is required');
  }
  console.log(`Updating banner image for user ${userId}, profile type ${profileType}, with image ${bannerImagePath}`)

  const updatedProfile = await profileModel.updateBannerImage(
    userId, 
    profileType, 
    bannerImagePath
  );

  if (!updatedProfile) {
    throw new Error('Profile not found');
  }

  return {
    message: 'Banner Image updated successfully',
    bannerImage: bannerImagePath
  }
};

export const updateStarWork = async (userId, requestUserId, profileType, starWorkPath, imageIndex) => {
  console.log("Updating star work with path:", starWorkPath);
  if (!userId || !profileType) {
    throw new Error('UserId and Profile Type are required');
  }

  // Ensure users can only update their own profiles
  if (parseInt(userId, 10) !== parseInt(requestUserId, 10)) {
    throw new Error('Forbidden: Cannot update another user\'s profile');
  }

  if (!starWorkPath) {
    throw new Error('Star work image path is required');
  }
  console.log(`Updating star works for user ${userId}, profile type ${profileType}, with image ${starWorkPath}`)

  const updatedProfile = await profileModel.updateStarWork(
    userId, 
    profileType, 
    starWorkPath,
    imageIndex
  );

  if (!updatedProfile) {
    throw new Error('Profile not found');
  }

  return {
    message: 'Star Works updated successfully',
    starWorkPath: starWorkPath,
    imageIndex: imageIndex,
    starWork: updatedProfile.star_works
  }
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

export const getInteractions = async (profileId) => {
  if (!profileId) {
    throw new Error('Profile ID is required to get user interactions');
  }

  const postInteractions = await postModel.getProfilePostInteractions(profileId);
  const portfolioInteractions = await portfolioModel.getProfilePortfolioInteractions(profileId);

  const combinedInteractions = [...postInteractions, ...portfolioInteractions]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return combinedInteractions;
};