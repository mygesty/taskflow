# feat-001: User Registration and Login

## User Story

As a team collaborator, I want to register an account and securely log in, so that I can manage my tasks and workspaces on the platform.

## Acceptance Criteria

- [ ] User can register with email + password (≥8 chars, uppercase, lowercase, digit)
- [ ] Duplicate email returns 409 CONFLICT
- [ ] User can login and receives JWT tokens in httpOnly cookies
- [ ] Access token expires in 15min, refresh token in 7 days
- [ ] Token refresh is automatic and transparent to user
- [ ] Logout clears all token cookies
- [ ] Login rate limited: 5 requests per IP per minute
- [ ] Password stored with bcrypt (cost=12)

## Out of Scope

- OAuth/SSO login
- Email verification
- Password reset (future feature)
- Account deletion

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/auth/register | No | Register new user |
| POST | /api/v1/auth/login | No | Login, return tokens |
| POST | /api/v1/auth/refresh | Cookie | Refresh access token |
| POST | /api/v1/auth/logout | Cookie | Clear tokens |

## Backend Implementation

### Validators (`src/validators/auth.ts`)

- `registerSchema`: `{ email: z.string().email(), password: z.string().min(8).regex(/.../) , name: z.string().min(1).max(100) }`
- `loginSchema`: `{ email: z.string().email(), password: z.string().min(1) }`

### Repository (`src/repositories/user.ts`)

- `findByEmail(email: string): Promise<User | null>`
- `create(data: CreateUserData): Promise<User>`
- `findById(id: string): Promise<User | null>`

### Service (`src/services/auth.ts`)

- `register(data): Promise<{ user, accessToken, refreshToken }>` — check duplicate → hash password → create → sign tokens
- `login(data): Promise<{ user, accessToken, refreshToken }>` — find user → compare hash → sign tokens
- `refreshToken(token): Promise<{ accessToken }>` — verify refresh token → sign new access token
- `logout(userId): Promise<void>` — token cleanup

### Providers

- `src/providers/jwt.ts` — `signAccessToken(userId)`, `signRefreshToken(userId)`, `verifyToken(token)`

## BFF Implementation

### Routes (`src/routes/auth.ts`)

- `POST /api/bff/auth/register` → call Backend → strip passwordHash from response
- `POST /api/bff/auth/login` → call Backend → attach user basic info to response

### DTOs

- `request/register.dto.ts` — mirrors Backend register schema
- `response/login.dto.ts` — `{ user: { id, email, name, avatarUrl }, accessTokenExpiry }`

## Frontend Implementation

### Pages

- `app/(auth)/register/page.tsx` — registration form
- `app/(auth)/login/page.tsx` — login form

### Components

- `components/auth/RegisterForm.tsx`
- `components/auth/LoginForm.tsx`
- `components/auth/PasswordField.tsx` — with strength indicator

### Hooks

- `hooks/useAuth.ts` — TanStack Query mutation for login/register, manage auth state

### Stores

- `stores/auth-store.ts` — Zustand store for current user, isAuthenticated

## Test Cases

### Unit Tests

- AuthService.register: success, duplicate email throws CONFLICT
- AuthService.login: success, wrong password throws UNAUTHORIZED, user not found throws UNAUTHORIZED
- AuthService.refreshToken: valid refresh, expired refresh, invalid refresh
- RegisterValidator: valid input, missing email, short password, invalid email format
- LoginValidator: valid input, empty password

### Integration Tests

- POST /auth/register: creates user in DB, returns tokens, duplicate 409
- POST /auth/login: returns tokens in cookies, wrong password 401
- POST /auth/refresh: returns new access token, expired refresh 401
- POST /auth/logout: clears cookies

## Database

No new tables — uses existing `User` model in `packages/db/prisma/schema.prisma`.
