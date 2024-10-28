#!make
NAME       ?= $(shell basename $(CURDIR))
VERSION		 ?= $(shell cat $(PWD)/.version 2> /dev/null || echo v0)

# Deno commands
DENO    = deno
RUN     = $(DENO) run
TEST    = $(DENO) test
FMT     = $(DENO) fmt
LINT    = $(DENO) lint
BUILD   = $(DENO) compile
DEPS    = $(DENO) info
DOCS    = $(DENO) doc main.ts --json
INSPECT = $(DENO) run --inspect-brk

DENOVERSION = 2.0.3

default: help

.PHONY: help
help: ## Show this help
	@echo 'Usage: make [target] ...'
	@echo ''
	@echo 'targets:'
	@egrep -h '^[a-zA-Z0-9_\/-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort -d | awk 'BEGIN {FS = ":.*?## "; printf "Usage: make \033[0;34mTARGET\033[0m \033[0;35m[ARGUMENTS]\033[0m\n\n"; printf "Targets:\n"}; {printf "  \033[33m%-25s\033[0m \033[0;32m%s\033[0m\n", $$1, $$2}'

.PHONY: env
env: ## environment project
	@echo $(CURDIR)
	@echo $(NAME)
	@echo $(VERSION)

.PHONY: deno-install
deno-install: ## install deno version and dependencies
	@$(DENO) upgrade --version $(DENOVERSION)

.PHONY: deno-version
deno-version: ## deno version
	@$(DENO) --version

.PHONY: deno-upgrade
deno-upgrade: ## deno upgrade
	@$(DENO) upgrade

.PHONY: check
check: ## deno check files
	@$(DEPS)
	@$(FMT) --check
	@$(LINT) --unstable

.PHONY: fmt
fmt: ## deno format files
	@$(FMT)

.PHONY: dev
dev: ## deno run dev mode
	@$(RUN) --allow-all --unstable --watch main.ts 

.PHONY: test
test: ## deno run test
	@$(TEST) --doc --parallel  --coverage && deno coverage

.PHONY: install
install:
	@$(DENO) jupyter --unstable --install
	@$(DENO) install

.PHONY:clean
clean: ## clean binary
	rm -fr bin

.PHONY: build
build: ## deno build binary
	rm -f bin/*
	$(BUILD) --output=bin/${NAME} -A --unstable main.ts
	$(BUILD) --output=bin/${NAME}.exe --target=x86_64-pc-windows-msvc -A --unstable main.ts
	$(BUILD) --output=bin/${NAME}_x86_64 --target=x86_64-unknown-linux-gnu -A --unstable main.ts
	$(BUILD) --output=bin/${NAME}_darwin_x86_64 --target=x86_64-apple-darwin -A --unstable main.ts
	$(BUILD) --output=bin/${NAME}_darwin_aarch64 --target=x86_64-apple-darwin -A --unstable main.ts

.PHONY: inspect
inspect: ## deno inspect 
	@echo "Open chrome & chrome://inspect"
	$(INSPECT) --allow-all --unstable main.ts

.PHONY: release
release:
	git tag $(VERSION)
	git push --tags
