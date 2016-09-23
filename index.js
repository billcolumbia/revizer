#!/usr/bin/env node
var fs = require('fs')
var program = require('commander')
var revHash = require('rev-hash')
var find = require('find')

var noFileListInput = 'There was no file list specified. Check the command and make sure you passed a comma separated list with `-l` or `--list`. Something like: `-l bundle.css,bundle.js`.'

// Create array from comma separated string
var list = val => val.split(',')

// CLI options
program
  .version('0.4.0')
  .option('-b, --base [value]', 'Where the assets to be hashed are.')
  .option('-m, --manifest [value]', 'Where the manifest file should go.')
  .option('-c, --clean [value]>', 'Clean previous hashed files.')
  .option('-l, --list <items>', 'Files to hash', list)
  .parse(process.argv)

// Process CLI input
var manifestPath = program.manifest || './'
var filesToHash  = program.list
var baseDir      = program.base || './'
var manifest     = {}
var clean        = program.clean || false

// Cleans up old hashed files
function cleanup () {
  return new Promise(resolve => {
    // If dirty was specified, do not clean up old revisions.
    if (!clean) {
      resolve()
      return
    }
    // This is still only targeting `bundle` named files. Will need a better
    // way of targeting old revisions.
    find.file(/-rz/, baseDir, function (files) {
      if (!files.length) resolve()
      else {
        files.forEach(function (file, i) {
          fs.unlink(file)
          // No more files to delete, move on
          if (i === files.length - 1) resolve()
        })
      }
    })
  })
}

// Hashes builds
function hashBuiltFiles () {
  return new Promise((resolve, reject) => {
    // If no files were passed, throw an error
    if (!filesToHash) {
      reject(Error(noFileListInput))
      return
    }
    filesToHash.forEach(function (file, i) {
      var buffer = fs.readFileSync(baseDir + file)
      var newFileName = file.replace('.','-' + revHash(buffer) + 'rz.')
      fs.writeFileSync(baseDir + newFileName, buffer)
      var lastSlash = file.lastIndexOf('/') + 1 || 0
      manifest[file.substring(lastSlash)] = newFileName
      // No more files to hash, move on
      if (i === filesToHash.length - 1) {
        resolve()
      }
    })
  })
}

// Creates a manifest.json file with filenames and paths
function createManifest () {
  fs.writeFile(manifestPath + 'manifest.json', JSON.stringify(manifest))
}

// Run it!
cleanup()
  .then(() => {
    return hashBuiltFiles()
  })
  .then(() => {
    return createManifest()
  })
  .catch(err => {
    console.error(err)
  })
