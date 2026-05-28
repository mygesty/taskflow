#!/usr/bin/env bash
set -euo pipefail

echo "=== TaskFlow 会话引导 ==="

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "[1/6] 检查 Node.js..."
if ! command -v node &>/dev/null; then
  echo "错误: 未找到 Node.js。请安装 Node 20+。"
  exit 1
fi
echo "  Node: $(node --version)"

echo "[2/6] 检查 pnpm..."
if ! command -v pnpm &>/dev/null; then
  echo "错误: 未找到 pnpm。请运行: npm install -g pnpm"
  exit 1
fi
echo "  pnpm: $(pnpm --version)"

echo "[3/6] 安装依赖..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

echo "[4/6] 检查环境配置..."
if [ ! -f .env ]; then
  echo "  从 .env.example 创建 .env..."
  cp .env.example .env
  echo "  警告: 请在运行前检查 .env 并更新配置值。"
fi

echo "[5/6] 检查基础设施 (Docker)..."
if command -v docker &>/dev/null; then
  if docker compose ps postgres 2>/dev/null | grep -q "running"; then
    echo "  PostgreSQL: 运行中"
  else
    echo "  启动 PostgreSQL 和 Redis..."
    docker compose up -d postgres redis minio 2>/dev/null || echo "  提示: 请手动运行 'docker compose up -d postgres redis minio'"
  fi
else
  echo "  警告: 未找到 Docker。请手动启动 PostgreSQL/Redis。"
fi

echo "[6/6] 运行 Prisma 迁移..."
if [ -f packages/db/prisma/schema.prisma ]; then
  cd packages/db
  pnpm prisma generate 2>/dev/null || echo "  提示: 请手动运行 'pnpm --filter db prisma generate'"
  cd "$ROOT_DIR"
fi

echo ""
echo "=== 引导完成 ==="
echo "运行 'pnpm dev' 启动所有服务。"
echo "阅读 claude-progress.txt 了解会话历史。"
echo "阅读 features.json 了解当前特性状态。"
