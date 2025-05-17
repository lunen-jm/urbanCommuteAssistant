# TECHIN 510 Final Project Description

## Project Objectives
- Develop an interactive real-time web application that integrates diverse urban data streams (traffic conditions, harsh weather, public transportation schedules) to assist commuters in making informed daily decisions.
- Clearly present real-time urban data to users, providing actionable commuting suggestions based on current environmental and transit conditions.
- Tailor recommendations based on user location and destination information, enabling personalized commuting solutions.

## Target Users and Needs
- **Daily Commuters**: Professionals and students in urban settings who regularly navigate city infrastructure.
  - Need timely and accessible information about current environmental conditions (weather, traffic, transportation).
  - Require proactive notifications regarding disruptions or delays in their daily commute.
  - Seek alternative commuting suggestions when disruptions or unfavorable conditions arise.

## Key Deliverables
- Interactive web application integrating multiple web APIs (traffic, weather, public transportation).
- Real-time visualizations of urban data conditions.
- Map-based visualization indicating active disruptions and recommended alternatives.
- Notification system allowing users to set preferences for alerts and updates.

## Special Constraints
- Compliance with data privacy regulations, specifically the California Consumer Privacy Act (CCPA), regarding management and protection of user data.

## Expected Outcome
- Enhanced quality of life for users through improved daily decision-making, minimized commuting stress, and increased adaptability to urban disruptions.

## Progress

4.18.25 - Initial container app has been created, current location is used, the map is shown, the API connections are initialized (keys have not been included yet in repository due to debugging), and general project dependencies and packages are listed in their respective documents.

5.2.25 - Following steps/features completed:
* Initialized frontend and backend projects
* Set up database models and migrations
* Configured authentication system
* Connected to traffic, weather, and transit APIs
* Built data processing pipeline
* Created caching layer with appropriate TTLs
* Implemented fallback mechanisms and circuit breakers
* Added comprehensive logging and metrics collection
* Developed unit and integration tests for data services
* Standardized data normalization across all endpoints
* Documented API integrations and data transformation logic
* Built interactive map interface
* Created initial dashboard views

Note: Data initial dashboard is sample data as APIs are not fully integrated

5.16.25 - Following steps/features completed:
* Created a simplified version of the app (urban-commute-assistant-simple) for easier development and deployment
  * Docker was causing too many issues
  * API Keys were just not working and I spent too much time debugging (around 15 hours that I chose not to charge my client for since it was my fault)
* Implemented a lightweight FastAPI backend with Flask-compatible API endpoints
* Built a responsive frontend using React, Vite, and modern CSS techniques
* Integrated real-time transit data fetching based on user's geolocation
  * Client decided that he wanted it to always bring him to one of the locations, based on his current location instead of home
* Added interactive map visualization with Leaflet.js showing transit stops and traffic incidents
  * Incident markers give helpful visualizations, but client wants them smaller moving forward
* Created a weather information component with current conditions and forecast
* Developed a dashboard with responsive layout for both desktop and mobile views
  * Focused on mobile as client will likely use his phone for most, he provided many changes for the layout
  * Organized cards in a variable order based on recommend commute choice
* Added location selection with real addresses (Home, Work, Gym, School)
* Implemented ETA calculation for selected routes
* Created automated setup scripts for Windows environments (PowerShell)
* Added commute recommendations based on current weather and traffic conditions
* Improved mobile responsiveness with adaptive stacking layouts
* Implemented Redux state management for consistent data flow
* Created deployment configurations for Netlify (frontend) and Render (backend)
* Added service worker for offline capability and improved loading performance
* Fixed cross-browser compatibility issues in Safari and Firefox
* Optimized map performance for mobile devices
* Added thorough documentation for setup, deployment, and troubleshooting
* Implemented fallbacks when APIs are unavailable

## Next Steps / Known Issues

* **User Authentication System**
  * Implement secure login/registration with JWT or OAuth
  * Add user profiles with saved preferences and commute history instead of one default user
* **Transit Data API Integration**
  * Fix the current implementation, markers are off and stops are not populating accuratly in cards
  * Implement transit vehicle tracking on the map
* **Design & UI Refinements**
  * Reduce map marker size per client feedback
  * Add route alternatives visualization (only main is populated currently)
  * Implement dark mode support
* **Enhanced Personalization**
  * Add user preference learning based on commute choices
  * Develop custom notifications for specific routes/stops
* **Advanced Weather Integration**
  * Add hourly forecasts for commute planning
  * Implement severe weather alerts and routing adjustments