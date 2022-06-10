const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

function getPRNumber() {
  const commit = github.context.payload.commits[0];
  const commiter = commit.committer;
  if (commiter.username === 'web-flow' && commiter.name === 'GitHub') {
    const [_, prNumber] = /\(#([\d ]*?)\)/g.exec(commit.message);
    if (!prNumber) return 1;
    return prNumber;
  }
  return 1;
}

async function getLabels(prNumber) {
  const repository = github.context.payload.repository;
  const ENDPOINT = repository.pulls_url.replace('{/number}', `/${prNumber}`);
  const data = await fetch(ENDPOINT).then((res) => res.json());
  const labels = data.labels.map((label) => label.name);
  return labels;
}

try {
  const mergedPRNumber = getPRNumber();
  console.log({mergedPRNumber});
  const labels = getLabels(mergedPRNumber);
  console.log({labels});

  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}