# twig-symfony-loader [![Build Status](https://travis-ci.org/zimmo-be/twig-loader.svg)](https://travis-ci.org/zimmo-be/twig-loader)
Webpack loader for compiling Twig.js templates. This loader will allow you to require Twig.js views to your code.

## Installation

`npm install twig-symfony-loader`

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html?branch=master)

``` javascript

module.exports = {
    //...

    module: {
        rules: [
            {
                test: /\.twig$/,
                loader: "twig-symfony-loader",
                options: {
                    // See options section below
                },
            }
        ]
    },

    node: {
        fs: "empty" // avoids error messages
    }
};
```

### Options

- `twigOptions`: optional; a map of options to be passed through to Twig.

  Example: `{ autoescape: true }`
  
  Example: `{ namespaces: { namespaces: { templates: path.resolve(templatesPath) } } }`

## Loading templates

```twig
{# File: dialog.html.twig #}
<p>{{title}}</p>
```

```javascript
// File: app.js
var template = require("dialog.html.twig");
// => returns pre-compiled template as a function and automatically includes Twig.js to your project

var html = template({title: 'dialog title'});
// => Render the view with the given context

```

When you extend another view, it will also be added as a dependency. All twig functions that refer to additional templates are supported: import, include, extends & embed.

## Loading templates with namespaces

```js
const path = require('path');

var templatesPath = path.join(__dirname, '/public/templates');

var config = {
  //...
  
  module: {
    rules: [
      {
        test: /\.twig/,
        use: [
          {
            loader: 'twig-symfony-loader',
            options: {
              twigOptions: { namespaces: { templates: path.resolve(templatesPath) } }
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      '@templates': path.resolve(templatesPath)
    },
   //...
  }
};

module.exports = config;

```

```twig
{# /public/templates/test.html.twig #}
{% include "@templates/test1/example.html.twig" with {
    param1: "param1",
    param2: "param2"
  }
%}
```

```twig
{# /public/templates/test1/example.html.twig #}
<div>
  <div>
    {{ param1 }}
    {{ param2 }}
    
    {% include "@templates/buttons.html.twig" with {reset_text: 'Reset', submit_text: 'Submit'} %}
    {% include "@templates/loader.html.twig" %}
  </div>
</div>
```

0.1.0 / 2019-04-13
==================

* Added support for namespaces

forked from https://github.com/zimmo-be/twig-loader
