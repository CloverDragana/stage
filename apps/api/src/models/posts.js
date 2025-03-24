import { db } from '@stage/database';


export const createPost = async (userId, profileType, postData) => {
  const { postText, fileData } = postData;

  const postType = fileData ? 'image' : 'text';

  let mediaUrls = null;

  if (fileData){
    
  }
  
  const result = await db.query(
    `INSERT INTO posts (profileid, post_type, post_text, media_urls)
    VALUES ($1, $2, $3, $4) RETURNING *`,
    [profileId, postType, postText, mediaUrls]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

// export const editPost = async (userId, profileType, data) => {
//     const { creativeSlogan, bio } = data;
    
//     const result = await db.query(
//       `UPDATE profiles SET
//         creative_slogan = $1,
//         bio = $2
//       WHERE userid = $3 and profile_type = $4
//       RETURNING *`,
//       [creativeSlogan, bio, userId, profileType]
//     );
    
//     return result.rows.length > 0 ? result.rows[0] : null;
// };

// export const deletePost = async (userId, profileType, data) => {
//     const { creativeSlogan, bio } = data;
    
//     const result = await db.query(
//       `UPDATE profiles SET
//         creative_slogan = $1,
//         bio = $2
//       WHERE userid = $3 and profile_type = $4
//       RETURNING *`,
//       [creativeSlogan, bio, userId, profileType]
//     );
    
//     return result.rows.length > 0 ? result.rows[0] : null;
// };