var Twig = require('twig'),
    path = require('path'),
    hashGenerator = require('hasha'),
    mapcache = require('./mapcache'),
    compilerFactory = require('./compiler'),
    getOptions = require('./getOptions');

Twig.cache(false);

module.exports = function(source) {
  'use strict';

  var resourcePath = require.resolve(this.resource),
      id = hashGenerator(resourcePath),
      options = getOptions(this),
      tpl;

  Twig.extend(function(Twig) {
    var compiler = Twig.compiler;

    compiler.module.webpack = compilerFactory(options);
  });

  mapcache.set(id, resourcePath);

  this.cacheable && this.cacheable();

  tpl = Twig.twig({
    id: id,
    path: resourcePath,
    data: source,
    allowInlineIncludes: true
  });

  tpl = tpl.compile({
    module: 'webpack',
    twig: 'twig'
  });

  this.callback(null, tpl);
};
