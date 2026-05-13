# Visible Light AP Module Layout Editor - Design Spec

## Overview

A full-stack web application for editing and visualizing visible light AP (Access Point) module layouts. Users can create, position, and configure AP modules on a 10m×10m map, with each module having height and coverage angle properties. The system includes user authentication and layout persistence.

## Tech Stack

- **Frontend**: Vite + React + Three.js
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Vercel KV (Redis)
- **Auth**: JWT tokens (7-day expiry)
- **Deployment**: Vercel

## Architecture

```
/
├── client/                    # Vite + React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── index.html
│   └── vite.config.js
├── api/                       # Vercel serverless functions
│   ├── auth/
│   │   ├── register.js
│   │   ├── login.js
│   │   ├── password.js
│   │   └── admin-init.js
│   ├── layouts/
│   │   ├── list.js
│   │   ├── save.js
│   │   └── delete.js
│   └── admin/
│       ├── users.js
│       └── delete-user.js
├── lib/                       # Shared utilities
│   ├── kv.js                  # Vercel KV client
│   ├── auth.js                # JWT utilities
│   └── middleware.js          # Auth middleware
├── vercel.json
└── package.json
```

## Data Models

### User

```
Key: user:{username}
Value: {
  passwordHash: string,    // bcrypt hashed
  isAdmin: boolean,
  createdAt: number        // timestamp
}
```

### Layout

```
Key: layout:{username}:{layoutId}
Value: {
  id: string,              // UUID
  name: string,            // auto-generated "Layout YYYY-MM-DD HH:mm:ss"
  modules: [{
    id: number,            // 1, 2, 3... incrementing
    x: number,             // position in cm (0-1000)
    z: number,             // position in cm (0-1000)
    height: number,        // 200-250 cm
    angle: number,         // 78-110 degrees
    color: string          // hex color for coverage area (e.g., "#0088ff")
  }],
  createdAt: number,
  updatedAt: number
}

Key: user:{username}:layouts
Value: [layoutId1, layoutId2, ...]  // List of layout IDs for user
```

### Admin State

```
Key: admin:initialized
Value: boolean    // tracks if admin password has been set
```

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{ "username": "string", "password": "string" }
```

**Response:**
```json
{ "token": "jwt_token" }
// or
{ "error": "Username already exists" }
```

#### POST /api/auth/login
Login with existing credentials.

**Request:**
```json
{ "username": "string", "password": "string" }
```

**Response:**
```json
{ "token": "jwt_token", "isAdmin": false }
// or
{ "error": "Invalid credentials" }
```

#### PUT /api/auth/password
Change password for logged-in user.

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{ "newPassword": "string" }
```

**Response:**
```json
{ "success": true }
```

#### POST /api/auth/admin-init
First-time admin password setup. Only available when `admin:initialized` is false.

**Request:**
```json
{ "password": "string" }
```

**Response:**
```json
{ "token": "jwt_token" }
```

### Layouts

#### GET /api/layouts
List all layouts for the authenticated user.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
[
  { "id": "uuid", "name": "Layout 2026-05-13 14:30:00", "createdAt": 1234567890, "updatedAt": 1234567890 },
  ...
]
```

#### POST /api/layouts
Save current layout. Auto-generates name from timestamp.

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "modules": [
    { "id": 1, "x": 500, "z": 500, "height": 220, "angle": 90, "color": "#0088ff" },
    ...
  ]
}
```

**Response:**
```json
{ "id": "uuid", "name": "Layout 2026-05-13 14:30:00" }
```

#### DELETE /api/layouts?id={layoutId}
Delete a layout.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{ "success": true }
```

### Admin (admin only)

#### GET /api/admin/users
List all users.

**Headers:** `Authorization: Bearer {token}` (admin only)

**Response:**
```json
[
  { "username": "user1", "createdAt": 1234567890 },
  ...
]
```

#### DELETE /api/admin/users?username={username}
Delete a user and all their layouts.

**Headers:** `Authorization: Bearer {token}` (admin only)

**Response:**
```json
{ "success": true }
```

## Frontend Components

### Component Structure

```
client/src/
├── App.jsx                 # Main app with routing
├── main.jsx                # Entry point
├── components/
│   ├── Auth/
│   │   ├── Login.jsx       # Login form
│   │   ├── Register.jsx    # Registration form
│   │   ├── ChangePassword.jsx
│   │   └── AdminInit.jsx   # First-time admin setup
│   ├── Layout/
│   │   ├── Sidebar.jsx     # Left toolbar container
│   │   ├── LayoutList.jsx  # Top: layout list with static items
│   │   ├── LayoutItem.jsx  # Single layout entry with delete button
│   │   ├── ActionPanel.jsx # Middle: create/delete/save buttons
│   │   └── PropertyPanel.jsx  # Bottom: module properties editor
│   ├── Canvas/
│   │   ├── Scene.jsx       # Three.js scene setup & render loop
│   │   ├── MapGrid.jsx     # 10m×10m grid with auto-switching detail
│   │   ├── Module.jsx      # Single AP module 3D visualization
│   │   └── CameraControls.jsx  # Keyboard/mouse input handling
│   └── Admin/
│       ├── AdminPanel.jsx  # User management container
│       └── UserList.jsx    # User list with delete buttons
├── hooks/
│   ├── useAuth.js          # Auth context, login/logout/register
│   ├── useLayouts.js       # Fetch/save/delete layouts
│   └── useScene.js         # Three.js scene state management
├── utils/
│   ├── api.js              # Fetch wrapper with JWT injection
│   ├── colors.js           # Generate unique module colors
│   └── grid.js             # Grid level calculations
└── styles/
    └── index.css           # Tailwind or plain CSS
```

### UI Layout

```
+------------------+----------------------------------------+
|    Sidebar       |           Canvas Area                  |
|  +------------+  |                                        |
|  | LayoutList |  |                                        |
|  | - Geodym   |  |      10m × 10m Map                     |
|  | - Quadgeo  |  |      (Three.js Scene)                  |
|  | - Layout 1 |  |                                        |
|  | - Layout 2 |  |                                        |
|  +------------+  |                                        |
|  +------------+  |                                        |
|  | Actions    |  |                                        |
|  | [Create]   |  |                                        |
|  | [Delete]   |  |                                        |
|  | [Save]     |  |                                        |
|  +------------+  |                                        |
|  +------------+  |                                        |
|  | Properties |  |                                        |
|  | Height: __ |  |                                        |
|  | Angle: ___ |  |                                        |
|  +------------+  |                                        |
+------------------+----------------------------------------+
```

## Scene Interaction

### Camera Controls

| Input | Action |
|-------|--------|
| Arrow keys | Move camera position (20cm per press) |
| Arrow keys (held) | Continuous camera movement (10cm/s) |
| Mouse scroll | Zoom in/out |
| Mouse drag | Rotate camera around target |

### Module Selection

| Input | Action |
|-------|--------|
| Click on module | Select module (outline highlight) |
| Ctrl + Arrow keys | Move selected module (1cm per press) |
| Ctrl + Arrow keys (held) | Move selected module (10cm/s) |

**Constraints:**
- Module position clamped to 0-1000cm (within map bounds)
- Only single selection supported (no multi-select)

### Grid Auto-Switching

| Camera Altitude | Grid Granularity |
|-----------------|------------------|
| < 200cm | 1cm × 1cm cells |
| 200cm - 500cm | 10cm × 10cm cells |
| > 500cm | 100cm × 100cm cells |

Grid labels at map edges show coordinates from 0 to 1000cm.

### Module Visualization

Each module consists of:

1. **Green sphere**: Positioned at (x, height, z), represents the AP
2. **Height indicator**: Green vertical line from (x, 0, z) to sphere
3. **Coverage angle lines**: Two green lines from sphere to ground intercept points
4. **Diagonal indicator**: Red dashed line across coverage area
5. **Coverage area** (global toggle, affects all modules):
   - Colored circle (radius = groundDistance)
   - Inscribed square (side = groundDistance × √2)
6. **Module number**: Floating label above sphere

**Module color assignment:**
- Colors assigned from a predefined palette (matching geodym.html):
  `["#0088ff", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899", "#eab308", "#6366f1", "#d946ef", "#a0522d"]`
- Colors cycle through palette if more than 9 modules
- Color persists with module when saved to backend

**Module ID behavior:**
- IDs are assigned incrementally (1, 2, 3...)
- When a module is deleted, remaining modules keep their IDs (no renumbering)
- New modules get the next available ID (max existing ID + 1)

**Coverage calculation:**
```
halfAngle = angle / 2 (in radians)
groundDistance = height × tan(halfAngle)
circleRadius = groundDistance
squareSide = groundDistance × √2
```

### Static Demo Layouts

Two fixed items in the layout list:
1. **Geodym** - Shows 9 modules in 3×3 grid (from geodym.html reference)
2. **Quadgeo** - Shows single module demo (from quadgeo.html reference)

These are rendered client-side only, not persisted to backend.

## Authentication Flow

### Registration
1. User enters username and password
2. Backend checks `user:{username}` exists in KV
3. If username available: hash password with bcrypt, store user
4. Generate JWT with `{ username, isAdmin }` payload
5. Return token

### Login
1. User enters username and password
2. Backend retrieves `user:{username}` from KV
3. Verify password with bcrypt
4. Generate JWT, return token + isAdmin flag

### Admin First-Time Setup
1. On app load, check if admin password is set (via `/api/auth/admin-init` availability)
2. If not set: show admin password setup screen
3. After setting: store `admin:initialized = true` in KV
4. Admin logs in normally thereafter

### JWT Protection
- All `/api/layouts/*` and `/api/admin/*` endpoints require valid JWT
- JWT payload: `{ username, isAdmin, iat, exp }`
- Expiry: 7 days
- Client stores token in localStorage

## Admin Features

Admin account (`admin` username):
- First login triggers password setup
- Can view all users
- Can delete any user (and their layouts)
- Cannot access layout editor (no create/view layouts)

Admin panel shows:
- List of all registered users
- Delete button per user
- No self-service features (admin password change via special flow)

## Deployment Configuration

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "client/dist",
  "functions": {
    "api/**/*.js": {
      "runtime": "@vercel/node@3"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "kv": [
    { "name": "vlclayout-kv" }
  ]
}
```

### Environment Variables

```
JWT_SECRET=your-secret-key-here
KV_REST_API_URL=from-vercel-kv
KV_REST_API_TOKEN=from-vercel-kv
```

## Error Handling

### API Errors

| Status | Message |
|--------|---------|
| 400 | Invalid request body |
| 401 | Invalid or missing token |
| 403 | Admin access required |
| 404 | Resource not found |
| 409 | Username already exists |
| 500 | Internal server error |

### Client Error Display

- API errors shown as toast notifications
- Form validation errors shown inline
- Network errors show retry button

## Success Criteria

1. Users can register and login
2. Admin can be initialized on first use
3. Users can create, move, and delete modules
4. Module properties (height, angle) can be adjusted
5. Layouts can be saved and loaded from backend
6. Static demos (Geodym, Quadgeo) render correctly
7. Grid auto-switches based on camera zoom
8. App deploys successfully to Vercel
