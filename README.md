[![Minimal deno version](https://img.shields.io/static/v1?label=deno&message=%3E=2.1.2&color)](https://docs.deno.com/runtime/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/stephen-shopopop/deno-template/graphs/commit-activity)
[![Deno](https://github.com/stephen-shopopop/deno-template/actions/workflows/deno.yml/badge.svg)](https://github.com/stephen-shopopop/deno-template/actions/workflows/deno.yml)
[![Changelog](https://github.com/stephen-shopopop/deno-template/actions/workflows/release.yml/badge.svg)](https://github.com/stephen-shopopop/deno-template/actions/workflows/release.yml)

# Deno template

[Installation deno](https://deno.land/#installation)

- [Documentation](https://doc.deno.land/https://raw.githubusercontent.com/stephen-shopopop/deno-template/main/main.ts)

## Usage

```bash
deno run --allow-env --allow-run mod.ts
```

Deno all commands

> deno --help

### Tasks (unstable)

List all tasks

> deno task

```bash
1. deno task start
2. deno task dev
3. deno task check
4. deno task test
5. deno task fmt
```

### Make (linux/darwin)

```bash
1. make // help
2. make install // install dependencies
3. make dev // run dev mode (watch files)
4. make test // run tests
5. make fmt // formatter
6. make check // linter & check formatter
7. make inspect // inspect with chrome
```

## VSCODE addons

All configuration for VsCode: autofix, debugger, etc...

[deno for vscode](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)

## Documentation generator

[Deno doc](https://doc.deno.land)
