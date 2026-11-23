package main

import (
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	"portfolio/backend/internal/config"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("pemakaian: go run ./cmd/migrate [up|down|version|force <versi>]")
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	migrationsDir := os.Getenv("MIGRATIONS_DIR")
	if migrationsDir == "" {
		migrationsDir = "migrations"
	}

	m, err := migrate.New("file://"+migrationsDir, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("inisialisasi migrasi: %v", err)
	}
	defer func() {
		sourceErr, databaseErr := m.Close()
		if sourceErr != nil {
			log.Printf("tutup source migrasi: %v", sourceErr)
		}
		if databaseErr != nil {
			log.Printf("tutup database migrasi: %v", databaseErr)
		}
	}()

	switch os.Args[1] {
	case "up":
		err = m.Up()
	case "down":
		err = m.Steps(-1)
	case "version":
		version, dirty, versionErr := m.Version()
		if errors.Is(versionErr, migrate.ErrNilVersion) {
			fmt.Println("versi: belum ada migrasi")
			return
		}
		if versionErr != nil {
			log.Fatalf("baca versi: %v", versionErr)
		}
		fmt.Printf("versi: %d (dirty: %t)\n", version, dirty)
		return
	case "force":
		if len(os.Args) < 3 {
			log.Fatal("pemakaian: go run ./cmd/migrate force <versi>")
		}
		version := 0
		if _, err := fmt.Sscanf(os.Args[2], "%d", &version); err != nil {
			log.Fatalf("versi tidak valid: %v", err)
		}
		err = m.Force(version)
	default:
		log.Fatalf("perintah tidak dikenal: %s", os.Args[1])
	}

	if errors.Is(err, migrate.ErrNoChange) {
		fmt.Println("tidak ada perubahan migrasi")
		return
	}
	if err != nil {
		log.Fatalf("eksekusi migrasi: %v", err)
	}
	fmt.Println("migrasi selesai")
}
