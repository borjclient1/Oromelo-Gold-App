/**
 * Application-wide constants
 * 
 * This file contains constants that are used throughout the application.
 * Centralizing these values makes it easier to update them in one place.
 */

// Admin user configuration
export const ADMIN_EMAILS = ["shredraldz@gmail.com", "admin@oromelo.ph", "ermpolicarpio@gmail.com"];

// Function to check if a user is an admin
export const isAdmin = (user) => {
  return ADMIN_EMAILS.includes(user?.email);
};
