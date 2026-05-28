# feat-002: Workspace Management

## User Story

As a team leader, I want to create workspaces and invite members, so that my team can collaborate in a unified space.

## Acceptance Criteria

- [ ] User can create workspace with name (required, ≤100 chars) and description (optional)
- [ ] Creator automatically becomes OWNER
- [ ] Owner/Admin can invite members by email
- [ ] Owner can modify member roles (Admin ↔ Member)
- [ ] Owner/Admin can remove members
- [ ] Members can leave workspace
- [ ] Only Owner can delete workspace (with confirmation)
- [ ] Workspace list shown in sidebar, sorted by recent use
- [ ] Max 50 members per workspace
- [ ] Member trying to invite returns 403

## Out of Scope

- Email invitation with link (direct add only)
- Workspace transfer ownership
- Workspace settings page (name, description editing)
- Activity log

## API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/workspaces | JWT | Any | List user's workspaces |
| POST | /api/v1/workspaces | JWT | Any | Create workspace |
| GET | /api/v1/workspaces/:id | JWT | Member+ | Workspace detail |
| PATCH | /api/v1/workspaces/:id | JWT | Admin+ | Update workspace |
| DELETE | /api/v1/workspaces/:id | JWT | Owner | Delete workspace |
| GET | /api/v1/workspaces/:id/members | JWT | Member+ | Member list |
| POST | /api/v1/workspaces/:id/members | JWT | Admin+ | Invite member |
| PATCH | /api/v1/workspaces/:id/members/:mid | JWT | Owner | Change role |
| DELETE | /api/v1/workspaces/:id/members/:mid | JWT | Admin+ | Remove member |

## Depends On

- feat-001 (authentication, JWT middleware)
