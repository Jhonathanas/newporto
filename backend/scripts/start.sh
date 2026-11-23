#!/bin/sh
set -eu

echo "[startup] menjalankan migrasi database..."
/app/migrate up

echo "[startup] mengisi data awal (aman dijalankan ulang)..."
/app/seed

echo "[startup] menyalakan API..."
exec /app/api
