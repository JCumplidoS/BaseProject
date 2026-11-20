COMPOSE_DEV  := docker compose -f docker-compose.dev.yml
COMPOSE_PROD := docker compose -f docker-compose.yml

.DEFAULT_GOAL := help
.PHONY: help dev dev-down dev-logs prod prod-down prod-logs build clean

help: ## Muestra esta ayuda
	@echo "Uso: make <objetivo>"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

dev: ## Inicia en modo desarrollo con hot reload (foreground)
	$(COMPOSE_DEV) up --build

dev-down: ## Detiene el entorno de desarrollo
	$(COMPOSE_DEV) down

dev-logs: ## Muestra logs del entorno de desarrollo
	$(COMPOSE_DEV) logs -f web

prod: ## Construye y levanta en produccion (detached)
	$(COMPOSE_PROD) up --build -d
	@echo "Produccion disponible en http://localhost:3000"

prod-down: ## Detiene el entorno de produccion
	$(COMPOSE_PROD) down

prod-logs: ## Muestra logs del entorno de produccion
	$(COMPOSE_PROD) logs -f web

build: ## Construye la imagen de produccion
	docker build -t nextjs-app:latest .

clean: ## Elimina contenedores, volumenes e imagen
	-$(COMPOSE_DEV) down -v
	-$(COMPOSE_PROD) down
	-docker rmi nextjs-app:latest nextjs-app:dev
