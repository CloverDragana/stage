import { db } from '@stage/database';

export const createPost = async (userId, profileType, postData) => {
  const { postText, imagePath } = postData;

  const postType = imagePath ? 'image' : 'text';

  const profileIdResult = await db.query(
    `SELECT profileid FROM profiles 
    WHERE userid = $1 AND profile_type = $2`,
    [userId, profileType]
  );

  if (profileIdResult.rows.length === 0) {
      throw new Error('Profile not found');
  }

  const profileId = profileIdResult.rows[0].profileid;
    
  const result = await db.query(
    `INSERT INTO posts (profileid, post_type, post_text, post_image)
    VALUES ($1, $2, $3, $4) RETURNING *`,
    [profileId, postType, postText, imagePath]
  );
    
  return result.rows.length > 0 ? result.rows[0] : null;
};


export const getProfilePosts = async (userId, profileType) => {
  const profileIdResult = await db.query(
    `SELECT profileid FROM profiles 
    WHERE userid = $1 AND profile_type = $2`,
    [userId, profileType]
  );

  if (profileIdResult.rows.length === 0) {
      throw new Error('Profile not found');
  }

  const profileId = profileIdResult.rows[0].profileid;

  const postResult = await db.query(
    `SELECT p.*, pr.profile_type, u.userid, u.username, u.fullname
     FROM posts p
     JOIN profiles pr ON p.profileid = pr.profileid
     JOIN users u ON pr.userid = u.userid
     WHERE p.profileid = $1
     ORDER BY p.created_at DESC`,
    [profileId]
  );
    
  return postResult.rows.length > 0 ? postResult.rows : [];
};

export const getHomePagePosts = async (userId, profileType) => {
  const profileIdResult = await db.query(
    `SELECT profileid FROM profiles 
    WHERE userid = $1 AND profile_type = $2`,
    [userId, profileType]
  );

  if (profileIdResult.rows.length === 0) {
      throw new Error('Profile not found');
  }

  const profileId = profileIdResult.rows[0].profileid;

  const postResult = await db.query(
   `SELECT p.*, pr.profile_type, u.userid, u.username, u.fullname
     FROM posts p
     JOIN profiles pr ON p.profileid = pr.profileid
     JOIN users u ON pr.userid = u.userid
     WHERE p.profileid = $1 
        OR p.profileid IN (
           SELECT followed_profileid 
           FROM follows 
           WHERE follower_profileid = $1
        )
     ORDER BY p.created_at DESC`,
    [profileId]
  );
    
  return postResult.rows.length > 0 ? postResult.rows : [];
};

export const getExplorePosts = async (userId, profileType) => {
  const profileIdResult = await db.query(
    `SELECT profileid FROM profiles 
    WHERE userid = $1 AND profile_type = $2`,
    [userId, profileType]
  );

  if (profileIdResult.rows.length === 0) {
      throw new Error('Profile not found');
  }

  const profileId = profileIdResult.rows[0].profileid;

  const postResult = await db.query(
   `SELECT p.*, pr.profile_type, u.userid, u.username, u.fullname
     FROM posts p
     JOIN profiles pr ON p.profileid = pr.profileid
     JOIN users u ON pr.userid = u.userid
     WHERE p.profileid != $1 
        AND p.profileid NOT IN (
           SELECT followed_profileid 
           FROM follows 
           WHERE follower_profileid = $1
        )
     ORDER BY p.created_at DESC
     LIMIT 6`,
    [profileId]
  );
    
  return postResult.rows.length > 0 ? postResult.rows : [];
};

export const deletePost = async (postId ) => {
    
    const result = await db.query(
      `DELETE FROM posts
      WHERE postid = $1
      RETURNING *`,
      [postId]
    );
    
    return result.rowCount > 0;
};

export const getPostLike = async (postId ) => {
  try {
    console.log("Getting likes for postId:", postId);

    const likeResult = await db.query(
    `SELECT i.interactionid, i.postid, i.profileid, i.created_at,
                p.userid, p.profile_type as profiletype
        FROM postinteractions i
        JOIN profiles p ON i.profileid = p.profileid
        WHERE i.postid = $1 AND i.postLike = TRUE`,
        [postId]
    );
    
    return likeResult.rows;
  } catch (error) {
    console.error("Database error in getPostLike:", error);
    throw error;
  }
};

// export const createPostLike = async (postId, userId, profileType) => {

//   const checkExisting = await db.query(
//     `SELECT c.commentid 
//      FROM comments c
//      JOIN profiles p ON c.profileid = p.profileid
//      JOIN users u ON p.userid = u.userid
//      WHERE c.postid = $1 AND p.userid = $2 AND u.profile_type = $3 AND c.positive_comment = TRUE`,
//     [postId, userId, profileType]
//   );

//   if (checkExisting.rows.length > 0) {
//     return checkExisting.rows[0];
//   }

//   const likeResult = await db.query(
//    `INSERT INTO comments (postid, profileid, positive_comment, comment)
//      SELECT $1, p.profileid, TRUE, NULL
//      FROM profiles p
//      JOIN users u ON p.userid = u.userid
//      WHERE p.userid = $2 AND u.profile_type = $3
//      RETURNING 
//       comments.*,
//       p.userid,
//       u.profile_type AS profiletype`,
//     [postId, userId, profileType]
//   );

//   if (likeResult.rows.length === 0) {
//       throw new Error('Cannot Like post');
//   }
    
//   return likeResult.rows[0]
// };

export const createPostLike = async (postId, userId, profileType) => {
  try {
    console.log("Creating like for post:", { postId, userId, profileType });
    
    const profileIdResult = await db.query(
      `SELECT profileid 
       FROM profiles 
       WHERE userid = $1 AND profile_type = $2`,
      [userId, profileType]
    );
    
    if (profileIdResult.rows.length === 0) {
      throw new Error('User profile not found');
    }
    
    const profileId = profileIdResult.rows[0].profileid;
    
    const existingLike = await db.query(
      `SELECT interactionid 
       FROM postinteractions 
       WHERE postid = $1 AND profileid = $2 AND postLike = TRUE`,
      [postId, profileId]
    );
    
    if (existingLike.rows.length > 0) {
      return {
        interactionid: existingLike.rows[0].interactionid,
        postid: postId,
        profileid: profileId,
        userid: userId,
        profiletype: profileType
      };
    }
    
    const likeResult = await db.query(
      `INSERT INTO postinteractions (postid, profileid, postLike, comment)
       VALUES ($1, $2, TRUE, NULL)
       RETURNING interactionid, postid, profileid, created_at`,
      [postId, profileId]
    );
    
    if (likeResult.rows.length === 0) {
      throw new Error('Failed to create like');
    }
    
    return {
      ...likeResult.rows[0],
      userid: userId,
      profiletype: profileType
    };
  } catch (error) {
    console.error("Database error in createPostLike:", error);
    throw error;
  }
};
export const deletePostLike = async (postId, userId, profileType) => {
  const unlikeResult = await db.query(
   `DELETE FROM postinteractions i
     USING profiles p, users u
     WHERE i.profileid = p.profileid
     AND p.userid = u.userid
     AND i.postid = $1
     AND p.userid = $2
     AND u.profile_type = $3
     AND i.postLike = TRUE
     RETURNING i.interactionid`,
    [postId, userId, profileType]
  );
    
  return unlikeResult.rowCount > 0;
};

export const getCommentTotal = async (postId) => {

  const commentTotal = await db.query(
    `SELECT COUNT (comment)
    FROM postinteractions
    WHERE postid = $1`,
    [postId]
  )
  return parseInt(commentTotal.rows[0].count);
};

export const getComments = async (postId) => {

  const commentResult = await db.query(
    `SELECT pi.*, p.profile_type, u.username, u.fullname, u.userid
     FROM postinteractions pi
     JOIN profiles p ON pi.profileid = p.profileid
     JOIN users u ON p.userid = u.userid
     WHERE pi.postid = $1 AND pi.comment IS NOT NULL
     ORDER BY pi.created_at DESC`,
    [postId]
  );
  return commentResult.rows;
};

export const createComment = async (postId, profileId, comment) => {

  console.log('Model creating comment with:', { postId, profileId, comment });
  
  const commentResult = await db.query(
   `INSERT INTO postinteractions 
     (postid, profileid, comment, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [postId, profileId, comment]
  );
  
  return commentResult.rows[0];
};

export const getProfilePostInteractions = async (profileId) => {
  const result = await db.query(
    `SELECT pi.*, 
            p.post_text as description,
            p.post_image as thumbnail,
            p.post_type,
            author_profile.profileid as author_profileid,
            u.username as author_username
     FROM postinteractions pi
     JOIN posts p ON pi.postid = p.postid
     JOIN profiles author_profile ON p.profileid = author_profile.profileid
     JOIN users u ON author_profile.userid = u.userid
     WHERE pi.profileid = $1
     ORDER BY pi.created_at DESC`,
    [profileId]
  );

  return result.rows.map(row => ({
    ...row,
    post_id: row.postid,
    portfolio_id: null,
    title: row.post_type === 'text' ? row.description?.substring(0, 30) + '...' : 'Image Post',
    interaction_type: row.postlike ? 'like' : 'comment'
  }));
};
