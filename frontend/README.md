# AERO Frontend

React SPA for managing helicopter flight operations — planning aerial inspections, creating flight orders, and managing approval workflows.

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool + dev server |
| MUI (Material UI) v7 | Component library |
| react-hook-form + zod | Form management + validation |
| react-leaflet + Leaflet | Map rendering (OpenStreetMap) |
| Axios | HTTP client |
| react-router-dom v7 | Client-side routing |
| Vitest + Testing Library | Unit testing |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (proxies /api to localhost:8080)
npm run dev

# Build for production
npm run build

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

The dev server runs on `http://localhost:5173` and proxies `/api/**` requests to the Spring Boot backend at `http://localhost:8080`.

## Project Structure

```
src/
├── api/                        # Axios client + typed API functions
│   ├── client.ts               # Axios instance with error interceptors
│   ├── operations.api.ts       # Flight operations CRUD + KML upload
│   ├── orders.api.ts           # Flight orders CRUD + status changes
│   ├── helicopters.api.ts      # Helicopters CRUD
│   ├── crew.api.ts             # Crew members CRUD
│   ├── landingSites.api.ts     # Landing sites CRUD
│   ├── dictionaries.api.ts     # Enum dictionaries (activity types, statuses)
│   ├── auth.api.ts             # Login/logout/session
│   └── types.ts                # TypeScript interfaces mirroring backend DTOs
├── components/
│   ├── Layout/Layout.tsx       # Role-aware sidebar + top bar + content area
│   ├── MapView.tsx             # Reusable Leaflet map (polylines, markers, auto-fit)
│   ├── ConfirmDialog.tsx       # Reusable MUI confirmation dialog
│   ├── ProtectedRoute.tsx      # Auth guard + role check
│   └── modals/                 # Legacy modal components (CRUD dialogs)
├── contexts/
│   ├── AuthContext.tsx          # User session (login/logout/useAuth)
│   └── NotificationContext.tsx  # Toast notifications (useNotification)
├── hooks/
│   └── useUnsavedChanges.ts    # Dirty-form navigation warning
├── pages/
│   ├── login/LoginPage.tsx
│   ├── dashboard/DashboardPage.tsx
│   ├── helicopters/HelicopterListPage.tsx
│   ├── crew/CrewListPage.tsx
│   ├── landing-sites/LandingSiteListPage.tsx
│   ├── users/UserListPage.tsx
│   ├── operations/
│   │   ├── OperationListPage.tsx
│   │   └── OperationFormPage.tsx   # Create/edit flight operations
│   └── orders/
│       ├── OrderListPage.tsx
│       └── OrderFormPage.tsx       # Create/edit flight orders
├── utils/
│   └── notificationEmitter.ts  # Event bridge for Axios -> React notifications
├── test/
│   ├── setup.ts                # Vitest setup (jest-dom matchers)
│   ├── notificationEmitter.test.ts
│   ├── ConfirmDialog.test.tsx
│   ├── NotificationContext.test.tsx
│   ├── MapView.test.tsx
│   ├── OperationFormPage.test.tsx
│   └── OrderFormPage.test.tsx
├── App.tsx                     # Router + provider wiring
├── theme.ts                    # MUI dark theme + aeroColors
└── main.tsx                    # Entry point
```

## Routes

| Path | Component | Description |
|---|---|---|
| `/login` | LoginPage | Authentication |
| `/dashboard` | DashboardPage | Overview statistics |
| `/helicopters` | HelicopterListPage | Helicopter fleet management |
| `/crew` | CrewListPage | Crew member management |
| `/landing-sites` | LandingSiteListPage | Landing site management |
| `/users` | UserListPage | User account management |
| `/operations` | OperationListPage | Flight operations list |
| `/operations/new` | OperationFormPage | Create new operation |
| `/operations/:id` | OperationFormPage | Edit existing operation |
| `/orders` | OrderListPage | Flight orders list |
| `/orders/new` | OrderFormPage | Create new order |
| `/orders/:id` | OrderFormPage | Edit existing order |

## Key Features

### OperationFormPage
- Create and edit flight operations with full form validation
- KML file upload with immediate map preview and route length calculation
- Activity types multi-select (loaded from dictionary API)
- Contact emails chip-based input with email validation
- Comments section with chronological display and add form
- Role-aware status action buttons (Supervisor: Approve/Reject, Planner: Cancel)
- Field restrictions based on user role and operation status
- Change history panel (collapsible accordion)
- Linked orders display section

### OrderFormPage
- Create and edit flight orders with helicopter, crew, and site selectors
- Auto-filled pilot field from logged-in user
- Operations multi-select (CONFIRMED operations only)
- Auto-calculated crew weight and estimated route length
- MapView with departure/arrival markers and operation route polylines
- Live validation warnings (5 blocking rules):
  - Helicopter inspection expiry
  - Pilot license expiry
  - Crew training expiry
  - Crew weight limit
  - Route range limit
- Role-aware status buttons with full workflow support
- Actual departure/arrival date fields (APPROVED status)
- Role-based form visibility (PLANNER blocked, ADMIN read-only)

### Shared Components
- **MapView**: Reusable Leaflet map with polylines, colored markers, and auto-fit bounds
- **ConfirmDialog**: Reusable confirmation dialog for destructive actions
- **NotificationProvider**: Global toast notification system (success/error/warning)
- **useUnsavedChanges**: Form dirty-state tracking with navigation warning

### Error Handling
- Axios response interceptor maps HTTP errors to Polish-language toast notifications
- 400: Validation error message or "Nieprawidlowe dane"
- 401: "Sesja wygasla. Zaloguj sie ponownie."
- 403: "Brak uprawnien do wykonania tej operacji"
- 404: "Nie znaleziono zasobu"
- 500+: "Blad serwera. Sprobuj ponownie pozniej."

## Testing

Unit tests use Vitest with React Testing Library. Run with:

```bash
npm test          # single run
npm run test:watch  # watch mode
```

Test coverage includes:
- **notificationEmitter**: subscribe/emit/unsubscribe, multiple subscribers, idempotent subscribe
- **ConfirmDialog**: rendering, default/custom props, button callbacks, keyboard (Escape)
- **NotificationContext**: provider requirement, show methods, queuing, auto-dismiss, emitter integration
- **MapView**: rendering polylines/markers/popups, height/className props, empty state
- **OperationFormPage**: create/edit modes, form validation, status buttons, field restrictions, KML upload, comments, API errors
- **OrderFormPage**: create/edit modes, form validation, role-based access, validation warnings, status buttons, actual dates, API errors

## Authentication

Session-based via Spring Security (`JSESSIONID` cookie). Default test users:

| Email | Password | Role |
|---|---|---|
| `admin@aero.pl` | `admin` | ADMIN |
| `planista@aero.pl` | `planista` | PLANNER |
| `nadzor@aero.pl` | `nadzor` | SUPERVISOR |
| `pilot@aero.pl` | `pilot` | PILOT |
