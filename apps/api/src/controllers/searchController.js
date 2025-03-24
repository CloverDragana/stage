import * as searchModel from '../models/search.js';
import { hashPassword } from '@stage/auth';

export const searchUsers = async(query) => {
  if (!query|| query.trim().length < 2){
    throw new Error('Search query must be greater than 2 characters long');
  }

  const searchResults = await searchModel.searchUsers(query);

  if (!searchResults){
    throw new Error ('Could not find search results');
  }

  return { results: searchResults };
}