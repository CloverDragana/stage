import { db } from '@stage/database';

//documented
export const createPortfolio = async (userId, profileType, title, description, content) => {

    const profileIdResult = await db.query(
        `SELECT profileid 
        FROM profiles 
        WHERE userid = $1 AND profile_type = $2`,
        [userId, profileType]
      );
    
      if (profileIdResult.rows.length === 0) {
          throw new Error('Profile not found');
      }
    
      const profileId = profileIdResult.rows[0].profileid;
    
  const result = await db.query(
    `INSERT INTO portfolio (profileid, title, description, content)
    VALUES ($1, $2, $3, $4)
    RETURNING portfolioid, profileid, title, description, created_at`,
    [profileId, title, description, JSON.stringify(content)]
  );
    
  return result.rows[0];
};

export const getPortfolio = async (userId, profileType) => {
  const profileIdResult = await db.query(
    `SELECT profileid 
    FROM profiles 
    WHERE userid = $1 AND profile_type = $2`,
    [userId, profileType]
  );

  if (profileIdResult.rows.length === 0) {
      throw new Error('Portfolio not found');
  }

  const profileId = profileIdResult.rows[0].profileid;

  const result = await db.query(
    `SELECT p.*, pr.profile_type, pr.profile_picture, u.userid, u.username, u.fullname
     FROM portfolio p
     JOIN profiles pr ON p.profileid = pr.profileid
     JOIN users u ON pr.userid = u.userid
     WHERE p.profileid = $1`,
    [profileId]
  );
  return result.rows.length > 0 ? result.rows : [];
};

export const getExplorePortfolios = async (userId, profileType) => {
  const profileIdResult = await db.query(
    `SELECT profileid FROM profiles 
    WHERE userid = $1 AND profile_type = $2`,
    [userId, profileType]
  );

  if (profileIdResult.rows.length === 0) {
      throw new Error('Portfolio not found');
  }

  const profileId = profileIdResult.rows[0].profileid;

  const portfolioResult = await db.query(
   `SELECT p.*, pr.profile_type, pr.profile_picture, u.userid, u.username, u.fullname
     FROM portfolio p
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
    
  return portfolioResult.rows.length > 0 ? portfolioResult.rows : [];
};

export const getHomePagePortfolios = async (userId, profileType) => {
  const profileIdResult = await db.query(
    `SELECT profileid FROM profiles 
    WHERE userid = $1 AND profile_type = $2`,
    [userId, profileType]
  );

  if (profileIdResult.rows.length === 0) {
      throw new Error('Profile not found');
  }

  const profileId = profileIdResult.rows[0].profileid;

  const portfolioResult = await db.query(
   `SELECT p.*, pr.profile_type, u.userid, u.username, u.fullname
     FROM portfolio p
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
    
  return portfolioResult.rows.length > 0 ? portfolioResult.rows : [];
};

export const getPortfolioLike = async (portfolioId)=> {
  try {
    console.log("Getting likes for portfolioId:", portfolioId);

    const likeResult = await db.query(
    `SELECT i.interactionid, i.portfolioid, i.profileid, i.created_at,
                p.userid, p.profile_type as profiletype
        FROM portfoliointeractions i
        JOIN profiles p ON i.profileid = p.profileid
        WHERE i.portfolioid = $1 AND i.portfolioLike = TRUE`,
        [portfolioId]
    );
    
    return likeResult.rows;
  } catch (error) {
    console.error("Database error in getPortfolioLike:", error);
    throw error;
  }
};

export const createPortfolioLike = async (portfolioId, userId, profileType)=> {
  try {
    console.log("Creating like for portfolio:", { portfolioId, userId, profileType });
    
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
       FROM portfoliointeractions 
       WHERE portfolioid = $1 AND profileid = $2 AND portfolioLike = TRUE`,
      [portfolioId, profileId]
    );
    
    if (existingLike.rows.length > 0) {
      return {
        interactionid: existingLike.rows[0].interactionid,
        portfolioid: portfolioId,
        profileid: profileId,
        userid: userId,
        profiletype: profileType
      };
    }
    
    const likeResult = await db.query(
      `INSERT INTO portfoliointeractions (portfolioid, profileid, portfolioLike, comment)
       VALUES ($1, $2, TRUE, NULL)
       RETURNING interactionid, portfolioid, profileid, created_at`,
      [portfolioId, profileId]
    );
    
    if (likeResult.rows.length === 0) {
      throw new Error('Failed to create like on portfolio');
    }
    
    return {
      ...likeResult.rows[0],
      userid: userId,
      profiletype: profileType
    };
  } catch (error) {
    console.error("Database error in createPortfolioLike:", error);
    throw error;
  }
};

export const deletePortfolioLike = async (portfolioId, userId, profileType)=> {
  const unlikeResult = await db.query(
    `DELETE FROM portfoliointeractions i
      USING profiles p, users u
      WHERE i.profileid = p.profileid
      AND p.userid = u.userid
      AND i.portfolioid = $1
      AND p.userid = $2
      AND u.profile_type = $3
      AND i.portfolioLike = TRUE
      RETURNING i.interactionid`,
     [portfolioId, userId, profileType]
   );
     
   return unlikeResult.rowCount > 0;
};

export const getCommentTotal = async (portfolioId) => {
  
  const commentTotal = await db.query(
    `SELECT COUNT (comment)
    FROM portfoliointeractions
    WHERE portfolioId = $1`,
    [portfolioId]
  )

  return parseInt(commentTotal.rows[0].count);
};

export const getComments = async (portfolioId) => {

  const commentResult = await db.query(
   `SELECT pi.*, p.profile_type, u.username, u.fullname, u.userid
     FROM portfoliointeractions pi
     JOIN profiles p ON pi.profileid = p.profileid
     JOIN users u ON p.userid = u.userid
     WHERE pi.portfolioid = $1 AND pi.comment IS NOT NULL
     ORDER BY pi.created_at DESC`,
    [portfolioId]
  );
  return commentResult.rows;
};

export const createComment = async (portfolioId, profileId, comment) => {

  const commentResult = await db.query(
   `INSERT INTO portfoliointeractions 
     (portfolioid, profileid, comment, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [portfolioId, profileId, comment]
  );
  
  return commentResult.rows[0];
};

export const getProfilePortfolioInteractions = async (profileId) => {
  const result = await db.query(
    `SELECT pi.*,
            pf.title,
            pf.description,
            (pf.content->'cover_image')::text as thumbnail,
            author_profile.profileid as author_profileid,
            u.username as author_username
     FROM portfoliointeractions pi
     JOIN portfolio pf ON pi.portfolioid = pf.portfolioid
     JOIN profiles author_profile ON pf.profileid = author_profile.profileid
     JOIN users u ON author_profile.userid = u.userid
     WHERE pi.profileid = $1
     ORDER BY pi.created_at DESC`,
    [profileId]
  );

  return result.rows.map(row => ({
    ...row,
    post_id: null,
    portfolio_id: row.portfolioid,
    interaction_type: row.portfoliolike ? 'like' : 'comment'
  }));
};