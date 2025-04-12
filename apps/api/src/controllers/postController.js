import * as postModel from '../models/posts.js';

export const createPost = async ( userId, profileType, postText, fileData) => {
    console.log('Creating post with:', { userId, profileType, postText, hasFile: !!fileData });

    if (!userId || !profileType){
        throw new Error('User Id and Profile Type is required to make a post');
    }

    const postData ={
        postText,
        fileData
    }

    const post = await postModel.createPost(userId, profileType, postData);
    
    return {
        message: 'Post created successfully',
        postId: post.postid,
        createdAt: post.created_at
    };
};