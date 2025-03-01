import { db } from '@stage/database';

export const searchUserProfiles = async (userId, username, fullname) => {

    const result = await db.query(
        'SELECT * FROM profiles WHERE userid = $1 and profile_type = $2',
        [userId, profileType]
    );
}