# TODO: Remove Followers and Following from Profile

## Frontend Changes
- [x] Edit client/src/pages/PublicProfile.jsx to remove followers/following count display
- [x] Remove follow/unfollow button and related UI elements from PublicProfile.jsx
- [x] Remove following state and related logic from PublicProfile.jsx

## Backend Changes
- [x] Edit server/routes/authRoutes.js to remove follow/unfollow routes
- [x] Edit server/controllers/authController.js to remove followUser and unfollowUser functions

## Testing
- [ ] Test the profile page to ensure followers and following are removed
