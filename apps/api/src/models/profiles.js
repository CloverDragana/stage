import { db } from '@stage/database';

export const getProfileByUserIdAndType = async (userId, profileType) => {
  const result = await db.query(
    `SELECT p.*, u.username, u.fullname, u.personal_account, u.professional_account 
    FROM profiles p
    JOIN users u ON p.userid = u.userid
    WHERE p.userid = $1 and p.profile_type = $2`,
    [userId, profileType]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const getProfileIdByUserIdAndType = async (userId, profileType) => {
  const result = await db.query(
    `SELECT profileid
    FROM profiles p
    JOIN users u ON p.userid = u.userid
    WHERE p.userid = $1 and p.profile_type = $2`,
    [userId, profileType]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const getProfilePictureByUserIdAndType = async (userId, profileType) => {
  const result = await db.query(
    `SELECT profile_picture
    FROM profiles p
    JOIN users u ON p.userid = u.userid
    WHERE p.userid = $1 and p.profile_type = $2`,
    [userId, profileType]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const getBannerImageByUserIdAndType = async (userId, profileType) => {
  const result = await db.query(
    `SELECT banner_image
    FROM profiles p
    JOIN users u ON p.userid = u.userid
    WHERE p.userid = $1 and p.profile_type = $2`,
    [userId, profileType]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const getStarWorkByUserIdAndType = async (userId, profileType) => {
  const result = await db.query(
    `SELECT star_works
    FROM profiles p
    JOIN users u ON p.userid = u.userid
    WHERE p.userid = $1 and p.profile_type = $2`,
    [userId, profileType]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const getUserAccountSettings = async (userId) => {
  const result = await db.query(
    `SELECT personal_account, professional_account, profile_type
    FROM users 
    WHERE userid = $1`,
    [userId]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const updateUserProfileType = async (userId, profileType) => {
  const result = await db.query(
    'UPDATE users SET profile_type = $1 WHERE userid = $2 RETURNING *',
    [profileType, userId]
  );
  
  return result.rowCount > 0;
};

export const updateProfile = async (userId, profileType, data) => {
  const { creativeSlogan, bio } = data;
  
  const result = await db.query(
    `UPDATE profiles SET
      creative_slogan = $1,
      bio = $2
    WHERE userid = $3 and profile_type = $4
    RETURNING *`,
    [creativeSlogan, bio, userId, profileType]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const updateProfilePicture = async (userId, profileType, profilePictureUrl) => {
  console.log(`Model: Updating profile picture for user ${userId}, profileType=${profileType} with path ${profilePictureUrl}`);
  const result = await db.query(
    `UPDATE profiles SET
      profile_picture = $1
    WHERE userid = $2 and profile_type = $3
    RETURNING *`,
    [profilePictureUrl, userId, profileType]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const updateBannerImage = async (userId, profileType, bannerImageUrl) => {
  const result = await db.query(
    `UPDATE profiles SET
      banner_image = $1
    WHERE userid = $2 and profile_type = $3
    RETURNING *`,
    [bannerImageUrl, userId, profileType]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const updateStarWork = async (userId, profileType, starWorkPath, imageIndex) => {

  const currentStarWorks = await db.query(
    `SELECT star_works 
    FROM profiles
    WHERE userID = $1 AND profile_type = $2`,
    [userId, profileType]
  );
  console.log("Current star works from DB:", currentStarWorks.rows);

  let starWorks = [];
  if (currentStarWorks.rows.length > 0 && currentStarWorks.rows[0].star_works){
    starWorks = currentStarWorks.rows[0].star_works;
  } else {
    starWorks = [null, null, null];
  }
  console.log("Star works array before update:", starWorks);

  starWorks[imageIndex] = starWorkPath;

  console.log("Star works array after update:", starWorks);

  const result = await db.query(
    `UPDATE profiles SET
      star_works = $1
    WHERE userid = $2 and profile_type = $3
    RETURNING *`,
    [starWorks, userId, profileType]
  );
  console.log("Update result:", result.rows);
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const checkProfileExists = async (userId, profileType) => {
  const result = await db.query(
    `SELECT * FROM profiles WHERE userid = $1 AND profile_type = $2`,
    [userId, profileType]
  );
  
  return result.rows.length > 0;
};

export const createProfile = async (userId, profileType) => {
  const result = await db.query(
    `INSERT INTO profiles (userid, profile_type)
    VALUES ($1, $2) RETURNING *`,
    [userId, profileType]
  );
  
  return result.rows[0];
};

export const updateUserAccountSetting = async (userId, accountType, value) => {
  const result = await db.query(
    `UPDATE users SET ${accountType} = $1 WHERE userid = $2 RETURNING *`,
    [value, userId]
  );
  
  return result.rowCount > 0;
};
