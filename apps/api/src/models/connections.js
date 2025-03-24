import { db } from '@stage/database';

export const checkFollow = async (followerProfileId, followedProfileId) => {
    const result = await db.query(
        `SELECT * FROM follows
        WHERE follower_profileid = $1 AND followed_profileid = $2`,
        [followerProfileId, followedProfileId]
    );
    
    return result.rows.length > 0;
};

export const createFollow = async (followerProfileId, followedProfileId) => {
    const result = await db.query(
      `INSERT INTO follows (follower_profileid, followed_profileid)
      VALUES ($1, $2) RETURNING *`,
      [followerProfileId, followedProfileId]
    );
    
    return result.rows[0];
};

export const getProfileFollowers = async (profileId) => {

    const result = await db.query(
        `SELECT p.profileid, p.userid, p.profile_type, u.username, u.fullname
        FROM follows f
        JOIN profiles p ON f.follower_profileid = p.profileid
        JOIN users u ON p.userid = u.userid
        WHERE f.followed_profileid = $1
        ORDER BY f.followed_at DESC`,
        [profileId]
    );
    
    return result.rows.map(row => ({
        userId: row.userid,
        profileId: row.profileid,
        profileType: row.profile_type,
        username: row.username,
        fullname: row.fullname,
        displayName: row.profile_type === 'personal' ? row.username : row.fullname
    }));
};

export const getProfileFollowing = async (profileId) => {
    const result = await db.query(
        `SELECT p.profileid, p.userid, p.profile_type, u.username, u.fullname
        FROM follows f
        JOIN profiles p ON f.followed_profileid = p.profileid
        JOIN users u ON p.userid = u.userid
        WHERE f.follower_profileid = $1
        ORDER BY f.followed_at DESC`,
        [profileId]
    );
    
    return result.rows.map(row => ({
        userId: row.userid,
        profileId: row.profileid,
        profileType: row.profile_type,
        username: row.username,
        fullname: row.fullname,
        displayName: row.profile_type === 'personal' ? row.username : row.fullname
    }));
};
