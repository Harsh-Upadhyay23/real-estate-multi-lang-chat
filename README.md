# Real Estate Multilingual Chat App

## Overview
This project is a **real estate chat application** that enables agents and clients to communicate seamlessly in different languages. Messages are translated in real-time based on the user's preferred language. Upon logout, an **automated agreement** is generated based on the chat conversation.

## Features
- **Real-time Chat:** Clients and agents can chat instantly.
- **Multilingual Support:** Messages are automatically translated to the user's preferred language.
- **Session-Based Authentication:** Users must register and log in to access the chat.
- **Message Storage:** Chat messages are saved in a MySQL database.
- **Agreement Generation:** When a user logs out, a formal agreement is generated based on the conversation using Gemini AI.
- **Socket.io Integration:** Real-time communication between users.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** bcrypt.js, express-session
- **Real-time Communication:** Socket.io
- **Translation API:** MyMemory Translated API
- **AI Integration:** Google Gemini AI
- **Frontend:** EJS, HTML, CSS, JavaScript

## Installation
### Prerequisites
- Node.js (v16 or later)
- MySQL

### Steps
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd <project-folder>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file and add the following:
     ```sh
     GEMINI_API_KEY=your-google-gemini-api-key
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your-password
     DB_NAME=chatapp1
     ```
4. Import the database schema:
   - Import `database.sql` into MySQL.
5. Start the server:
   ```sh
   node server.js
   ```
6. Open in browser:
   ```
   http://localhost:3000
   ```

## Directory Structure
```
📦 Project Folder
 ┣ 📂 node_modules/       # Dependencies
 ┣ 📂 public/             # Static files (CSS, JS, Images)
 ┣ 📂 views/              # EJS templates for rendering UI
 ┣ 📜 .env                # Environment variables
 ┣ 📜 database.sql        # MySQL Database Schema
 ┣ 📜 package.json        # Project Metadata & Dependencies
 ┣ 📜 package-lock.json   # Package Lock File
 ┣ 📜 server.js           # Main Server File
```

## API Endpoints
| Route       | Method | Description |
|------------|--------|-------------|
| `/`        | GET    | Redirects to login or chat page |
| `/chat`    | GET    | Chat page (Requires authentication) |
| `/login`   | GET    | Login page |
| `/register` | GET    | Registration page |
| `/register` | POST   | User registration |
| `/login`   | POST   | User login |
| `/logout`  | GET    | Generates an agreement and logs out |

## Agreement Generation
When a user logs out, an **agreement document** is generated using Gemini AI based on the chat history. The AI extracts key points, obligations, and terms into a structured format.

## Contact
For any queries, feel free to reach out!

---
### Future Enhancements
- **More advanced AI processing for agreements**
- **User role management** (Agent, Client, Admin)
- **File sharing in chat**
- **Mobile app integration**

