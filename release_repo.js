const git = require('simple-git/promise');
const path = require('path');
const fs = require('fs');

exports.clone = async function(repoPath, repo, token) {
  const repoURL = `https://${token}@github.com/${repo}.git`;
  console.log(`Cloning ${repoURL} to ${repoPath}`);
  await git('.').clone(repoURL, repoPath, ['--depth=1'])
}

exports.clean = function(repoPath, keep) {
  // keep is a colon seperated list files to keep
  var keepFiles = [];
  if (keep) {
    keepFiles = keep.split(":").map((item) => item.trim());
  }
  let nonKeepers = (file) => !keepFiles.includes(file);
  let nonDotFiles = (file) => (file[0] != ".");
  let existingFiles = fs.readdirSync(repoPath)
                        .filter(nonDotFiles)
                        .filter(nonKeepers);
  for (let file of existingFiles) {
    fs.rmdirSync(path.join(repoPath, file), { recursive: true })
  }
}

exports.prep = async function(repoPath, actor) {
  const repo = git(repoPath);
  await repo.addConfig("user.email", `${actor}@users.noreply.github.com`);
  await repo.addConfig("user.name", "Release Repo Bot");
}

exports.commitAndPush = async function(repoPath, tag, branch) {
  const repo = git(repoPath);
  const message = `Release ${tag}`;
  console.log(`Commit, tag, and push to release repo: ${message}`);

  if (branch) {
    await repo.checkout(["-b", branch]);
  }

  await repo.add(['.']);
  await repo.commit(message);
  await repo.push("origin", "HEAD");

  if (tag) {
    await repo.addTag(tag);
    await repo.pushTags("origin");
  }
}

