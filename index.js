#!/usr/bin/env node
var fs = require('fs')
var program = require('commander')
var revHash = require('rev-hash')
var find = require('find')

// Create array from comma separated string
var list = val => val.split(',')

// CLI options
program
  .version('0.1.0')
  .option('-b, --base [value]', 'Where the assets to be hashed are.')
  .option('-m, --manifest [value]', 'Where the manifest file should go.')
  .option('-l, --list <items>', 'Files to hash', list)
  .parse(process.argv)

// Process CLI input
var manifestPath = program.manifest || './'
var filesToHash  = program.list
var baseDir      = program.base || './'
var manifest     = {}

// Cleans up old builds and starts hashing when done
function cleanup () {
  find.file(/bundle-/, baseDir, function (files) {
    files.forEach(function (file, i) {
      fs.unlink(file)
      if (i === files.length - 1) hashBuiltFiles()
    })
    if (!files.length) hashBuiltFiles()
  })
}

// Hashes builds and starts manifest creation when done
function hashBuiltFiles () {
  filesToHash.forEach(function (file, i) {
    var pathToFile = baseDir + file
    var buffer = fs.readFileSync(pathToFile)
    var hash = revHash(buffer)
    var newFileName = pathToFile.replace('.','-' + hash + '.')
    fs.writeFileSync(newFileName, buffer)
    var lastSlash = file.lastIndexOf('/') + 1 || 0
    manifest[file.substring(lastSlash)] = newFileName
    if (i === filesToHash.length - 1) {
      createManifest()
    }
  })
}

// Creates a manifest.json file with filenames and paths
function createManifest () {
  fs.writeFile(manifestPath + 'manifest.json', JSON.stringify(manifest))
}

// Run it.
cleanup()
