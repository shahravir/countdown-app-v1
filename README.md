# Countdown App v1

A fullstack countdown and event management app for tracking key dates (releases, meetings, deadlines, etc.) with a live timer and progress visualization.

## Features
- Add, edit, and hide important events (releases, meetings, deadlines, etc.)
- See a live-updating timer and progress bar for each event
- Responsive, modern UI with a grid of event cards
- MongoDB backend for persistent storage
- No login required (personal use)

## Folder Structure
```
countdown-app-v1/
  backend/    # Node.js/Express/MongoDB API
  frontend/   # React app (UI)
  README.md
  .gitignore
```

## Prerequisites
- [Node.js](https://nodejs.org/) (v20 recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/) running locally (default: `mongodb://localhost:27017/countdown-app`)

## Setup Instructions

### 1. Clone the repository
```sh
git clone <repo-url>
cd countdown-app-v1
```

### 2. Install backend dependencies
```sh
cd backend
npm install
```

### 3. Install frontend dependencies
```sh
cd ../frontend
npm install
```

### 4. Start MongoDB
Make sure MongoDB is running locally. (Default connection: `mongodb://localhost:27017/countdown-app`)

### 5. Start the backend server
```sh
cd ../backend
npm start
```
The backend will run on [http://localhost:5001](http://localhost:5001)

### 6. Start the frontend app
```sh
cd ../frontend
npm start
```
The frontend will run on [http://localhost:3000](http://localhost:3000)

## Usage
- Open [http://localhost:3000](http://localhost:3000) in your browser.
- Add events using the "+ Add Event" button.
- Each card shows ETA, time left, and a progress bar as the event approaches.
- Hide events with the × button. Click the event title to edit.
- Hidden events can be shown/unhidden with the "Show Hidden Cards" button.

## Customization
- To change the MongoDB connection, edit `backend/index.js`.
- To change the default ports, edit the `PORT` in backend and frontend configs.

---

Enjoy managing your countdowns! 