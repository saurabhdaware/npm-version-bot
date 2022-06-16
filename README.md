# npm-version-bot
Version the master changes, add changelog

WIP

## For Creating the Version Tag

```yaml
on: [push]

jobs:
  version_bump:
    runs-on: ubuntu-latest
    name: Version Bump
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Create Version Bump
        uses: saurabhdaware/npm-version-bot@main
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

```

## For Creating the Release

```yaml
on: [push]

jobs:
  version_bump:
    runs-on: ubuntu-latest
    name: Version Bump
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v3
        if: ${{ !!steps.versionbot.outputs.version }}
        with:
          node-version: 16.x
      - name: Create Version Bump
        uses: saurabhdaware/npm-version-bot@main
        id: versionbot
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
      - run: npx changelogithub
        if: ${{ !!steps.versionbot.outputs.version }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```