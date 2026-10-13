[![StepSecurity Maintained Action](https://raw.githubusercontent.com/step-security/maintained-actions-assets/main/assets/maintained-action-banner.png)](https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions)

# Dust GitHub Action

A GitHub Action to interact with your [Dust](https://dust.tt) workspace.

## Methods

### `upsert-skills`

Syncs [Agent Skills](https://agentskills.io/specification) from the repository to Dust. Finds `SKILL.md` files, packages
their directories into a ZIP, and uploads it.

```yaml
- uses: step-security/dust-github-action@v0
  with:
    method: upsert-skills
    workspace-id: ${{ vars.DUST_WORKSPACE_ID }}
    api-key: ${{ secrets.DUST_API_KEY }}
    region: EU
    names: |
      Review PR
      Summarize
    editors: |
      alice@example.com
      bob@example.com
    availability: workspace_users
```

The optional `names` input selects skills by their exact `name` in `SKILL.md`. Omit it to import all detected skills.
The optional `editors` input adds editors to each imported or updated skill. Use email addresses of active workspace members.
Existing editors are preserved. Both inputs accept one value per line.

The optional `availability` input sets who can see and use the imported or updated skills:

| Value              | UI label           | Meaning                                                                                                   | Required permission                                              |
|--------------------|--------------------|-----------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| `editors`          | Editors only       | Only the skill's editors can find it in the composer and agent builder. Default for new skills.           | —                                                                |
| `workspace_users`  | All members        | Every workspace member can find and use it.                                                               | Manage skill availability                                        |
| `users_and_agents` | Members and agents | Every member can find it, and agents with Discover Skills enabled (including @Dust) can use it automatically. | Manage skill availability + Make skills discoverable to agents |

Skills created by an API key have no editors, so with the default availability they are not discoverable by anyone.
To make them visible, set `editors` (so those members can find and manage them) or set `availability` to
`workspace_users` or `users_and_agents`. Admin API keys hold both permissions.

### `upsert-agent-configs`

Upserts agent configurations from YAML files in the repository to Dust. Searches for existing agents by handle — updates
them if found, creates new ones otherwise.

```yaml
- uses: step-security/dust-github-action@v0
  with:
    method: upsert-agent-configs
    workspace-id: ${{ vars.DUST_WORKSPACE_ID }}
    api-key: ${{ secrets.DUST_API_KEY }}
    region: EU
    agent-configs: |
      configs/agent-*.yaml
      agent-*.yml
```

The `agent-configs` input accepts a newline-separated list of glob patterns matching YAML agent configuration files.

Each YAML file must include at minimum an `agent.handle` field. See [Agent config format](#agent-config-format) below.

## Common inputs

| Input           | Required | Description                                                              |
|-----------------|----------|--------------------------------------------------------------------------|
| `method`        | yes      | Action to perform (`upsert-skills` or `upsert-agent-configs`)            |
| `workspace-id`  | yes      | Dust workspace sId                                                       |
| `api-key`       | yes      | Dust API key                                                             |
| `region`        | yes      | Workspace region (`EU` or `US`)                                          |
| `names`         | no       | [upsert-skills] Newline-separated skill names to import. Defaults to all skills. |
| `editors`       | no       | [upsert-skills] Newline-separated editor email addresses to add to imported or updated skills. |
| `availability`  | no       | [upsert-skills] `editors`, `workspace_users` or `users_and_agents`. Defaults to `editors` for new skills. |
| `agent-configs` | no       | [upsert-agent-configs] List of glob patterns for YAML agent config files |

## Common outputs

| Output     | Description                                                                            |
|------------|----------------------------------------------------------------------------------------|
| `json`     | Raw JSON response from the Dust API (`imported`, `updated` and `skipped` arrays for skills; `imported`, `updated` and `errored` arrays for agent configs) |
| `imported` | Number of newly created agents                                                         |
| `updated`  | Number of updated agents                                                               |

## Full examples

### Sync skills on push

```yaml
name: Sync Skills to Dust

on:
  push:
    branches: [ main ]
    paths:
      - "skills/**"
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - name: Sync skills
        uses: step-security/dust-github-action@v0
        with:
          method: upsert-skills
          workspace-id: ${{ vars.DUST_WORKSPACE_ID }}
          api-key: ${{ secrets.DUST_API_KEY }}
          region: EU
```

### Sync agent configs on push

```yaml
name: Sync Agent Configs to Dust

on:
  push:
    branches: [ main ]
    paths:
      - "agents/**"
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - name: Sync agent configs
        uses: step-security/dust-github-action@v0
        with:
          method: upsert-agent-configs
          workspace-id: ${{ vars.DUST_WORKSPACE_ID }}
          api-key: ${{ secrets.DUST_API_KEY }}
          region: EU
          agent-configs: |
            agents/*.yaml
```

## Skill format

Each skill lives in its own directory with a `SKILL.md` file ([spec](https://agentskills.io/specification)):

```
skills/
  review-pr/
    SKILL.md
    template.md       # optional attachment
  summarize/
    SKILL.md
```

`SKILL.md` uses YAML frontmatter for metadata and the body as instructions:

```markdown
---
name: Review PR
description: Reviews pull requests for code quality and correctness
---

You are a code reviewer. When asked to review a PR, analyze the diff for:

- Correctness
- Performance
- Security
```

## Agent config format

Each agent configuration lives in a single YAML file. At minimum, an `agent.handle` field is required. Example:

```yaml
agent:
  handle: MyAssistant
  description: A helpful assistant for my team
  instructions: You are a helpful assistant.
  scope: visible
  max_steps_per_run: 64
  visualization_enabled: false
  avatar_url: https://dust.tt/static/emojis/bg-yellow-200/memo/1f4dd

generation_settings:
  provider_id: anthropic
  model_id: claude-sonnet-4-5
  temperature: 0.7
  reasoning_effort: light

editors:
  - alice@example.com
  - bob@example.com

tags: [ ]
toolset: [ ]
```
