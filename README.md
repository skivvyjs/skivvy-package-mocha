# Skivvy package: `mocha`
[![npm version](https://img.shields.io/npm/v/@skivvy/skivvy-package-mocha.svg)](https://www.npmjs.com/package/@skivvy/skivvy-package-mocha)
![Stability](https://img.shields.io/badge/stability-stable-brightgreen.svg)
[![Build Status](https://travis-ci.org/skivvyjs/skivvy-package-mocha.svg?branch=master)](https://travis-ci.org/skivvyjs/skivvy-package-mocha)

> Test JavaScript files using Mocha


## Installation

```bash
skivvy install mocha
```


## Overview

This package allows you to test JavaScript files using [Mocha](http://mochajs.org/) from within the [Skivvy](https://www.npmjs.com/package/skivvy) task runner.


## Included tasks

### `mocha`

Test JavaScript files using Mocha

#### Usage:

```bash
skivvy run mocha
```


#### Configuration settings:

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| `files` | `string` `Array<string>` | Yes | N/A | Path to JavaScript files containing Mocha tests |
| `options` | `object` | No | `{}` | [Mocha options](#http://mochajs.org/#usage) (using camelCase in option names where applicable) |
| `options.asyncOnly` | `boolean` | No | `false` | Force all tests to take a callback (async) |
| `options.colors` | `boolean` | No | `false` | Force enabling of colors |
| `options.noColors` | `boolean` | No | `false` | Force disabling of colors |
| `options.growl` | `boolean` | No | `false` | Enable growl notification support |
| `options.reporterOptions` | `object` | No | `{}` | Reporter-specific options |
| `options.reporter` | `string` | No | `"spec"` | Specify the reporter to use |
| `options.sort` | `boolean` | No | `false` | Sort test files |
| `options.bail` | `boolean` | No | `false` | Bail after first test failure |
| `options.debug` | `boolean` | No | `false` | Enable node's debugger, synonym for `node --debug` |
| `options.grep` | `string` | No | `null` | Only run tests matching a pattern |
| `options.fgrep` | `string` | No | `null` | Only run tests containing a string |
| `options.exposeGc` | `boolean` | No | `false` | Expose gc extension |
| `options.invert` | `boolean` | No | `false` | Inverts `grep` and `fgrep` matches |
| `options.require` | `string` | No | `null` | Require the given module |
| `options.slow` | `number` | No | `75` | "slow" test threshold in milliseconds |
| `options.timeout` | `number` | No | `2000` | Set test-case timeout in milliseconds |
| `options.ui` | `"bdd"` `"tdd"` `"exports"` | No | `"bdd"` | Specify user-interface |
| `options.watch` | `boolean` | No | `false` | Watch files for changes |
| `options.checkLeaks` | `boolean` | No | `false` | Check for global variable leaks |
| `options.compilers` | `object` | No | `{}` | Use the given module(s) to compile files |
| `options.debugBrk` | `boolean` | No | `false` | Enable node's debugger breaking on the first line |
| `options.globals` | `Array<string>` | No | `[]` | Allow the given globals |
| `options.inlineDiffs` | `boolean` | No | `false` | Display actual/expected differences inline within each string |
| `options.interfaces` | `boolean` | No | `false` | Display available interfaces |
| `options.noDeprecation` | `boolean` | No | `false` | Silence deprecation warnings |
| `options.noExit` | `boolean` | No | `false` | Require a clean shutdown of the event loop: mocha will exit |
| `options.noTimeouts` | `boolean` | No | `false` | Disables timeouts, given implicitly with `debug` |
| `options.opts` | `string` | No | `"test/mocha.opts"` | Specify opts path |
| `options.prof` | `boolean` | No | `false` | Log statistical profiling information |
| `options.recursive` | `boolean` | No | `false` | Include sub directories |
| `options.reporters` | `boolean` | No | `false` | Display available reporters |
| `options.throwDeprecation` | `boolean` | No | `false` | Throw an exception anytime a deprecated function is used |
| `options.trace` | `boolean` | No | `false` | Trace function calls |
| `options.traceDeprecation` | `boolean` | No | `false` | Show stack traces on deprecations |
| `options.watchExtensions` | `Array<string>` | No | `[]` | Additional extensions to monitor with `watch` |
| `options.delay` | `boolean` | No | `false` | Wait for async suite definition |

