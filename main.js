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
  const branchName = core.getInput('branch');
  const tagInput = core.getInput('tag');
  const tagAndRelease = core.getInput('tag-and-release', { required: false }) === 'true';
  const clean = core.getInput('clean', { required: false }) === 'true';
  const repoPath = path.resolve('./release-repo');

  //var release = await octokit.repos.getReleaseByTag({ owner: "RadiusNetworks", repo: "iris-ios", tag: "sdk-v0.2" })
  //context.payload.release = release.data

  if (! context.payload.release) {
    core.warning("Not running action as a release, skipping.");
    return;
  }

  const actor = context.actor
  const release = context.payload.release;
  const [owner, repo] = target.split('/');
  var tagName = release.tag_name;
  if (tagInput) {
    tagName = tagInput.trim();
  }
  core.setOutput('tag_name', tagName);
  if (!tagAndRelease) {
    tagName = null;
  }

  await releaseRepo.clone(repoPath, target, personalToken)
  if (clean) {
    releaseRepo.clean(repoPath);
  }
  await releaseAsset.downloadAndExtract(assetFileName, release.assets, token, repoPath)
  await releaseRepo.prep(repoPath, context.actor);
  await releaseRepo.commitAndPush(repoPath, tagName, branchName);

  if (tagAndRelease) {
    const octokitTarget = new GitHub(personalToken)
    const response = await octokitTarget.repos.createRelease({
      owner: owner,
      repo: repo,
      body: release.body,
      name: release.name,
      tag_name: tagName,
      prerelease: release.prerelease,
    });
    const newRelease = response.data
    core.setOutput('html_url', newRelease.html_url);
    core.setOutput('url', newRelease.html_url);
  }
}

main().catch(error.handle);
