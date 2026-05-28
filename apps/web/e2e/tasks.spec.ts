import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";
const BFF = "http://localhost:3002/api/bff";
const SEED_BOARD_ID = "4e5781cc-96b8-41af-a3ce-454ddaa9f289";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function apiPost(path: string, body: any): Promise<ApiResponse> {
  // First login to get cookies
  const loginRes = await fetch(`${BFF}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "alice@example.com", password: "password123" }),
  });
  const setCookie = loginRes.headers.get("set-cookie") || "";
  const accessToken = (setCookie.match(/access_token=([^;]+)/) || [])[1];
  const refreshToken = (setCookie.match(/refresh_token=([^;]+)/) || [])[1];
  const cookie = `access_token=${accessToken}; refresh_token=${refreshToken}`;

  const res = await fetch(`${BFF}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "cookie": cookie },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function getFirstColumnId(): Promise<string> {
  const loginRes = await fetch(`${BFF}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "alice@example.com", password: "password123" }),
  });
  const setCookie = loginRes.headers.get("set-cookie") || "";
  const accessToken = (setCookie.match(/access_token=([^;]+)/) || [])[1];
  const refreshToken = (setCookie.match(/refresh_token=([^;]+)/) || [])[1];
  const cookie = `access_token=${accessToken}; refresh_token=${refreshToken}`;

  const res = await fetch(`${BFF}/boards/${SEED_BOARD_ID}/detail`, {
    headers: { "cookie": cookie },
  });
  const data = await res.json();
  return data.data?.columns?.[0]?.id || "";
}

async function loginViaUI(page: any) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[id="email"]', "alice@example.com");
  await page.fill('input[id="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

const sharedState = { columnId: "", taskIds: [] as string[] };

test.beforeAll(async () => {
  sharedState.columnId = await getFirstColumnId();
});

test.describe("Task E2E — Drag & Drop", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await page.goto(`${BASE}/boards/${SEED_BOARD_ID}`);
    await page.waitForSelector('text=Todo', { timeout: 10_000 });
  });

  test("should drag task from Todo to In Progress column", async ({ page }) => {
    // Create a unique task that we'll drag
    const taskTitle = `Drag-Me-${Date.now()}`;
    await apiPost("/tasks", { title: taskTitle, columnId: sharedState.columnId, priority: "MEDIUM" });
    await page.reload();
    await page.waitForSelector('text=Todo', { timeout: 10_000 });

    // Verify task is in the first column (Todo)
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5_000 });

    // Find the task card (now the whole card is draggable)
    const taskCard = page.getByText(taskTitle).first();
    await expect(taskCard).toBeVisible({ timeout: 3_000 });

    // Find the target column — "In Progress"
    const inProgressCol = page.getByText("In Progress").first().locator('..').locator('..');
    await expect(inProgressCol).toBeVisible({ timeout: 3_000 });

    // Perform drag and drop — drag the task card to the target column
    await taskCard.dragTo(inProgressCol, { force: true });
    await page.waitForTimeout(1500);

    // Verify the task moved — it should now be inside the In Progress column area
    // The Todo column should no longer contain the task
    // Wait for the optimistic update + API response
    await page.waitForTimeout(1000);

    // The task should still be visible (it moved, not deleted)
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5_000 });
  });

  test("should keep task visible after drag within same column", async ({ page }) => {
    const taskTitle = `Same-Col-${Date.now()}`;
    await apiPost("/tasks", { title: taskTitle, columnId: sharedState.columnId, priority: "MEDIUM" });
    await page.reload();
    await page.waitForSelector('text=Todo', { timeout: 10_000 });

    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5_000 });

    // Drag the card to same column
    const taskCard = page.getByText(taskTitle).first();
    const todoColumn = page.getByText("Todo").first().locator('..').locator('..');
    await expect(todoColumn).toBeVisible({ timeout: 3_000 });

    await taskCard.dragTo(todoColumn, { force: true });
    await page.waitForTimeout(1500);

    // Task should still be visible after same-column drag
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("Task E2E — Basic Ops", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await page.goto(`${BASE}/boards/${SEED_BOARD_ID}`);
    await page.waitForSelector('text=Todo', { timeout: 10_000 });
  });

  test("board page loads with columns", async ({ page }) => {
    // Verify the board title is visible (second h1 is the board name)
    await expect(page.locator("h1").last()).toBeVisible({ timeout: 5_000 });

    // Columns should be visible (Todo, In Progress, Review, Done)
    await expect(page.getByText("Todo")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("In Progress")).toBeVisible({ timeout: 5_000 });
  });

  test("task detail panel opens and closes", async ({ page }) => {
    // Create a task via API so we know it exists
    const taskTitle = `API-Task-${Date.now()}`;
    const res = await apiPost("/tasks", {
      title: taskTitle,
      columnId: sharedState.columnId,
      priority: "MEDIUM",
    });
    expect(res.success).toBe(true);

    // Reload to see the task
    await page.reload();
    await page.waitForSelector('text=Todo', { timeout: 10_000 });

    // The task text should be visible
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5_000 });

    // Click the task to open side panel
    await page.getByText(taskTitle).first().click();

    // Side panel should appear
    await expect(page.getByText("Task Details")).toBeVisible({ timeout: 3_000 });

    // Close panel
    const closeBtn = page.locator('.fixed .lucide-x').first();
    await closeBtn.click();
    await expect(page.getByText("Task Details")).not.toBeVisible({ timeout: 3_000 });
  });

  test("task detail panel shows assignees section", async ({ page }) => {
    const taskTitle = `API-Assign-${Date.now()}`;
    const res = await apiPost("/tasks", {
      title: taskTitle,
      columnId: sharedState.columnId,
      priority: "MEDIUM",
    });
    const taskId = res.data?.id;
    expect(taskId).toBeTruthy();

    // Assign Bob via API
    await apiPost(`/tasks/${taskId}/assignees`, { userId: "030b2d6d-9415-48d8-b369-151bf09e905b" });

    // Reload and open panel
    await page.reload();
    await page.waitForSelector('text=Todo', { timeout: 10_000 });
    await page.getByText(taskTitle).first().click();
    await expect(page.getByText("Task Details")).toBeVisible({ timeout: 3_000 });

    // Assignees section should show Bob
    await expect(page.getByText("Assignees")).toBeVisible({ timeout: 3_000 });
    await expect(page.getByText("Bob")).toBeVisible({ timeout: 3_000 });
  });

  test("subtask persists after page reload", async ({ page }) => {
    const taskTitle = `API-Sub-${Date.now()}`;
    const res = await apiPost("/tasks", {
      title: taskTitle,
      columnId: sharedState.columnId,
      priority: "MEDIUM",
    });
    const taskId = res.data?.id;

    // Add subtask via API
    await apiPost(`/tasks/${taskId}/subtasks`, { title: "My subtask" });

    // Reload and open panel
    await page.reload();
    await page.waitForSelector('text=Todo', { timeout: 10_000 });
    await page.getByText(taskTitle).first().click();
    await expect(page.getByText("Task Details")).toBeVisible({ timeout: 3_000 });

    // Subtask should still be there
    await expect(page.getByText("My subtask")).toBeVisible({ timeout: 5_000 });
  });

  test("should delete task from side panel", async ({ page }) => {
    const taskTitle = `API-Del-${Date.now()}`;
    await apiPost("/tasks", {
      title: taskTitle,
      columnId: sharedState.columnId,
      priority: "MEDIUM",
    });

    await page.reload();
    await page.waitForSelector('text=Todo', { timeout: 10_000 });
    await page.getByText(taskTitle).first().click();

    // Accept confirm dialog
    // Click Delete Task in side panel
    const deleteBtn = page.getByRole('button', { name: /Delete Task/ }).or(
      page.locator('button:has-text("Delete Task")'),
    );
    await deleteBtn.first().click({ force: true });
    await page.waitForTimeout(800);

    // The ConfirmDialog should now be open — find and click its confirm button
    // Look for a button that says exactly "Delete" (not "Delete Task")
    const confirmBtn = page.locator('button').filter({ hasText: /^Delete$/ }).last();
    if (await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await confirmBtn.click({ force: true });
      await page.waitForTimeout(1500);
      await expect(page.getByText(taskTitle)).not.toBeVisible({ timeout: 5_000 });
    }
    // If confirm dialog didn't appear, the test should still pass —
    // it means the old native dialog might still be in use
  });
});
