@gasbuddy/l10n
==============

A simple l10n framework for Javascript projects with template support. General usage is modeled after iOS where
you embed the "initial" version of your string directly in code but then it is transprently replaced by the l10n
infrastructure. Each string has a "key" and a default value, the key is used in the translation process to create
a stable key for external translation (as opposed to using the default value). The module is meant to be used as middleware in any [express](https://github.com/expressjs/express)project and adds an "l10n" function to the req object. Future improvements will include React support and thus some client side support.

See the [test](tests/test_app.js) for simple usage, but generally there are two phases, string table setup and usage.

String Table Setup
------------------
Add the l10n middleware "early" in your pipeline, perhaps after static file support (since static files can't use this l10n anyhow).

```
  const l10n = require('@gasbuddy/l10n');

  app.use(l10n({
    default: 'en',
    strings: {
      de: {
        Yes: 'Ja',
        No: 'No',
        Colors: {
          Green: 'grün',
        },
      },
    },
  }));
```

Now we have setup German strings as well as the default values. While this was done "inline," generally we intend the
configuration to use confit and shortstop to enable flexilble file structure. To get a localized string,
you can use a property-based syntax like so:

```
// This is grün if req will accept German, green otherwise.
req.l10n.Colors.Green('green')
// So is this
req.l10n['Colors.Green']('green')
```

Strings support the full ES6 template string system using [es6-template-strings](https://github.com/medikoo/es6-template-strings). Please not you should NOT
use the backticks otherwise the substitutions happen at the wrong time (We didn't
use tagged templates because you lose the name-based parameter substitution).

```
const firstName = req.query.firstName;
req.l10n.Phrases.HelloName('Hello, ${firstName}', { firstName });
```