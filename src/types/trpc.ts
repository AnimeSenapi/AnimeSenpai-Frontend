/**
 * tRPC Types
 * 
 * This file contains the TypeScript types for the tRPC API router.
 * It should match the backend router structure.
 */

// Define the AppRouter type structure based on the backend router
export interface AppRouter {
  // Auth router
  auth: {
    login: any
    register: any
    refresh: any
    logout: any
    me: any
  }
  
  // User router
  user: {
    getProfile: any
    updateProfile: any
    getAnimeList: any
    addToAnimeList: any
    updateAnimeListItem: any
    removeFromAnimeList: any
  }
  
  // Anime router
  anime: {
    search: any
    getById: any
    getTrending: any
    getPopular: any
    getByGenre: any
    getByStudio: any
    getRecommendations: any
  }
  
  // Admin router
  admin: {
    getAchievements: any
    createAchievement: any
    updateAchievement: any
    deleteAchievement: any
    getAchievementStats: any
    bulkCreateAchievements: any
  }
  
  // Achievements router
  achievements: {
    getAll: any
    getUserAchievements: any
    checkAndUnlock: any
  }
  
  // Health router
  health: {
    check: any
  }
  
  // Additional routers from backend
  twoFactor: any
  recommendations: any
  onboarding: any
  social: any
  moderation: any
  gdpr: any
  studio: any
  activity: any
  reviewInteractions: any
  notifications: any
  privacy: any
  messaging: any
  leaderboards: any
  safety: any
  listTools: any
  roleManagement: any
  systemSettings: any
  monitoring: any
  analytics: any
}
