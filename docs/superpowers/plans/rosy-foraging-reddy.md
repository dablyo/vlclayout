# Visible Light AP Module Layout Editor - Implementation Plan

## Context

Build a full-stack web app for editing visible light AP module layouts on a 10m×10m map. The app has two reference HTML files (geodym.html with 9-module 3×3 layout, quadgeo.html with single module) that define the Three.js visualization math. The design spec at `docs/superpowers/specs/2026-05-13-vlclayout-design.md` defines the complete requirements.

**Key goal:** Translate the imperative Three.js from reference files into a React+R3F app with auth, persistence, and admin features.

## Architecture

```
vlclayout/
├── package.json              # Root deps for serverless functions
├── vercel.json               # Deployment config
├── .gitignore
├── .env.example
├── lib/                      # Shared backend utilities
│   ├── kv.js
│   ├── auth.js
│   └── middleware.js
├── api/                      # Vercel serverless functions
│   ├── auth/
│   │   ├── register.js
│   │   ├── login.js
│   │   ├── password.js
│   │   ├── admin-init.js
│   │   └── admin-status.js   # GET - check if admin initialized
│   ├── layouts/
│   │   ├── list.js
│   │   ├── save.js
│   │   └── delete.js
│   └── admin/
│       ├── users.js
│       └── delete-user.js
└── client/                   # Vite + React + R3F
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── styles/index.css
        ├── utils/
        │   ├── api.js
        │   ├── colors.js
        │   ├── grid.js
        │   └── demoLayouts.js
        ├── hooks/
        │   ├── useAuth.js
        │   ├── useLayouts.js
        │   ├── useScene.js
        │   ├── useModuleControls.js
        │   └── useToast.js
        └── components/
            ├── Auth/
            │   ├── Login.jsx
            │   ├── Register.jsx
            │   ├── ChangePassword.jsx
            │   └── AdminInit.jsx
            ├── Canvas/
            │   ├── Scene.jsx
            │   ├── MapGrid.jsx
            │   ├── Module.jsx
            │   └── CameraControls.jsx
            ├── Layout/
            │   ├── Sidebar.jsx
            │   ├── LayoutList.jsx
            │   ├── LayoutItem.jsx
            │   ├── ActionPanel.jsx
            │   └── PropertyPanel.jsx
            ├── Admin/
            │   ├── AdminPanel.jsx
            │   └── UserList.jsx
            └── Toast.jsx
```

## Phase 1: Root Scaffolding + Backend Auth

### 1.1 Root project files

**package.json** — Root deps for serverless functions: `@vercel/kv`, `bcryptjs`, `jsonwebtoken`. Scripts: `dev` (vercel dev), `build` (cd client && build).

**vercel.json** — `buildCommand: "cd client && npm install && npm run build"`, `outputDirectory: "client/dist"`, runtime `@vercel/node@3`, rewrites for SPA fallback.

**.gitignore** — node_modules, .env, .vercel, client/dist.

**.env.example** — JWT_SECRET, KV_REST_API_URL, KV_REST_API_TOKEN.

### 1.2 lib/kv.js

```js
import { createClient } from '@vercel/kv';
export const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
```

### 1.3 lib/auth.js

- `generateToken({ username, isAdmin })` — jwt.sign with 7d expiry, JWT_SECRET
- `verifyToken(token)` — jwt.verify, returns payload or throws
- `hashPassword(password)` — bcryptjs.hash(password, 10)
- `comparePassword(password, hash)` — bcryptjs.compare

### 1.4 lib/middleware.js

`withAuth(handler, options)` — Wraps Vercel serverless `(req, res)` handler:
- Extracts `Authorization: Bearer <token>`, verifies JWT, attaches `req.user`
- `options.requireAdmin: true` — reject non-admin (403)
- `options.rejectAdmin: true` — reject admin from layout endpoints (403)
- Try/catch for 500 errors, JSON error responses for 401/403

### 1.5 Auth API endpoints

**api/auth/register.js** — POST. Validate username (3-20 alphanumeric, "admin" reserved), password (≥6). Check KV `user:{username}`. If exists → 409. Hash, store, return token.

**api/auth/login.js** — POST. Get `user:{username}` from KV. Not found → 401. Compare password. Return `{ token, isAdmin }`.

**api/auth/password.js** — PUT. withAuth. Validate newPassword ≥6. Hash, update KV.

**api/auth/admin-init.js** — POST. Check `admin:initialized` in KV. If true → 409. Hash password, create `user:admin` with isAdmin:true, set `admin:initialized = true`, return token.

**api/auth/admin-status.js** — GET. Check `admin:initialized` in KV. Return `{ initialized: boolean }`. This is a minor addition not in the spec but needed for clean frontend flow.

## Phase 2: Backend Layout CRUD + Admin

### 2.1 api/layouts/list.js

GET. withAuth({ rejectAdmin: true }). Get `user:{username}:layouts` array from KV. For each ID, get `layout:{username}:{layoutId}`. Return array of `{ id, name, createdAt, updatedAt }`. Empty array if key missing.

### 2.2 api/layouts/save.js

POST. withAuth({ rejectAdmin: true }). Validate modules array (each: id positive int, x/z 0-1000, height 200-250, angle 78-110, color hex). Generate UUID via `crypto.randomUUID()`. Name: `"Layout YYYY-MM-DD HH:mm:ss"`. Store `layout:{username}:{layoutId}`. Append to `user:{username}:layouts`. Return `{ id, name }`.

### 2.3 api/layouts/delete.js

DELETE. withAuth({ rejectAdmin: true }). `id` from query string. Delete `layout:{username}:{layoutId}`. Remove ID from `user:{username}:layouts` array. Return `{ success: true }`.

### 2.4 api/admin/users.js

GET. withAuth({ requireAdmin: true }). `kv.keys('user:*')`, filter to single-colon format (exclude `user:xxx:layouts`). For each, get user data, return `{ username, createdAt }` (no passwordHash).

### 2.5 api/admin/delete-user.js

DELETE. withAuth({ requireAdmin: true }). Cannot delete "admin". Get `user:{username}:layouts`, delete each `layout:{username}:{layoutId}`, delete the layouts index key, delete `user:{username}`. Return `{ success: true }`.

## Phase 3: Client Scaffolding + Auth UI

### 3.1 Client setup

**client/package.json** — Dependencies: react, react-dom, @react-three/fiber, @react-three/drei, three. DevDeps: vite, @vitejs/plugin-react.

**client/vite.config.js** — Proxy `/api` → `http://localhost:3000` for Vercel dev.

**client/index.html** + **client/src/main.jsx** — Standard Vite React entry, wrap in AuthProvider.

### 3.2 Styles (client/src/styles/index.css)

Minimal CSS. `.app { display: flex; height: 100vh; }`. `.sidebar { width: 280px; overflow-y: auto; border-right: 1px solid #ddd; padding: 12px; }`. `.canvas-area { flex: 1; position: relative; }`. Clean form styles, button styles, layout-item styles.

### 3.3 Auth utility layer

**utils/api.js** — Fetch wrapper: injects JWT from localStorage, Content-Type header, throws on non-2xx with error message from JSON body.

**hooks/useAuth.js** — AuthContext + AuthProvider. State: token, user (decoded JWT). Methods: login, register, adminInit, changePassword, logout, checkAdminInitialized (calls /api/auth/admin-status).

### 3.4 Auth components

- **Login.jsx** — Username + password form. Switch to Register link.
- **Register.jsx** — Username + password + confirm. Client-side validation.
- **ChangePassword.jsx** — New password + confirm. Shown in sidebar.
- **AdminInit.jsx** — Full-page. Password + confirm. First-time setup.

### 3.5 App.jsx routing logic

Conditional render based on auth state:
- No token + admin not initialized → AdminInit
- No token → Login/Register
- Token + isAdmin → AdminPanel
- Token + !isAdmin → LayoutEditor

## Phase 4: 3D Scene

### 4.1 Scene + CameraControls

**Scene.jsx** — R3F Canvas wrapper:
```jsx
<Canvas camera={{ position: [1200, 900, 1200], fov: 60, near: 0.1, far: 5000 }}>
  <color attach="background" args={['#ffffff']} />
  <ambientLight intensity={1} />
  <CameraControls />
  <MapGrid />
  {/* Modules */}
</Canvas>
```

**CameraControls.jsx** — Owns OrbitControls ref. Arrow key camera movement (non-Ctrl). Uses `useFrame` + `window` keydown/keyup listeners. Moves camera + OrbitControls target together (same pattern as geodym.html lines 363-379). Ctrl+arrow ignored here (handled by useModuleControls).

**Key math from reference (geodym.html:363-379):**
```
forward = Vector3(0,0,-1).applyQuaternion(camera.quaternion), forward.y=0, normalize
right = Vector3(1,0,0).applyQuaternion(camera.quaternion), right.y=0, normalize
moveDir combines forward/right based on keys, multiplyScalar(20)
camera.position.add(moveDir), orbitControls.target.add(moveDir)
```

### 4.2 MapGrid

**MapGrid.jsx** — 10m×10m (1000×1000cm) grid. Uses `useFrame` to check `camera.position.y` and switch granularity:
- `<200` → 1cm grid
- `200-500` → 10cm grid
- `>500` → 100cm grid

Grid lines along X and Z axes at the chosen step interval. Boundary outline. Coordinate labels using drei `<Text>` at edges.

**utils/grid.js** — `getGridLevel(cameraY)` returns `{ step, label }`.

### 4.3 Module component

**Module.jsx** — Props: `{ id, x, z, height, angle, color, isSelected, showCoverage }`. Translates reference file math into R3F:

**Coverage math (from both references):**
```
halfAngleRad = (angle / 2) * PI / 180
groundDistance = height * tan(halfAngleRad)
d = groundDistance / sqrt(2)
perpDir = Vector3(-1, 0, 1).normalize()
diagDir = Vector3(1, 0, 1).normalize()
```

Renders:
1. **Green sphere** at (x, height, z) — `<mesh>` + `<sphereGeometry args={[6, 16, 16]}>`, onClick for selection
2. **Height line** — `<Line>` from (x,0,z) to (x,height,z), gray
3. **Coverage angle lines** — Two green `<Line>` from sphere to ground intercepts along perpDir
4. **Red dashed diagonal** — `<Line dashed>` from (x+d, 0, z-d) to (x-d, 0, z+d)
5. **Colored dashed circle** (if showCoverage) — 128-segment circle, radius=groundDistance
6. **Colored dashed square** (if showCoverage) — 4 vertices at (x±d, 0, z±d), closed loop
7. **Number label** — drei `<Text>` at (x, height+20, z)
8. **Selection ring** — RingGeometry at (x, 5, z) when isSelected

### 4.4 Scene + Layout contexts

**hooks/useScene.js** — SceneContext: showCoverage (boolean), selectedModuleId. Toggle/select/deselect methods.

**hooks/useLayouts.js** — LayoutContext: modules array, currentLayoutId, savedLayouts list. Methods: createModule (center 500,500; default height=200, angle=90; next ID = max+1), deleteModule, updateModule, moveModule, saveLayout, loadLayout, deleteLayout, fetchLayouts, clearModules.

**hooks/useModuleControls.js** — Ctrl+arrow key handler. Reads selectedModuleId from SceneContext. Moves module 1cm per press, 10cm/s when held (useFrame with delta). Clamps to [0, 1000].

### 4.5 Demo layouts

**utils/demoLayouts.js** — Two constants:
- GEODYM: 9 modules in 3×3 grid, 333cm spacing (matching geodym.html line 137)
- QUADGEO: 1 module at center (500,500)
- IDs prefixed with `demo-` to distinguish from server UUIDs

**utils/colors.js** — Palette array `["#0088ff", ...]` + `getModuleColor(index)` cycling function.

## Phase 5: Sidebar + Admin

### 5.1 Sidebar + LayoutList + LayoutItem

**Sidebar.jsx** — Left panel container: LayoutList (top, scrollable), ActionPanel (middle), PropertyPanel (bottom), user info (bottom: username, ChangePassword, logout).

**LayoutList.jsx** — Two demo items (Geodym, Quadgeo) at top (no delete button). Saved layouts below sorted by updatedAt desc. Active layout highlighted.

**LayoutItem.jsx** — `{ name, isDemo, isActive, onClick, onDelete }`. Active styling, delete X button for non-demo.

### 5.2 ActionPanel + PropertyPanel

**ActionPanel.jsx** — Buttons: Create Module, Delete Module (disabled if none selected), Save Layout (disabled if no modules). Coverage toggle checkbox.

**PropertyPanel.jsx** — Shows when module selected. Module ID (read-only). Height slider+number (200-250, step 1). Angle slider+number (78-110, step 0.1). Position display (read-only). Color swatch (read-only). Calls updateModule on change.

### 5.3 Admin panel

**AdminPanel.jsx** — Full page for admin. UserList + logout.

**UserList.jsx** — Fetch users on mount. Table: Username, Created At, Delete button. Cannot delete admin.

### 5.4 Toast

**hooks/useToast.js** — ToastContext. `showToast(message, type)`. Auto-dismiss 3s.

**Toast.jsx** — Fixed top-right position, renders active toasts.

## Phase 6: Integration

### 6.1 Wire App.jsx

```jsx
function App() {
  const { token, user } = useAuth();
  if (!token) return <AuthScreen />;
  if (user.isAdmin) return <AdminPanel />;
  return (
    <SceneProvider>
      <LayoutProvider>
        <div className="app">
          <Sidebar />
          <div className="canvas-area"><Scene /></div>
        </div>
      </LayoutProvider>
    </SceneProvider>
  );
}
```

Scene renders modules: `{modules.map(m => <Module key={m.id} {...m} ... />)}`

Deselection: `onPointerMissed` on Canvas → deselectModule.

### 6.2 Verification

1. `npm install && cd client && npm install`
2. `vercel dev` — test all API endpoints with curl
3. Open browser — admin init → register user → login → create/move modules → save/load layouts → switch demos
4. Test keyboard: arrow keys move camera, Ctrl+arrow moves module
5. Test grid: zoom in/out, verify granularity switches
6. Test admin: view users, delete user

## Key Risk Areas

1. **Dashed lines in R3F** — drei `<Line dashed>` handles `computeLineDistances` internally. If broken, fall back to `<primitive>` with manual `THREE.Line` + `LineDashedMaterial`.
2. **Keyboard conflict** — Arrow keys for camera (no Ctrl) vs Ctrl+arrow for module. Both on `window` listeners; Ctrl modifier distinguishes them.
3. **KV keys() pattern matching** — `kv.keys('user:*')` returns `user:alice` AND `user:alice:layouts`. Filter to single-colon format in admin/users.js.
