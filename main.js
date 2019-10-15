
//const core = require('@actions/core')
//const {GitHub, context} = require('@actions/github')

const token = process.env.GITHUB_TOKEN;
const repo = "RadiusNetworks/flybuy-ios";

repoURL = `https://${token}@github.com/${repo}.git`;
const simpleGit = require('simple-git')('.');
simpleGit.clone(repoURL, "repo", ['--depth=1'])

console.log("Hello?");
