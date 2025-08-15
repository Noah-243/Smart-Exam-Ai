# Student Dashboard Components

This directory contains the Student Dashboard page, which has been broken down into smaller, reusable components for better maintainability.

## Component Structure

### Main Component

- `StudentDashboard.jsx`: The main wrapper component that integrates all the sub-components

### Sub-Components

- `components/StudentProfile.jsx`: Displays student information and basic statistics
- `components/AvailableTestCard.jsx`: Shows the currently available test for the student to take
- `components/SubjectPerformance.jsx`: Displays performance metrics by subject
- `components/UpcomingTests.jsx`: Lists upcoming scheduled tests

### Utilities

- `utils/dashboardUtils.js`: Contains shared utility functions used across dashboard components

## Data Flow

The main `StudentDashboard` component manages the API calls and state, then passes the relevant data to each component through props.

## Usage

Import the main component:

```javascript
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
```

Then use it in your routes or parent components.
