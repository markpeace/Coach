# ChatGPT plugin packaging

Status: Current for MVP v2 Preview

## Decision

Coach uses an explicit Preview/Production split in ChatGPT.

During MVP validation:

```text
Coach Preview plugin
  + repository-owned Coach Skill
        ↓
registered Preview workspace app
  app id: asdk_app_6aa945279bc081919c667652d14c5646
  intended display name: Coach Preview MCP
        ↓
stable preview/coach-mvp-owner /mcp endpoint
        ↓
real persistent Coach athlete ledger
```

After a separate production release decision:

```text
Coach plugin
  + same canonical Coach Skill
        ↓
Coach MCP production workspace app
        ↓
production /mcp endpoint
        ↓
preserved live Coach athlete ledger
```

Preview and Production must never share an ambiguous plugin/app identity or endpoint.

## Repository package

The repository root is the **Coach Preview** plugin root.

Files:

- `plugin.json`: portable Agent Plugins manifest;
- `.app.json`: required reference to the existing registered Preview app;
- `skills/coach/SKILL.md`: canonical Coach behavioural Skill;
- `skills/coach/references/behavioral-acceptance.md`: behavioural validation scenarios;
- `.agents/plugins/marketplace.json`: GitHub-importable workspace marketplace containing the root Coach Preview plugin.

The portable manifest points `extensions.com.openai.apps` to `./.app.json`. Portable packages discover Skills from the root `skills/` directory automatically.

This keeps `skills/coach/SKILL.md` as the only editable behavioural source and avoids a second plugin-specific copy.

## Existing app binding

The Preview plugin references the already registered custom app:

`asdk_app_6aa945279bc081919c667652d14c5646`

The app reference is:

```json
{
  "apps": {
    "coach-preview": {
      "id": "asdk_app_6aa945279bc081919c667652d14c5646",
      "required": true
    }
  }
}
```

The app ID is not a credential. The reference does not create an app, grant permissions or bypass authentication. Workspace app access, OAuth and action controls remain authoritative.

The app is currently still returned by ChatGPT management as **Coach**. CCH-40 intends to rename it in place to **Coach Preview MCP** if the current admin UI permits this. Do not delete/recreate the app merely to achieve the name without first preserving the working OAuth/tool configuration.

## Why there is no mcp.json

Do not add `mcp.json`, `.mcp.json` or an inline MCP declaration to the workspace plugin.

The registered custom app already owns the remote MCP connection, OAuth, workspace availability and action controls. The plugin references that app through `.app.json`.

Imported plugins that declare MCP servers directly can be marked Desktop only. The existing-app binding is the intended ChatGPT workspace route.

## GitHub marketplace

The repository marketplace lives at:

`.agents/plugins/marketplace.json`

It contains one local source entry for `coach-preview`, pointing to the repository root.

Workspace import uses the GitHub repository URL and the CCH-40 branch while validating packaging. After CCH-40 is accepted and reconciled, future sync should use the authoritative branch chosen by the product owner rather than an implementation branch.

Importing/syncing plugin content does not alter the referenced app's existing permissions or authentication.

## Naming contract

Validation:

- plugin: **Coach Preview**
- connected workspace app: **Coach Preview MCP** (rename target; current app ID fixed above)
- MCP/web host: stable `preview/coach-mvp-owner` branch alias
- data: real persistent Coach Neon ledger

Reserved for release:

- plugin: **Coach**
- connected workspace app: **Coach MCP**
- host: production Vercel endpoint

Do not create the production plugin/app, promote Vercel Production, or repoint the Preview app without a separate release approval.

## CCH-40 workspace gate

Repository packaging is complete once the current package imports successfully.

The remaining workspace actions are deliberately small:

1. rename the existing custom app from **Coach** to **Coach Preview MCP** if the admin UI supports in-place rename;
2. import the GitHub marketplace from the CCH-40 branch;
3. verify **Coach Preview** shows the Coach Skill and required existing app;
4. install/enable it for the owner;
5. run a representative read-only coaching check and confirm the stable Preview MCP app still authenticates normally.

Do not retire any existing working integration until the imported **Coach Preview** plugin is proven.
