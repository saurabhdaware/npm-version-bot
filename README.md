# npm-version-bot
Version the master changes, add changelog

WIP

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