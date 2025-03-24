import * as postModel from '../models/posts.js';

export const createPost = async ( profileId, postText, fileData) => {

    if (!profileId){
        throw new Error('ProfileId is required');
    }

    const postData ={
        postText,
        fileData
    }

    const post = await postModel.createPost(profileId, postData);
    
    return {
        message: 'Post created successfully',
        postId: post.postid,
        createdAt: post.created_at
    };
};