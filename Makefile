SHELL := /usr/bin/env bash

.PHONY: help install-hooks dev build test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push hooks-post-merge hooks-post-checkout

help:
	@printf "WorldVoice targets\n"
	@printf "  make install-hooks     Wire local git hooks\n"
	@printf "  make dev               Run the Vite dev server\n"
	@printf "  make build             Build the Pages-ready docs/ site\n"
	@printf "  make test              Run unit tests\n"
	@printf "  make test-integration  Run Playwright tests against an existing preview\n"
	@printf "  make smoke             Build, serve docs/, and run Playwright smoke\n"
	@printf "  make lint              Run linters and audit\n"
	@printf "  make fmt               Format source files\n"
	@printf "  make pages-preview     Serve the built Pages site\n"
	@printf "  make release           Tag the current commit\n"
	@printf "  make clean             Remove generated output\n"

install-hooks:
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev:
	npm run dev

build:
	npm run build
	test -s docs/index.html
	test -s docs/404.html

test:
	npm run test

test-integration:
	npx playwright test

smoke:
	bash scripts/smoke.sh

lint:
	npm run lint
	npm run typecheck
	npm run format:check
	npm audit --audit-level=high

fmt:
	npm run format

pages-preview:
	npm run pages-preview

release:
	@test -n "$(VERSION)" || (echo "Usage: make release VERSION=v0.1.0" && exit 1)
	git tag "$(VERSION)"

clean:
	npm run clean:pages

hooks-pre-commit:
	npm run lint
	npm run typecheck
	npm run format:check
	gitleaks protect --staged --redact

hooks-commit-msg:
	@test -n "$(COMMIT_MSG_FILE)" || (echo "Missing COMMIT_MSG_FILE" && exit 1)
	@grep -Eq '^(feat|fix|docs|chore|refactor|test|ops|data|security)(\([a-z0-9-]+\))?: .+' "$(COMMIT_MSG_FILE)" || \
		(echo "Commit message must use Conventional Commits" && exit 1)

hooks-pre-push:
	$(MAKE) test
	$(MAKE) build
	$(MAKE) smoke

hooks-post-merge:
	npm install

hooks-post-checkout:
	@printf "WorldVoice checkout ready. Run make build when publishing docs/.\n"
