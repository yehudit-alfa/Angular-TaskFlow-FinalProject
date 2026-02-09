# Task Manager Client

Task Manager Client is an Angular single-page app for managing teams, projects, and tasks in a kanban-style workflow.

## Features
- Team management (create teams, add members)
- Project management (create projects, delete projects)
- Task boards (backlog, in progress, done) with comments
- Authentication (login and register)
- Toast notifications and empty states

## Tech Stack
- Angular (standalone components)
- RxJS
- TypeScript

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install
```
npm install
```

### Run
```
npm start
```

The app will be available at http://localhost:4200/ by default.

### Build
```
npm run build
```

### Test
```
npm test
```

## Project Structure
```
src/
  app/
    components/
    services/
    models/
```

## Notes
- API base URLs are configured in src/app/app.config.constants.ts.
- The app stores only the auth token in localStorage.
