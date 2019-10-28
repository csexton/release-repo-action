const git = require('simple-git/promise');

exports.clone = async function(path, repo, token) {
  const repoURL = `https://${token}@github.com/${repo}.git`;
  console.log(`Cloning ${repoURL} to ${path}`);
  await git('.').clone(repoURL, path, ['--depth=1'])
}

exports.prep(path, actor) {
  const repo = git(path);
  await repo.addConfig("user.email", `${actor}@users.noreply.github.com`);
  await repo.addConfig("user.name", "Release Repo Bot");
}


exports.commitAndPush = async function(path, tag, branch) {
  const repo = git(path);
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

