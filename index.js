const core = require('@actions/core');
const github = require('@actions/github');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const process = require('process');

const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE;
const GITHUB_TOKEN = core.getInput('github_token');
const octokit = github.getOctokit(GITHUB_TOKEN);
const owner = github.context.repo.owner;
const repo = github.context.repo.repo;
const sha = github.context.sha;


/**
 * @Credits https://github.com/actions-ecosystem/action-get-merged-pull-request/blob/main/src/main.ts
 * 
 * The code is mostly taken from above action and updated to support newer octokit version
 */
async function getMergedPullRequest() {
  const resp = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
    owner,
    repo,
    sort: 'updated',
    direction: 'desc',
    state: 'closed',
    per_page: 100
  });

  const pull = resp.data.find(p => p.merge_commit_sha === sha);
  if (!pull) {
    return null;
  }

  return {
    title: pull.title,
    body: pull.body,
    number: pull.number,
    labels: pull.labels.map(l => l.name),
    assignees: pull.assignees.map(a => a.login)
  };
}

async function action() {
  const pull = await getMergedPullRequest();

  if (!pull) {
    console.log('No Pull Request Found with Same GitHub Commit Id');
    return;
  }

  /** @type {'major' | 'minor' | 'patch' | undefined} */
  let semverBumpType;
  
  if (pull.labels.includes('major')) {
    semverBumpType = 'major';
  } else if (pull.labels.includes('minor')) {
    semverBumpType = 'minor';
  } else if (pull.labels.includes('patch')) {
    semverBumpType = 'patch';
  }

  if (semverBumpType) {
    const bumpVersion = `
    git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
    git config user.name "GitHub Actions Bot"
    npm version ${semverBumpType}
    git push origin main --follow-tags
    `;

    const {stdout, stderr} = await exec(bumpVersion, {
      cwd: GITHUB_WORKSPACE,
    });
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    const newVersion = require(`${GITHUB_WORKSPACE}/package.json`).version;
    console.log(`Committed v${newVersion} to branch`);
    core.setOutput('version', newVersion);
  }
}

try {
  action();
} catch (error) {
  core.setFailed(error.message);
}