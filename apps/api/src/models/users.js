import { db } from '@stage/database';

export const findUserByUsernameOrEmail = async (email, username) => {
  const pgConnection = await db.connect();

  try {
    const result = await pgConnection.query(
      'SELECT email, username FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    return result.rows;
  } finally {
    pgConnection.release();
  }
};


// This code isn't accessed due to NextAuth configuration, set up for potential full migration to node
export const createUser = async (userData) => {

  const pgConnection = await db.connect();
  try {
    const result = await pgConnection.query(
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
  } finally {
    pgConnection.release();
  }
};

export const createProfile = async (userId, profileType) => {

  const pgConnection = await db.connect();

  try {
    const result = await pgConnection.query(
      `INSERT INTO profiles (userid, profile_type)
      VALUES ($1, $2) RETURNING *`,
      [userId, profileType.toLowerCase()]
    );
    return result.rows[0];
  } finally {
    pgConnection.release();
  }
};

export const updateUserAccount = async (userId, userData) => {
  const { fullname, username, email, gender, dob } = userData;
  const pgConnection = await db.connect();
  
  try {
    const result = await pgConnection.query(
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

  } finally {
    pgConnection.release();
  }
};

export const deleteUser = async (userId) => {

  const pgConnection = await db.connect();

  try {
    const result = await pgConnection.query(
      `DELETE FROM users
      WHERE userid = $1
      RETURNING *`,
      [userId]
    );
    
    return result.rowCount > 0;

  } finally {
    pgConnection.release();
  }
};

// export const searchUsers = async (query) => {

//   const searchData = `%${query}%`;
//   const queryText = query.toLowerCase();

//   const pgConnection = await db.connect();

//   try {
//     const result =  await pgConnection.query(
//       `SELECT u.userid, u.username, u.fullname, u.personal_account, u.professional_account 
//       FROM users u 
//       LEFT JOIN profiles p ON p.userid = u.userid AND p.profile_type = u.profile_type
//       WHERE (LOWER(u.fullname) LIKE LOWER($1) or LOWER(u.username) LIKE LOWER($1))
//       ORDER BY
//         CASE 
//           WHEN LOWER(u.username) = LOWER($2) THEN 0
//           WHEN LOWER(u.fullname) = LOWER($2) THEN 0
//           WHEN LOWER(u.username) LIKE LOWER($2 || '%') THEN 1
//           WHEN LOWER(u.fullname) LIKE LOWER($2 || '%') THEN 1
//           ELSE 2
//         END,
//       u.username
//       LIMIT 10`,
//       [searchData, queryText]
//     )

//     return result.rows.map(user => ({
//       userId: user.userid,
//       username: user.username,
//       fullname: user.fullname || "",
//       hasPersonalProfile: user.personal_account,
//       hasProfessionalProfile: user.professional_account,
//       profilePicture: user.profile_picture || null
//     }));

//   } finally {
//     pgConnection.release();
//   }
// }