# Portfolio Module Implementation TODO

## Backend Tasks
- [x] Define Portfolio model with fields: title, description, link, category, tags, privacy (public/private), user reference
- [x] Add portfolio controller functions: createPortfolio, getUserPortfolios, updatePortfolio, deletePortfolio
- [x] Add portfolio routes: POST /portfolio, GET /portfolio, PUT /portfolio/:id, DELETE /portfolio/:id
- [ ] Update server routes to include portfolio endpoints

## Frontend Tasks
- [x] Create Portfolio.jsx page with form to add/edit portfolio items
- [ ] Add privacy toggle (public/private) for each portfolio item
- [ ] Display user's portfolio items with edit/delete options
- [x] Update Dashboard.jsx to navigate to /portfolio page
- [x] Update App.jsx to include /portfolio route
- [x] Add portfolio viewing on public profiles (only public posts)

## Testing & Validation
- [ ] Test portfolio CRUD operations
- [ ] Add form validation for portfolio fields
- [ ] Implement error handling for API calls
- [ ] Test privacy settings (public posts visible to all, private only to owner)

## Additional Features
- [ ] Add categories/tags for better organization
- [ ] Add image/thumbnail support for portfolio items
- [ ] Add search/filter functionality
- [ ] Add portfolio analytics/stats
