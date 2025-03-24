import { db } from '@stage/database';

// export const searchUserProfiles = async (userId, username, fullname) => {

//     const result = await db.query(
//         'SELECT * FROM profiles WHERE userid = $1 and profile_type = $2',
//         [userId, profileType]
//     );
// }

export const searchUsers = async (query) => {
  const searchData = `%${query}%`;
  const queryText = query.toLowerCase();

  const pgConnection = await db.connect();

  try {
    const result = await pgConnection.query(
      `SELECT 
        u.userid, 
        u.username, 
        u.fullname, 
        u.personal_account, 
        u.professional_account,
        p.profile_type,
        p.profileid,
        p.profile_picture
      FROM users u 
      LEFT JOIN profiles p ON p.userid = u.userid
      WHERE (LOWER(u.fullname) LIKE LOWER($1) OR LOWER(u.username) LIKE LOWER($1))
      ORDER BY
        CASE 
          WHEN LOWER(u.username) = LOWER($2) THEN 0
          WHEN LOWER(u.fullname) = LOWER($2) THEN 0
          WHEN LOWER(u.username) LIKE LOWER($2 || '%') THEN 1
          WHEN LOWER(u.fullname) LIKE LOWER($2 || '%') THEN 1
          ELSE 2
        END,
      u.username
      LIMIT 10`,
      [searchData, queryText]
    );

    return result.rows.map(user => ({
      userId: user.userid,
      username: user.profile_type === 'personal' ? user.username : null,
      fullname: user.profile_type === 'professional' ? user.fullname : null,
      displayName: user.profile_type === 'personal' ? user.username : user.fullname,
      profileId: user.profileid,
      profileType: user.profile_type,
      hasPersonalProfile: user.personal_account,
      hasProfessionalProfile: user.professional_account,
      profilePicture: user.profile_picture || null
    }));

  } finally {
    pgConnection.release();
  }
};