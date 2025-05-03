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