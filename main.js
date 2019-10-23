const error = require('./error.js');
const core = require('@actions/core')
const {GitHub, context} = require('@actions/github')
const releaseAsset = require('./release_asset.js');
const releaseRepo = require('./release_repo.js');
const path = require('path');

async function main() {
  const personalToken = core.getInput('personal-token');
  const token = process.env.GITHUB_TOKEN; // TODO: move to input?
  const target = core.getInput('repo');
  const octokit = new GitHub(token)
  const assetFileName = core.getInput('file');
  const repoPath = path.resolve('./release-repo');

  if (! context.payload.release) {
    core.warning("Not running action as a release, skipping.");
    return;
  }

  var release = context.payload.release;

  var [owner, repo] = target.split('/');
  var tag_name = release.data.tag_name;

  await releaseRepo.clone(repoPath, target, personalToken)
  await releaseAsset.downloadAndExtract(assetFileName, release.data.assets, token, repoPath)
  await releaseRepo.commitTagAndPush(repoPath, tag_name);

  var newRelease = await octokit.repos.createRelease({
    owner: owner,
    repo: repo,
    body: release.data.body,
    name: release.data.name,
    tag_name: release.data.tag_name,
    prerelease: release.data.prerelease,
  });

  console.dir(newRelease);
  core.setOutput('html_url', newRelease.data.html_url);
  core.setOutput('url', newRelease.data.html_url);
}

main().catch(error.handle);
