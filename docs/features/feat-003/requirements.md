# feat-003: Board Management

## User Story

As a team member, I want to manage boards within a workspace, so that I can visually track task flow through columns.

## Acceptance Criteria

- [ ] User can create board with title (required, ≤200 chars) and description (optional)
- [ ] New board auto-creates 4 default columns: Todo, In Progress, Review, Done
- [ ] User can add custom columns
- [ ] User can rename columns
- [ ] User can delete columns (tasks migrate to left adjacent column)
- [ ] User can reorder columns by drag
- [ ] Board must retain at least 1 column
- [ ] Edit board title and description
- [ ] Delete board with confirmation (cascades to columns + tasks)
- [ ] Columns displayed left-to-right by position value

## Out of Scope

- Board templates
- Board archiving
- Cross-workspace board copying
- Board permissions (inherits workspace roles)

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/boards?workspaceId= | JWT | List boards |
| POST | /api/v1/boards | JWT | Create board + default columns |
| GET | /api/v1/boards/:id | JWT | Board detail |
| PATCH | /api/v1/boards/:id | JWT | Update board |
| DELETE | /api/v1/boards/:id | JWT | Delete board |
| GET | /api/v1/boards/:id/columns | JWT | List columns |
| POST | /api/v1/boards/:id/columns | JWT | Add column |
| PATCH | /api/v1/boards/:id/columns/:cid | JWT | Update column |
| DELETE | /api/v1/boards/:id/columns/:cid | JWT | Delete column |
| PATCH | /api/v1/boards/:id/columns/reorder | JWT | Reorder columns |

## Depends On

- feat-001 (auth)
- feat-002 (workspace, membership check)
