const git = require('simple-git/promise');

exports.clone = async function(path, repo, token) {
  const repoURL = `https://${token}@github.com/${repo}.git`;
  console.log(`Cloning ${repoURL} to ${path}`);
  await git('.').clone(repoURL, path, ['--depth=1'])
}

exports.commitTagAndPush = async function(path, tag, actor) {
  const repo = git(path);
  const message = `Release ${tag}`;
  console.log(`Commit, tag, and push to release repo: ${message}`);

  await repo.addConfig("user.email", `${actor}@users.noreply.github.com`);
  await repo.addConfig("user.name", "Release Repo Bot");
  await repo.add(['.']);
  await repo.commit(message);
  await repo.addTag(tag);
  await repo.pushTags();
  await repo.push();
}
