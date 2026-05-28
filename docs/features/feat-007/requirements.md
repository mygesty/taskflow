# feat-007: Notification System

## User Story

As a team member, I want to receive task-related notifications, so that I stay informed about work updates.

## Acceptance Criteria

- [ ] Bell icon in top navigation with unread count badge
- [ ] Click bell opens dropdown with latest 20 notifications
- [ ] Click single notification marks as read and navigates to related task
- [ ] "Mark all as read" button
- [ ] Dedicated /notifications page with paginated list
- [ ] Unread count badge caps at 99+
- [ ] Read notifications auto-deleted after 30 days
- [ ] No self-notification (action performer not notified)

## Notification Types

| Type | Trigger | Template |
|------|---------|----------|
| TASK_ASSIGNED | Member assigned to task | "{assigner} assigned you task 「{task}」" |
| TASK_MOVED | Assigned task moved to new column | "Task 「{task}」 moved to {column}" |
| TASK_DUE_SOON | 24h before due date | "Task 「{task}」 due in 24 hours" |
| COMMENT_MENTION | @mentioned in comment | "{author} mentioned you in 「{task}」" |
| MEMBER_INVITED | Invited to workspace | "{inviter} invited you to workspace 「{workspace}」" |

## Out of Scope

- Push notifications (browser/mobile)
- Email notifications
- Real-time / WebSocket notifications (polling for MVP)
- Notification preferences / mute settings
- Notification sound

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/notifications | JWT | List notifications (paginated) |
| GET | /api/v1/notifications/unread-count | JWT | Unread count |
| PATCH | /api/v1/notifications/:id/read | JWT | Mark as read |
| POST | /api/v1/notifications/read-all | JWT | Mark all as read |

## BFF Aggregation

```
GET /api/bff/me/notifications
  → apiClient.getNotifications()
  → apiClient.getRelatedTasks(notification.taskIds)
  → merge: attach task title + trigger user info to each notification
  → return NotificationListDTO
```

## Frontend

- Poll unread count every 30s via TanStack Query
- Notification dropdown: `components/notification/NotificationDropdown.tsx`
- Notification page: `app/(dashboard)/notifications/page.tsx`

## Depends On

- feat-004 (task notifications)
- feat-006 (comment mention notifications)
