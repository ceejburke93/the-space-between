# GitHub Pages readiness

Checked November 17, 2026 against [Meta's build/deploy guide](https://developers.meta.com/vr/documentation/iwsdk/guides/08-build-deploy/#deploying-to-github-pages).

## Status

The public source repository is [ceejburke93/the-space-between](https://github.com/ceejburke93/the-space-between). This repository is not itself a hosted game website, and no Pages deployment has been run.

| Guide step | Current state |
| --- | --- |
| Production static build in `dist` | Passed locally |
| Project URL base `/the-space-between/` | Separate build with explicit base passed |
| Serve built HTML and entry assets at project path | Local HTTP checks passed |
| GitHub Actions validation | Runs on pushes to `main` |
| GitHub Pages deployment workflow | Prepared in `.github/workflows/deploy.yml`; manual dispatch only |
| Enable the Pages source in Settings → Pages | Still to confirm |
| Verify hosted HTTPS game and immersive launch | Pending deployment |

The normal Vite base remains `./` for local preview. A GitHub project build uses `npm run build -- --base=/the-space-between/` without changing local development behavior.

## Remaining steps

1. Confirm GitHub Pages is enabled for this public repository and select GitHub Actions as its source.
2. Run the deployment workflow manually after reviewing the validation result.
3. Verify runtime-loaded assets, saved-game flow, and immersive launch at the hosted HTTPS URL.

Pushing source to `main` runs validation but does not publish the game site. Deployment remains a separate, manual action.
