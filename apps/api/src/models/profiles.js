import { db } from '@stage/database';


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

export const getProfileByUserIdAndType = async (userId, profileType) => {
  const result = await db.query(
    'SELECT * FROM profiles WHERE userid = $1 and profile_type = $2',
    [userId, profileType]
  );
  
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

export const updateUserAccountSetting = async (userId, accountType, value) => {
  const result = await db.query(
    `UPDATE users SET ${accountType} = $1 WHERE userid = $2 RETURNING *`,
    [value, userId]
  );
  
  return result.rowCount > 0;
};