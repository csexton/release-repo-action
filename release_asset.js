const os = require('os');
const path = require('path');
const fs = require('fs');
const request = require('request');
const AdmZip = require('adm-zip');

function findAsset(assets, name){
  for(var i in assets){
    if(assets[i].name == name) {
      return assets[i].url
    }
  }
  throw `${name} not found in assets`;
}

async function downloadAsset(url, token) {
  var filePath = path.join(os.tmpdir(), "asset.zip");
  const options = {
    url: url,
    headers: {
      'User-Agent': 'request',
      'Accept': 'application/octet-stream',
      'Authorization': `token ${token}`
    }
  };
  var stream = request(options).pipe(fs.createWriteStream(filePath))

  return new Promise((resolve) => {
    stream.on('finish', ()=>{ resolve(filePath) });
  });
}

exports.downloadAndExtract = async function(fileName, assets, token, targetPath) {
  var assetUrl = findAsset(assets, fileName)
  console.log(`Downloading ${assetUrl}`);
  var tempFile = await downloadAsset(assetUrl, token)
  var zip = new AdmZip(tempFile);
  console.log(`Extracting ${tempFile}`);

  var zipEntries = zip.getEntries(); // an array of ZipEntry records

  zipEntries.forEach(function(zipEntry) {
    console.log("  - " + zipEntry.entryName); // outputs zip entries information
  });
  await zip.extractAllTo(targetPath, true);
};

