#!/usr/bin/env node

const glob = require('glob');
const asciidoctor = require('../node_modules/asciidoctor.js/dist/node/asciidoctor')();

glob('test-plans/*.adoc', function (err, files) {
  files.forEach(function (file) {
    asciidoctor.convertFile(file);
  });
});
