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
```

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
| `agent-configs` | no       | [upsert-agent-configs] List of glob patterns for YAML agent config files |

## Common outputs

| Output     | Description                                                                            |
|------------|----------------------------------------------------------------------------------------|
| `json`     | Raw JSON response from the Dust API (includes `imported`, `updated`, `errored` arrays) |
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
      - uses: actions/checkout@v4

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
      - uses: actions/checkout@v4

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
