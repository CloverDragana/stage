import * as userModel from '../models/users.js';
import { hashPassword } from '@stage/auth';

export const registerUser = async (userData) => {
  // Check for required fields
  if (!userData.fullname || !userData.email || 
      !userData.username || !userData.password || !userData.profileType) {
    throw new Error('All fields are required');
  }
  
  // Check if user already exists
  const existingUsers = await userModel.findUserByUsernameOrEmail(userData.email, userData.username);
  
  if (existingUsers.length > 0) {
    const user = existingUsers[0];
    if (user.email === userData.email) {
      throw new Error('Email already registered');
    }
    if (user.username === userData.username) {
      throw new Error('Username already taken');
    }
  }
  
  // Hash password
  const hashedPassword = await hashPassword(userData.password);
  
  // Create user
  const newUser = await userModel.createUser({
    ...userData,
    password: hashedPassword
  });
  
  // Create profile
  const createUser = await userModel.createProfile(newUser.userid, userData.profileType);
  
  if (!createUser){
    throw new Error('User could not be created');
  }
  return {
    message: 'User successfully registered',
    userId: newUser.userid
  };
};

export const updateUserDetails = async (userId, requestUserId, userData) => {
  // Ensure users can only update their own profile
  if (userId !== requestUserId) {
    throw new Error('Forbidden: Cannot update another user\'s profile');
  }
  
  const updatedUser = await userModel.updateUserAccount(userId, userData);
  
  if (!updatedUser) {
    throw new Error('User not found');
  }
  
  return {
    message: 'Profile updated successfully!',
    user: updatedUser
  };
};

export const deleteUserAccount = async (userId) => {
  const deleted = await userModel.deleteUser(userId);
  
  if (!deleted) {
    throw new Error('User not found');
  }
  
  return { message: 'Account deleted successfully!' };
};