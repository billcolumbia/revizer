# revizer 0.1.1

> A tool to help revision static assets with file hashing. Creates `manifest.json` for reading latest asset filenames.

## Install

```
$ npm install --save revizer
```

## Usage

`-b, --base [string]` - Optional base path to the files to be hashed
`-m, --manifest [string]` - Optional destination path for manifest.json
`-l, --list [comma separated list]` - Required list of files to be hashed (relative to base)

## Example

```
revizer -l bundle.css,bundle.js -b dist/
```
