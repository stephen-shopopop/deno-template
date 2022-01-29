# Go parameters
DENO=deno
DENOBUILD=$(DENO) compile
DENOBUNDLE=${DENO} bundle
DENORUN=$(DENO) run
DENOTEST=$(DENO) test
DENODOC=$(DENO) doc
DENOLINT=$(DENO) lint
DENOFMT=$(DENO) fmt
AUTHOR=stephendltg
DENOVERSION=1.18.1

all: pre-install

pre-install: 
	@echo "Installing project..."
	deno upgrade --version ${DENOVERSION}

dev:
	$(DENORUN) -Ar --watch mod.ts

lint:
	$(DENOLINT) mod.ts

fmt:
	${DENOFMT} mod.ts

bundle:
	${DENOBUNDLE} mod.ts module.bundle.js


help:
	@echo "make: prepare project"
