# QueueHub

A real-time queue management system designed for university office hours and TA help sessions.

## Features

- **Real-time Queue Management**
  - Join/leave queue functionality
  - Live position tracking
  - Estimated wait times
  - Progress bar visualization

- **Smart Priority System**
  - Dynamic queue reordering based on:
    - Previous attempts
    - Deadline proximity
    - Wait time
    - First-time asking bonus

- **User Authentication**
  - Student registration/login
  - Admin access (username: admin, password: 123)
  - JWT-based authentication

- **Admin Controls**
  - Queue management
  - Student prioritization
  - Pause/resume queue
  - Remove students from queue

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js, Express
- **Authentication**: JWT
- **Real-time Updates**: Polling
- **Notifications**: Browser notifications

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
  bash
  git clone https://github.com/minjaedavidpark/queuehub.git
  cd queuehub

2. Install backend dependencies
  bash
  cd backend
  npm install

3. Install frontend dependencies
  bash
  cd ../frontend
  npm install


### Running the Application

1. Start the backend server (from the backend directory)
   bash
   npm start


2. Start the frontend development server (from the frontend directory)
   bash
   npm start


### Admin Access
- Username: `admin@mail.utoronto.ca`
- Password: `0123456789`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Queue Operations
- `GET /api/queue` - Get current queue
- `POST /api/queue/join` - Join queue
- `POST /api/queue/leave` - Leave queue
- `GET /api/queue/status/:userId` - Get user's queue status

### Admin Operations
- `PATCH /api/admin/queue/pause` - Toggle queue pause state
- `DELETE /api/admin/queue/:id` - Remove user from queue
- `PATCH /api/admin/queue/:id/prioritize` - Prioritize user

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by real office hour challenges at University of Toronto
- Built to improve the student help-seeking experience
- Designed with feedback from TAs and professors
