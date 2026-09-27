# Plan: Move Missing Skills to `~/.agents/skills`

## Goal
Move all global skills INTO `~/.agents/skills/` as canonical location. Skip duplicates already present.

## Current State
- `~/.agents/skills/` has 30 skills (target)
- `~/.claude/skills/` has 42 skills (source)
- `~/.opencode/skills/` has 1 skill (source)
- `.kilo/agent/` has 1 skill (source)

## Skills to Move (19 unique, not in `.agents/skills/`)
From `~/.claude/skills/`:
- 3d-model-generation
- career-ops
- diagnose-why-work-stopped
- filament-pro
- frontend-design
- frontend-slides
- immersive-design
- laravel-specialist
- ml-model-training
- nestjs-best-practices
- paperclip
- paperclip-converting-plans-to-tasks
- paperclip-create-agent
- paperclip-create-plugin
- paperclip-dev
- para-memory-files
- php-pro
- sop-writer
- terminal-bench-loop

From `~/.opencode/skills/`:
- ml-model-training (duplicate, skip)

From `.kilo/agent/`:
- npm-publish (already in `.agents/skills/`, skip)

## Steps
1. `mv` each of 19 skills from `~/.claude/skills/` to `~/.agents/skills/`
2. Verify `~/.agents/skills/` contains ~49 skills total
3. Verify `~/.claude/skills/` no longer contains moved skills
4. Remove empty `~/.opencode/skills/` and `.kilo/agent/` if emptied

## Risk
Low. Single canonical destination. Source dirs cleaned after move.