#############################
# middleware
#############################
.PHONY: middleware.up
middleware.up:
	@docker compose -f docker/docker-compose.yaml --env-file .env up -d

.PHONY: middleware.down
middleware.down:
	@docker compose -f docker/docker-compose.yaml --env-file .env down

.PHONY: middleware.restart
middleware.restart: middleware.down middleware.up 

.PHONY: middleware.psql
middleware.psql:
	PGPASSWORD=pgpass psql -h postgres.rrs.local -p 5432 -U rrs -d rrs-local
