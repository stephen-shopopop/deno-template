#!make
NAME=myapp
VERSION=0.0.1
DESCRIPTION=Deno template
AUTHOR=stephendltg
# Deno parameters
DENO=deno
BUNDLE=$(DENO) bundle
RUN=$(DENO) run
TEST=$(DENO) test
FMT=$(DENO) fmt
LINT=$(DENO) lint
BUILD=${DENO} compile
DEPS=${DENO} info
DOCS=${DENO} doc mod.ts --json
INSPECT=${DENO} run --inspect-brk
DENOVERSION=1.21.1

all: help

install: 
	@echo "Installing project..."
	$(DENO) upgrade --version ${DENOVERSION}
	$(DENO) install

version:
	@echo "Version Deno ..."
	$(DENO) --version

upgrade:
	@echo "Update Deno ..."
	$(DENO) upgrade

check:
	@echo "Deno check ..."
	${DEPS}
	${FMT} --check
	${LINT} --unstable

fmt: 
	@echo "Deno format ..."
	${FMT}

dev:
	@echo "Deno dev ..."
	$(RUN) --allow-all --unstable --watch mod.ts 

test:
	@echo "Deno test ..."
	$(TEST) --coverage=cov_profile

bundle:
	@echo "Deno bundle ..."
	$(BUNDLE) mod.ts module.bundle.js
	
clean:
	@echo "Deno clean ..."
	rm -f module.bundle.js
	rm -f bin/*

compile:
	@echo "Deno Compile ..."
	rm -f bin/*
	$(BUILD) --output=bin/${NAME} -A --unstable mod.ts
# $(BUILD) --output=bin/${NAME}.exe --target=x86_64-pc-windows-msvc -A --unstable mod.ts
# $(BUILD) --output=bin/${NAME}_x86_64 --target=x86_64-unknown-linux-gnu -A --unstable mod.ts
# $(BUILD) --output=bin/${NAME}_darwin_x86_64 --target=x86_64-apple-darwin -A --unstable mod.ts
# $(BUILD) --output=bin/${NAME}_darwin_aarch64 --target=x86_64-apple-darwin -A --unstable mod.ts

inspect:
	@echo "Deno inspect ..."
	@echo "Open chrome & chrome://inspect"
	${INSPECT} --allow-all --unstable mod.ts

doc:
	@echo "Deno Doc ..."
	$(DOCS) > docs.json

help:
	@echo "==============================="
	@echo "Version: $(NAME)"
	@echo "Version: $(VERSION)"
	@echo "Description: $(DESCRIPTION)"
	@echo "Author: $(AUTHOR)"
	@echo "Deno: ${DENOVERSION}"
	@echo "==============================="
	$(DEPS)
	@echo "==============================="
