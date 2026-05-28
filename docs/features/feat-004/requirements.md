# feat-004: Task Management

## User Story

As a team member, I want to create and manage tasks, so that I can record and track specific work items.

## Acceptance Criteria

- [ ] Create task in a column: title (required, ≤300 chars), description, priority, due date
- [ ] Edit task: title, description, priority, due date
- [ ] Delete task with confirmation (cascades sub-tasks, comments, label links)
- [ ] Assign 1+ members to task
- [ ] Remove assignee from task
- [ ] Priority: LOW/MEDIUM/HIGH/URGENT, default MEDIUM
- [ ] Due date: optional, triggers TASK_DUE_SOON notification 24h before
- [ ] Sub-tasks: add/check/uncheck/delete under a task
- [ ] Labels: attach workspace labels to task
- [ ] New task appears at bottom of column (position = max + 1)
- [ ] Priority shown with color on card (URGENT=red, HIGH=orange, MEDIUM=default, LOW=gray)
- [ ] Task detail side panel with all editable fields

## Out of Scope

- Markdown rendering in description (plain text for MVP)
- Task attachments / file upload
- Task watchers / followers
- Task dependencies (blocking/blocked-by)
- Recurring tasks

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/tasks?boardId=&columnId= | JWT | List tasks |
| POST | /api/v1/tasks | JWT | Create task |
| GET | /api/v1/tasks/:id | JWT | Task detail |
| PATCH | /api/v1/tasks/:id | JWT | Update task |
| DELETE | /api/v1/tasks/:id | JWT | Delete task |
| POST | /api/v1/tasks/:id/assignees | JWT | Assign member |
| DELETE | /api/v1/tasks/:id/assignees/:uid | JWT | Remove assignee |
| GET | /api/v1/tasks/:id/subtasks | JWT | List sub-tasks |
| POST | /api/v1/tasks/:id/subtasks | JWT | Add sub-task |
| PATCH | /api/v1/tasks/:id/subtasks/:sid | JWT | Update sub-task |
| DELETE | /api/v1/tasks/:id/subtasks/:sid | JWT | Delete sub-task |
| GET | /api/v1/labels?workspaceId= | JWT | List labels |
| POST | /api/v1/labels | JWT | Create label |
| POST | /api/v1/tasks/:id/labels | JWT | Attach label |
| DELETE | /api/v1/tasks/:id/labels/:lid | JWT | Remove label |

## Depends On

- feat-001 (auth)
- feat-002 (workspace membership)
- feat-003 (board + columns)
