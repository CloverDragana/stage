import * as postModel from '../models/posts.js';
import * as profileModel from '../models/profiles.js';

export const createPost = async ( userId, profileType, postText, postImage) => {
    console.log('Creating post with:', { userId, profileType, postText, postImage});

    if (!userId || !profileType){
        throw new Error('User Id and Profile Type is required to make a post');
    }

    const postData ={
        postText,
        imagePath: postImage,
    }

    const post = await postModel.createPost(userId, profileType, postData);
    
    return {
        message: 'Post created successfully',
        postId: post.postid,
        createdAt: post.created_at,
        postImage: post.post_image,
    };
};

export const getProfilePosts = async ( userId, profileType) => {
    console.log('Getting homepage post with:', { userId, profileType });

    if (!userId || !profileType){
        throw new Error('User Id and Profile Type is required to get a profile post');
    }

    const posts = await postModel.getProfilePosts(userId, profileType);
    
    return Array.isArray(posts) ? posts : [];
};

export const getHomePagePosts = async ( userId, profileType) => {
    console.log('Getting home page post with:', { userId, profileType });

    if (!userId || !profileType){
        throw new Error('User Id and Profile Type is required to get a homepage post');
    }

    const posts = await postModel.getHomePagePosts(userId, profileType);
    
    return Array.isArray(posts) ? posts : [];
};

export const getExplorePosts = async ( userId, profileType) => {
    console.log('Getting explore page posst with:', { userId, profileType });

    if (!userId || !profileType){
        throw new Error('User Id and Profile Type is required to get a homepage post');
    }

    const posts = await postModel.getExplorePosts(userId, profileType);
    
    return Array.isArray(posts) ? posts : [];
};

export const deletePost = async ( postId) => {
    console.log('Deleting post with:', { postId });

    if (!postId){
        throw new Error('Post Id is required to delete post');
    }

    const deleteSuccess = await postModel.deletePost(postId);
    
    return { deleteSuccess, message: deleteSuccess ? 'Post deleted successfully' : 'No post found to delete' };
};
export const getPostLike = async (postId) => {
    console.log("Controller: Getting likes for postId:", postId);

    if(!postId){
        throw new Error('Post Id is required to get likes');
    }
    try {
        const likes = await postModel.getPostLike(postId);
        return likes;
    } catch (error){
        console.error("Controller error in getPostLike:", error);
        throw error;
    }
};

export const createPostLike = async ( postId, userId, profileType) => {
    console.log("Controller: Creating like for post:", { postId, userId, profileType });

    if (!userId || !profileType){
        throw new Error('User Id and Profile Type is required to make a post');
    }

    if(!postId){
        throw new Error('Post Id is required to like a post');
    }
    try {
        const like = await postModel.createPostLike(postId, userId, profileType);
    
        return {
            message: 'Post liked successfully',
            interactionId: like.interactionid,
            postId: like.postid,
            userId: like.userid,
            profileType: like.profile_type,
            createdAt: like.created_at,
        };
    } catch (error) {
        console.error("Controller error in createPostLike:", error);
        throw error;
    }
};

export const deletePostLike = async ( postId, userId, profileType) => {

    if (!userId || !profileType){
        throw new Error('User Id and Profile Type is required to make a post');
    }

    if(!postId){
        throw new Error('Post Id is required to unlike a post');
    }

    const unlikeResult = await postModel.deletePostLike(postId, userId, profileType);
    
    return {
        message: 'Post unliked successfully',
        success: unlikeResult
    };
};

export const getCommentTotal = async (postId) => {

    if(!postId){
        throw new Error ('Post ID is required to collect the comment total');
    }

    const commentTotal = await postModel.getCommentTotal(postId);

    return commentTotal;
};

export const getComments = async (postId) => {

    if(!postId){
        throw new Error ('Post ID is required to collect the comment total');
    }

    const comments = await postModel.getComments(postId);

    return comments;
};

export const createComment = async (postId, profileId, comment) => {

    // if (!userId || !profileType){
    //     throw new Error('User Id and Profile Type is required to make a comment');
    // }

    // const profileData = await profileModel.getProfileByUserIdAndType(userId, profileType);

    // if (!profileData) {
    //     throw new Error('Profile not found');
    
    // }

    // if(!postId || !comment){
    //     throw new Error ('Post ID and comment content is required');
    // }

    // const newComment = await postModel.createComment(postId, profileData.profileId, comment);
    if (!profileId){
        throw new Error('Profile Id is required to make a comment');
    }

    if (!postId || !comment) {
        throw new Error('Post ID and Comment are required to add a comment');
      }
      
      const newComment = await postModel.createComment(postId, profileId, comment);
      
      return newComment;
};