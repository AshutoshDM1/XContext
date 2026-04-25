#!/usr/bin/env bash

corepack enable
corepack prepare bun@latest --activate  
bun install
bun run build