# ---- build ----
FROM golang:1.26-alpine AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY cmd ./cmd
COPY internal ./internal

ENV CGO_ENABLED=0
RUN go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api \
 && go build -trimpath -ldflags="-s -w" -o /out/migrate ./cmd/migrate \
 && go build -trimpath -ldflags="-s -w" -o /out/seed ./cmd/seed

# ---- runtime ----
FROM alpine:3.22

RUN apk add --no-cache ca-certificates tzdata \
 && addgroup -S app && adduser -S -G app app \
 && mkdir -p /app/uploads

WORKDIR /app

COPY --from=build /out/api /app/api
COPY --from=build /out/migrate /app/migrate
COPY --from=build /out/seed /app/seed
COPY migrations ./migrations
COPY seed ./seed-data
COPY scripts/start.sh ./scripts/start.sh

RUN chmod +x /app/api /app/migrate /app/seed /app/scripts/start.sh \
 && chown -R app:app /app

ENV APP_ENV=production \
    PORT=8080 \
    UPLOAD_DIR=/app/uploads \
    MIGRATIONS_DIR=/app/migrations \
    SEED_DIR=/app/seed-data

EXPOSE 8080

USER app

CMD ["/app/scripts/start.sh"]
