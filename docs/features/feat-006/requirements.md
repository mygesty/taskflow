# feat-006: Task Comments with @Mention

## User Story

As a team member, I want to post comments on tasks and @mention colleagues, so that I can discuss work items in context.

## Acceptance Criteria

- [ ] Post comment on any task (content required, ≤2000 chars)
- [ ] Comment list displayed in chronological order (ascending)
- [ ] Each comment shows: author avatar, name, content, timestamp
- [ ] Typing @ triggers workspace member dropdown
- [ ] Select member inserts @Name into text
- [ ] @mentioned members receive COMMENT_MENTION notification
- [ ] Only comment author can delete their own comment
- [ ] Max 10 mentions per comment
- [ ] Mention parsing limited to current workspace members

## Out of Scope

- Rich text / Markdown in comments
- Image/file attachments in comments
- Reactions / emoji on comments
- Thread/nested replies
- Edit comments (future: 5-min window)

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/tasks/:id/comments | JWT | List comments |
| POST | /api/v1/tasks/:id/comments | JWT | Post comment |
| DELETE | /api/v1/tasks/:id/comments/:cid | JWT | Delete comment |

### Comment Response Shape

```typescript
{
  id: string;
  taskId: string;
  author: { id: string; name: string; avatarUrl: string | null };
  content: string;
  mentions: Array<{ userId: string; name: string }>;
  createdAt: string;
}
```

## BFF Aggregation

```
POST /api/bff/tasks/:id/comments
  → apiClient.createComment(taskId, content)
  → parseMentions(content, workspaceMembers) → apiClient.createNotification(...) per mention
  → transformCommentResponse(result)
```

## Depends On

- feat-004 (tasks)
- feat-002 (workspace members for @mention)
