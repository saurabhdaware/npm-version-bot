const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

/**
 * @Credits https://github.com/actions-ecosystem/action-get-merged-pull-request/blob/main/src/main.ts
 * 
 */
async function getMergedPullRequest(
  githubToken,
  owner,
  repo,
  sha
) {
  const octokit = github.getOctokit(githubToken);

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


// function getPRNumber() {
//   const githubSquashCommit = github.context.payload.commits.find((commit) => {
//     return commit.committer.username === 'web-flow' && commit.commiter.name === 'GitHub'
//   })

//   if (githubSquashCommit) {
//     const [_, prNumber] = /\(#([\d ]*?)\)/g.exec(githubSquashCommit.message);
//     if (!prNumber) return 1;
//     return prNumber;
//   }

//   return 1;
// }

// async function getLabels(prNumber) {
//   const repository = github.context.payload.repository;
//   const ENDPOINT = repository.pulls_url.replace('{/number}', `/${prNumber}`);
//   const data = await fetch(ENDPOINT).then((res) => res.json());
//   const labels = data.labels.map((label) => label.name);
//   return labels;
// }

async function action() {
  const pull = await getMergedPullRequest(
    core.getInput('github_token'),
    github.context.repo.owner,
    github.context.repo.repo,
    github.context.sha
  );

  console.log({pull});


  // const mergedPRNumber = getPRNumber();
  // console.log({mergedPRNumber});
  // const labels = await getLabels(mergedPRNumber);
  // console.log({labels});

  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
}

try {
  action();
} catch (error) {
  core.setFailed(error.message);
}