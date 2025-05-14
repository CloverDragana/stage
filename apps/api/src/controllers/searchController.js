import * as searchModel from '../models/search.js';

export const searchUsers = async(query) => {
  // validate the query parameter passed from the route
  if (!query|| query.trim().length < 2){
    throw new Error('Search query must be at least 2 characters in length');
  }
  // call model passing validated parameter
  const searchResults = await searchModel.searchUsers(query);

  // return error for unsuccessful db data retrieval
  if (!searchResults){
    throw new Error ('Could not find search results');
  }
  // return successful data retrieval
  return { results: searchResults };
};

// export const getHomePageContent = async (userId, profileType) => {

//   if (!userId || !profileType) {
//     throw new Error('User ID and Profile Type required to retrieve homepage feed');
//   }
  

//   const homeFeedData = await searchModel.getHomeFeed(userId, profileType);
  
//   if (!homeFeedData) {
//     throw new Error('Home Feed data not found');
//   }
  
//   return {
//     message: 'Profile data retrieved successfully',
//     userId: profileData.userid,
//     username: profileData.username,
//     fullname: profileData.fullname,
//     profileId: profileData.profileid,
//     profileType: profileData.profile_type,
//     creativeSlogan: profileData.creative_slogan,
//     bio: profileData.bio,
//     profilePicture: profilePicture
//   };
// };