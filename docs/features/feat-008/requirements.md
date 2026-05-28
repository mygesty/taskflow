# feat-008: Data Dashboard

## User Story

As a team leader, I want to view task statistics for my workspace, so that I can understand team workload and project progress.

## Acceptance Criteria

- [ ] Task status counts: todo / in-progress / review / done with percentages
- [ ] Member workload table: each member's assigned + completed task counts
- [ ] Burndown chart: ideal line (linear) + actual line (daily remaining)
- [ ] Priority distribution: count per priority level
- [ ] Time range selector: 7d / 14d / 30d
- [ ] Empty state when no tasks exist
- [ ] Data cached for 5 minutes (Redis TTL)
- [ ] Stats scoped to current workspace only

## Out of Scope

- Custom chart configuration
- Export to CSV/PDF
- Comparison between workspaces
- Forecasting / predictive analytics
- Real-time chart updates (refresh on page load)

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/dashboard/stats?workspaceId=&range=7d | JWT | Dashboard statistics |

### Response Shape

```typescript
{
  taskStatusCounts: { todo: number; inProgress: number; review: number; done: number };
  memberWorkloads: Array<{
    userId: string; name: string; avatarUrl: string | null;
    taskCount: number; completedCount: number;
  }>;
  burndown: {
    ideal: Array<{ date: string; remaining: number }>;
    actual: Array<{ date: string; remaining: number }>;
  };
  priorityDistribution: { LOW: number; MEDIUM: number; HIGH: number; URGENT: number };
}
```

## BFF Aggregation

```
GET /api/bff/dashboard/stats?workspaceId=&range=
  → apiClient.getDashboardStats(workspaceId, range)
  → enrich: attach member avatars to memberWorkloads
  → return DashboardStatsDTO
```

## Frontend

- Chart library: recharts (lightweight, React-native)
- Page: `app/(dashboard)/workspaces/[id]/dashboard/page.tsx`
- Components: `components/dashboard/StatusCards.tsx`, `BurndownChart.tsx`, `MemberWorkload.tsx`, `PriorityPie.tsx`

## Depends On

- feat-004 (task data)
- feat-007 (notification counts, optional)
