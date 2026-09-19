# ChatGPT plugin packaging

Status: Packaging prepared; ChatGPT Build import and integrated use unverified

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

- `.codex-plugin/plugin.json`: current Codex/ChatGPT plugin manifest;
- `.app.json`: required reference to the existing registered Preview app;
- `skills/coach/SKILL.md`: canonical Coach behavioural Skill;
- `skills/coach/references/behavioral-acceptance.md`: behavioural validation scenarios;
- `.agents/plugins/marketplace.json`: proposed workspace marketplace containing the root Coach Preview plugin; import remains unverified.

The manifest explicitly points `apps` to `./.app.json` and `skills` to `./skills/`. The Skill is read directly from the repository directory; no independently editable Build copy should be maintained. After any Skill change, sync/reinstall the plugin from its canonical GitHub source and verify the installed version before relying on the new behaviour.

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

The same app ID is now displayed as **Coach Preview MCP**. Its existing OAuth connection and app-specific **Allow all actions** setting were observed on 19 September 2026.

## Why there is no mcp.json

Do not add `mcp.json`, `.mcp.json` or an inline MCP declaration to the workspace plugin.

The registered custom app already owns the remote MCP connection, OAuth, workspace availability and action controls. The plugin references that app through `.app.json`.

Imported plugins that declare MCP servers directly can be marked Desktop only. The existing-app binding is the intended ChatGPT workspace route.

## GitHub marketplace

The repository marketplace lives at:

`.agents/plugins/marketplace.json`

It contains one local source entry for `coach-preview`, intended to point to the repository root. Source-path resolution remains to be verified in Build.

The exact GitHub marketplace import route and root-relative source path still need to be exercised in ChatGPT Build. The current Work tool registry has no callable Build/import/install tool, so repository packaging alone is not evidence of an installed integrated plugin. After a successful import, pin the installed source/commit and record the plugin ID in CCH-40. Future sync should use the authoritative branch chosen after acceptance.

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

1. import the GitHub marketplace/package from the CCH-40 branch using the current Build workflow;
2. verify **Coach Preview** shows the Coach Skill and required existing app;
3. install/enable it for the owner;
4. run a representative read-only coaching check and confirm the stable Preview MCP app still authenticates normally.

Do not retire any existing working integration until the imported **Coach Preview** plugin is proven.
