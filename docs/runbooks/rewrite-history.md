# Purging old images from git history

> **Done on 2026-10-28.** History was rewritten and force-pushed: the pack went from 607 MB to 34 MB,
> and `main` moved from `df418e1` to `6b2017e` (same tree). Don't run this again. A clone made before
> that date has the old history: re-clone it instead of pulling.

`public/photos` (1,454 JPEGs, ~600 MB) and `public/logos` were committed to git. Even after they
are deleted, every clone still downloads them: the packed repo is ~594 MB. Once the images live in
Supabase Storage, this runbook removes them from history.

**This rewrites every commit hash and needs a force-push. Do it once, deliberately, and only
after the steps under "Before you start".**

## Before you start

1. `npm run media:migrate -- --apply` has run, and brewery pages show Storage URLs (check a few
   pages and `npm run seo:check`).
2. A merged PR has deleted `public/photos` and `public/logos` (Prompt 7 does this).
3. No open pull requests: merge or close them. Their branches are based on the old history.
4. Nobody else has unpushed work. Anyone with a clone will need to re-clone afterwards.
5. Install the tool: `brew install git-filter-repo`

## 1. Back up

```bash
cd ~/projects
git clone --mirror https://github.com/gchukura/maryland-brewery.git maryland-brewery-backup.git
tar czf maryland-brewery-backup-$(date +%Y%m%d).tgz maryland-brewery-backup.git
```

Keep the tarball until you're sure nothing is missing. Restoring is
`git push --force --mirror` from the backup.

## 2. Rewrite a fresh mirror

```bash
git clone --mirror https://github.com/gchukura/maryland-brewery.git maryland-brewery-rewrite.git
cd maryland-brewery-rewrite.git
git count-objects -vH                       # note size-pack before
git filter-repo --path public/photos --path public/logos --invert-paths
git count-objects -vH                       # size-pack after
git log --all --oneline -- public/photos    # must print nothing
```

`git filter-repo` removes the `origin` remote on purpose. Add it back:

```bash
git remote add origin https://github.com/gchukura/maryland-brewery.git
```

## 3. Force-push

```bash
git push --force --all origin
git push --force --tags origin
```

(Don't use `git push --mirror`: GitHub rejects the read-only `refs/pull/*` refs a mirror carries.)

## 4. Afterwards

**GitHub.** The rewritten history is live immediately. Old commits can stay reachable by their
old hash for a while (and in closed PRs); that only matters for secrets, not for size. GitHub
re-packs on its own; the repository size shown in settings drops after its next garbage collection.

**Vercel.** Nothing to change. The next push deploys from the new history. If a deploy is stuck on
an old commit, redeploy the latest one from the dashboard with "Use existing build cache" off.

**Your working copy and any other clone.** Don't `pull` into an old clone; it would merge the old
history back. Re-clone, and copy over the files git doesn't track:

```bash
cd ~/projects
mv maryland-brewery maryland-brewery-old
git clone https://github.com/gchukura/maryland-brewery.git
cd maryland-brewery
cp ../maryland-brewery-old/.env.local .
cp "../maryland-brewery-old/MarylandBrewery.com — Claude Code Prompts.md" .
cp -R ../maryland-brewery-old/backups . 2>/dev/null
mkdir -p .claude && cp ../maryland-brewery-old/.claude/settings.local.json .claude/ 2>/dev/null
cat ../maryland-brewery-old/.git/info/exclude >> .git/info/exclude   # keeps those files out of git
npm ci
npx supabase link --project-ref <project-ref>
```

Delete `maryland-brewery-old` once the new clone builds.

**CI caches.** GitHub Actions `actions/setup-node` caches npm only; nothing to clear.
