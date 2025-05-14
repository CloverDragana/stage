import * as portfolioModel from '../models/portfolios.js';

//documented
export const createPortfolio = async ( userId, profileType, title, description, content) => {

    if (!userId || !profileType){
        throw new Error('User Id and Profile Type is required to make a portfolio');
    }
    if (!title){
        throw new Error('Portfolio title is required to make a portfolio');
    }
    if (!description){
        throw new Error('Portfolio description is required to make a portfolio');
    }
    if (!content){
        throw new Error('Portfolio content is required to make a portfolio');
    }

    const portfolio = await portfolioModel.createPortfolio(userId, profileType, title, description, content);
    
    return {
        message: 'Portfolio created successfully',
        portfolio: portfolio
    };
};

export const getPortfolios = async ( userId, profileType) => {

    if (!userId){
        throw new Error('User Id is required to get a portfolio');
    }

    if (!profileType){
        throw new Error('Profile Type is required to get a portfolio');
    }

    const portfolios = await portfolioModel.getPortfolio(userId, profileType);
    
    return {
        message: 'Successfully retrieved portfolios',
        portfolios: portfolios
    };
};

export const getExplorePortfolios = async ( userId, profileType) => {

    if (!userId || !profileType){
        throw new Error('User Id and Profile Type is required to get explore portfolios');
    }

    const portfolios = await portfolioModel.getExplorePortfolios(userId, profileType);
    
    return Array.isArray(portfolios) ? portfolios : [];
};

export const getHomePagePortfolios = async ( userId, profileType) => {

    if (!userId || !profileType){
        throw new Error('User Id and Profile Type is required to get a homepage portfolio content');
    }

    const portfolios = await portfolioModel.getHomePagePortfolios(userId, profileType);
    
    return Array.isArray(portfolios) ? portfolios : [];
};

export const getPortfolioLike = async (portfolioId) => {
    console.log("Controller: Getting likes for portfolio Id:", portfolioId);

    if(!portfolioId){
        throw new Error('portfolio Id is required to get likes');
    }
    try {
        const likes = await portfolioModel.getPortfolioLike(portfolioId);
        return likes;
    } catch (error){
        console.error("Controller error in getPortfolioLike:", error);
        throw error;
    }
};

export const createPortfolioLike = async ( portfolioId, userId, profileType) => {
    console.log("Controller: Creating like for portfolio:", { portfolioId, userId, profileType });

    if (!userId || !profileType){
        throw new Error('User Id and Profile Type is required to make a portfolio like');
    }

    if(!portfolioId){
        throw new Error('Portfolio Id is required to like a portfolio');
    }
    try {
        const like = await portfolioModel.createPortfolioLike(portfolioId, userId, profileType);
    
        return {
            message: 'Portfolio liked successfully',
            interactionId: like.interactionid,
            postId: like.portfolioid,
            userId: like.userid,
            profileType: like.profile_type,
            createdAt: like.created_at,
        };
    } catch (error) {
        console.error("Controller error in createPortfolioLike:", error);
        throw error;
    }
};

export const deletePortfolioLike = async ( portfolioId, userId, profileType) => {

    if (!userId || !profileType){
        throw new Error('User Id and Profile Type is required to make a portfolio');
    }

    if(!portfolioId){
        throw new Error('Portfolio Id is required to unlike a portfolio');
    }

    const unlikeResult = await portfolioModel.deletePortfolioLike(portfolioId, userId, profileType);
    
    return {
        message: 'Portfolio unliked successfully',
        success: unlikeResult
    };
};

export const getCommentTotal = async (portfolioId) => {

    if(!portfolioId){
        throw new Error ('Portfolio ID is required to collect the comment total');
    }

    const commentTotal = await portfolioModel.getCommentTotal(portfolioId);

    return commentTotal;
};

export const getComments = async (portfolioId) => {

    if(!portfolioId){
        throw new Error ('Portfolio ID is required to collect the comment total');
    }

    const comments = await portfolioModel.getComments(portfolioId);

    return comments;
};

export const createComment = async (portfolioId, profileId, comment) => {

    if (!profileId){
        throw new Error('Profile Id is required to make a comment');
    }

    if(!portfolioId || !comment){
        throw new Error ('Portfolio ID and comment content is required');
    }

    const newComment = await portfolioModel.createComment(portfolioId, profileId, comment);

    return newComment;
};