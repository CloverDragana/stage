import { db } from '@stage/database';

export const findUserByUsernameOrEmail = async (email, username) => {
  const result = await db.query(
    'SELECT email, username FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );
  return result.rows;
};


// This code isn't accessed due to NextAuth configuration, set up for potential full migration to node
export const createUser = async (userData) => {
  const result = await db.query(
    `INSERT INTO users (
      fullname, email, username, password, 
      profile_type, personal_account, professional_account
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING userid`,
    [
      userData.fullname,
      userData.email,
      userData.username,
      userData.password, // Already hashed
      userData.profileType,
      userData.personal_account,
      userData.professional_account
    ]
  );
  return result.rows[0];
};

export const createProfile = async (userId, profileType) => {
  const result = await db.query(
    `INSERT INTO profiles (userid, profile_type)
    VALUES ($1, $2) RETURNING *`,
    [userId, profileType.toLowerCase()]
  );
  return result.rows[0];
};

export const updateUserAccount = async (userId, userData) => {
  const { fullname, username, email, gender, dob } = userData;
  
  const result = await db.query(
    `UPDATE users
    SET fullname = $1,
        username = $2,
        email = $3,
        gender = $4,
        dob = $5
    WHERE userid = $6
    RETURNING *`,
    [fullname, username, email, gender, dob, userId]
  );
  
  return result.rowCount > 0 ? result.rows[0] : null;
};

export const deleteUser = async (userId) => {
  const result = await db.query(
    `DELETE FROM users
    WHERE userid = $1
    RETURNING *`,
    [userId]
  );
  
  return result.rowCount > 0;
};