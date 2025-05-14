import { db } from '@stage/database';

export const searchUsers = async (query) => {
  // SQL wildcard, search for records that CONTAIN the values in the query
  const searchData = `%${query}%`;
  // make the query case insensitive
  const queryText = query.toLowerCase();

  // return profiles ranked by how well they match the query
  const result = await db.query(
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

  // lines 41 to 43 :
  // use the displayname to either
  // return the fullname for professional profiles
  // return the username for personal profiles
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
};

// export const getHomeFeed = async (userId, profileType) => {
//   const profileIdResult = await db.query( 
//     `SELECT profileid FROM profiles 
//     WHERE userid = $1 AND profile_type = $2`,
//     [userId, profileType]
//   );

//   if (profileIdResult.rows.length === 0) {
//       throw new Error('Profile not found');
//   }

//   const profileId = profileIdResult.rows[0].profileid;

//   const postResult = await db.query(
//     `SELECT p.*, pf.*, pr.profile_type, u.userid, u.username, u.fullname
//       FROM posts p
//       JOIN portfolio pf ON p.profileid = pf.profileid
//       JOIN profiles pr ON p.profileid = pr.profileid
//       JOIN users u ON pr.userid = u.userid
//       WHERE p.profileid = $1 
//          OR p.profileid IN (
//             SELECT followed_profileid 
//             FROM follows 
//             WHERE follower_profileid = $1
//          )
//       ORDER BY p.created_at DESC`,
//      [profileId]
//    );

//    return postResult.rows.length > 0 ? postResult.rows : [];
// };