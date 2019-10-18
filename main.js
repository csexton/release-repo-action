const core = require('@actions/core')
//const {GitHub, context} = require('@actions/github')

process.on('unhandledRejection', handleError);
main().catch(handleError);
function handleError(err) {
  console.error(err)
  core.setFailed(err.message)
}

function clone(repo, token) {
  const repoURL = `https://${token}@github.com/${repo}.git`;
  const simpleGit = require('simple-git')('.');
  simpleGit.clone(repoURL, "repo", ['--depth=1'])
  console.log("Hello?");
}

async function main() {
  const personalToken = core.getInput('personal-token');
  const token = process.env.GITHUB_TOKEN; // TODO: move to input?

  const repo = core.getInput('repo');

  var files = [];

  // Add any single files
  files = files.concat(core.getInput('file'))

  // Get list of new-line-seperated files
  if (core.getInput('files')) {
    files = files.concat(core.getInput('files').split(/\r?\n/))
  }

  clone(repo, personalToken)

  console.log(repo)
  console.dir(files)
}

