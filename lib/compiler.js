var path = require('path'),
    hashGenerator = require('hasha'),
    _ = require('underscore'),
    loaderUtils = require('loader-utils'),
    mapcache = require('./mapcache');

module.exports = function (options) {
  'use strict';

  return function (id, tokens, pathToTwig) {
    var includes = [],
        opts,
        output = [],
        parsedTokens,
        resourcePath = mapcache.get(id),

        hasNamespace = function (value, namespaces) {
          var result = false;

          _.each(namespaces, function (filePath, namespace) {
            if (value.indexOf(namespace) !== -1) {
              result = true;
            }
          });

          return result;
        },

        handleNamespace = function (value, namespace, filePath) {
          if (value.indexOf('@' + namespace) !== -1) {
            return value.replace('@' + namespace, path.resolve(filePath));
          }

          if (value.indexOf(namespace + '::') !== -1) {
            return value.replace(namespace + '::', path.resolve(filePath));
          }

          return value;
        },

        replaceNamespaces = function (value, namespaces) {
          _.each(namespaces, function (filePath, namespace) {
            value = handleNamespace(value, namespace, filePath);
          });

          return value;
        },

        processDependency = function (token) {
          var namespaceExists = hasNamespace(token.value, options.twigOptions.namespaces || {});

          includes.push(token.value);

          if (namespaceExists) {
            token.value = replaceNamespaces(token.value, options.twigOptions.namespaces);
            token.value = hashGenerator(path.resolve(token.value));
          } else {
            token.value = hashGenerator(path.resolve(path.dirname(resourcePath), token.value));
          }
        },

        processToken = function (token) {
          if (token.type === 'logic' && token.token.type) {
            switch (token.token.type) {
              case 'Twig.logic.type.block':
              case 'Twig.logic.type.if':
              case 'Twig.logic.type.elseif':
              case 'Twig.logic.type.else':
              case 'Twig.logic.type.for':
              case 'Twig.logic.type.spaceless':
              case 'Twig.logic.type.macro':
                _.each(token.token.output, processToken);
                break;
              case 'Twig.logic.type.extends':
              case 'Twig.logic.type.include':
                _.each(token.token.stack, processDependency);
                break;
              case 'Twig.logic.type.embed':
                _.each(token.token.output, processToken);
                _.each(token.token.stack, processDependency);
                break;
              case 'Twig.logic.type.import':
              case 'Twig.logic.type.from':
                if (token.token.expression !== '_self') {
                  _.each(token.token.stack, processDependency);
                }

                break;
            }
          }
        };

    parsedTokens = JSON.parse(tokens);

    _.each(parsedTokens, processToken);

    opts = Object.assign({}, options.twigOptions, {
      id: id,
      data: parsedTokens,
      allowInlineIncludes: true,
      rethrow: true
    });

    output = [
      'var twig = require("' + pathToTwig + '").twig,',
      '    template = twig(' + JSON.stringify(opts) + ');\n',
      'module.exports = function(context) { return template.render(context); }'
    ];

    if (includes.length > 0) {
      _.each(_.uniq(includes), function (file) {
        output.unshift('require(' + JSON.stringify(file) + ');\n');
      });
    }

    return output.join('\n');
  };
};
