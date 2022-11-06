#!make
NAME       ?= $(shell basename $(CURDIR))
VERSION		 ?= $(shell cat $(PWD)/.version 2> /dev/null || echo v0)

# Deno commands
DENO    = deno
BUNDLE  = $(DENO) bundle
RUN     = $(DENO) run
TEST    = $(DENO) test
FMT     = $(DENO) fmt
LINT    = $(DENO) lint
BUILD   = $(DENO) compile
DEPS    = $(DENO) info
DOCS    = $(DENO) doc mod.ts --json
INSPECT = $(DENO) run --inspect-brk

DENOVERSION = 1.27.0

.PHONY: help clean deno-install install deno-version deno-upgrade check fmt dev env test bundle build inspect doc all release

default: help

# show this help
help:
	@echo 'usage: make [target] ...'
	@echo ''
	@echo 'targets:'
	@grep -E '^[a-z.A-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

env: ## environment project
	@echo $(CURDIR)
	@echo $(NAME)
	@echo $(VERSION)

deno-install: ## install deno version and dependencies
	$(DENO) upgrade --version $(DENOVERSION)

deno-version: ## deno version
	$(DENO) --version

deno-upgrade: ## deno upgrade
	$(DENO) upgrade

check: ## deno check files
	$(DEPS)
	$(FMT) --check
	$(LINT) --unstable

fmt: ## deno format files
	$(FMT)

dev: ## deno run dev mode
	$(RUN) --allow-all --unstable --watch mod.ts 

test: ## deno run test
	$(TEST) --coverage=cov_profile

install:
	$(DENO) install .

bundle: ## deno build bundle
	$(BUNDLE) mod.ts module.bundle.js
	
clean: ## clean bundle and binary
	rm -f module.bundle.js
	rm -fr bin

build: ## deno build binary
	rm -f bin/*
	$(BUILD) --output=bin/${NAME} -A --unstable mod.ts
	$(BUILD) --output=bin/${NAME}.exe --target=x86_64-pc-windows-msvc -A --unstable mod.ts
	$(BUILD) --output=bin/${NAME}_x86_64 --target=x86_64-unknown-linux-gnu -A --unstable mod.ts
	$(BUILD) --output=bin/${NAME}_darwin_x86_64 --target=x86_64-apple-darwin -A --unstable mod.ts
	$(BUILD) --output=bin/${NAME}_darwin_aarch64 --target=x86_64-apple-darwin -A --unstable mod.ts

inspect: ## deno inspect 
	@echo "Open chrome & chrome://inspect"
	$(INSPECT) --allow-all --unstable mod.ts

doc: ## deno doc
	$(DOCS) > docs.json
  
release:
	git tag $(VERSION)
	git push --tags
