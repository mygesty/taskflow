# feat-005: Drag Task Between Columns

## User Story

As a team member, I want to drag tasks between columns, so that I can intuitively update task status.

## Acceptance Criteria

- [ ] Drag task within same column to reorder
- [ ] Drag task across columns to move
- [ ] Optimistic update: UI updates immediately, rolls back on failure
- [ ] Position values recalculated after drop
- [ ] Refresh preserves new position
- [ ] Move triggers TASK_MOVED notification to assignees
- [ ] Debounce: same task cannot be moved within 1 second
- [ ] Drag limited to same board (no cross-board)

## Out of Scope

- Multi-select drag (drag multiple tasks at once)
- Touch/gesture drag on mobile
- Undo drag action
- Drag between boards

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | /api/v1/tasks/:id/move | JWT | Move task to new column/position |

Request:
```json
{
  "targetColumnId": "uuid",
  "position": 2
}
```

## Technical Implementation

### Frontend (dnd-kit)

1. Each column is a `DroppableContext`
2. Each task card is a `SortableItem`
3. `onDragEnd` handler:
   - Compute target column and position
   - Update Zustand store optimistically
   - Call BFF `PATCH /api/bff/tasks/:id/move`
   - On failure: invalidate TanStack Query → server state wins

### BFF Aggregation

```
PATCH /api/bff/tasks/:id/move
  → apiClient.moveTask(taskId, targetColumnId, position)
  → apiClient.createNotification(TASK_MOVED, assignees)
  → transformMoveResponse(result)
```

## Depends On

- feat-004 (tasks, columns)
