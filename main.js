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

  //var release = await octokit.repos.getReleaseByTag({ owner: "RadiusNetworks", repo: "iris-ios", tag: "sdk-v0.2" })
  //context.payload.release = release.data

  if (! context.payload.release) {
    core.warning("Not running action as a release, skipping.");
    return;
  }

  var release = context.payload.release;


  var [owner, repo] = target.split('/');
  var tag_name = release.tag_name;

  await releaseRepo.clone(repoPath, target, personalToken)
  await releaseAsset.downloadAndExtract(assetFileName, release.assets, token, repoPath)
  await releaseRepo.commitTagAndPush(repoPath, tag_name);

  var createBody = {
    owner: owner,
    repo: repo,
    body: release.body,
    name: release.name,
    tag_name: release.tag_name,
    prerelease: release.prerelease,
  };
  console.log("* body *************************************************************************");
  console.dir(createBody);
  var response = await octokit.repos.createRelease(createBody);
  console.log("* response *********************************************************************");
  console.dir(response);
  var newRelease = response.data

  console.log("* new release ******************************************************************");
  console.dir(newRelease);
  core.setOutput('html_url', newRelease.html_url);
  core.setOutput('url', newRelease.html_url);
}

main().catch(error.handle);
