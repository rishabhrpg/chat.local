# Local Chat - Client (Vite + React + TypeScript)

This is the modern React + TypeScript client application for the Local Chat project, built with Vite for fast development and optimized builds.

## Features

- **React + TypeScript**: Type-safe React components
- **Vite**: Lightning-fast HMR and optimized builds
- **React Router**: Client-side routing
- **Axios**: HTTP client with interceptors
- **Socket.IO Client**: Real-time WebSocket communication
- **Service Pattern**: Clean separation of concerns with dedicated service classes
- **Component-Based Architecture**: Reusable, modular components

## Project Structure

```
client-vite/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ChatHeader/
│   │   ├── LoginModal/
│   │   ├── MessageForm/
│   │   ├── MessageItem/
│   │   └── MessageList/
│   ├── pages/              # Route pages
│   │   ├── ChatPage/
│   │   └── LoginPage/
│   ├── services/           # Business logic services
│   │   ├── api.ts          # Axios configuration
│   │   ├── authService.ts  # Authentication service
│   │   ├── messageService.ts # Message/file service
│   │   └── socketService.ts  # WebSocket service
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx             # Main app with routing
│   ├── App.css
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── .env                    # Environment variables
├── .env.example            # Environment variables template
├── vite.config.ts          # Vite configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or >=22.12.0 recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `VITE_SERVER_PORT`: The port where the API server is running (default: 80)

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

The dev server is configured to proxy API requests to `http://localhost:80` (or the port specified in your `.env` file).

### Build

Build for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Environment Variables

- `VITE_SERVER_PORT`: The port where the API server runs (default: 80)

## API Configuration

The app automatically detects whether it's running on localhost or on a production server:

- **Localhost**: Uses the port from `VITE_SERVER_PORT` environment variable
- **Production**: Uses the same domain as the client (expects Express to serve the static files)

This is configured in `src/services/api.ts` and `src/services/socketService.ts`.

## Services

### AuthService
Handles user authentication:
- Login
- Registration
- Token verification
- Token management (localStorage)

### MessageService
Manages messages and file operations:
- Fetch messages
- Upload files
- Get file URLs

### SocketService
Manages real-time WebSocket connections:
- Connect/disconnect
- Send messages
- Typing indicators
- Event handling

## Component Architecture

### Pages
- **LoginPage**: User authentication interface
- **ChatPage**: Main chat interface with real-time messaging

### Components
- **LoginModal**: Reusable modal for login/registration
- **ChatHeader**: Header with user info and logout
- **MessageList**: Scrollable list of messages with typing indicators
- **MessageItem**: Individual message display (text/file/system)
- **MessageForm**: Input form with file upload and drag-drop

## TypeScript

The project uses strict TypeScript configuration with:
- Type-safe props and state
- Proper typing for services
- Centralized type definitions in `src/types/`

## Linting

Run the linter:
```bash
npm run lint
```

## License

See the main project README for license information.
