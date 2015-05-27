'use strict';

var path = require('path');
var spawn = require('child_process').spawn;
var Promise = require('promise');

module.exports = function(config) {
	var files = config.files || null;
	var options = config.options || {};
	var api = this;
	if (!files) {
		throw new api.errors.TaskError('No files specified');
	}
	var filesArray = Array.isArray(files) ? files : [files];
	return launchMocha(filesArray, options);


	function launchMocha(files, options) {
		var mochaPath = path.join(getNpmModulePath('mocha'), 'bin', '_mocha');
		var parsedOptions = parseOptions(options);
		var cliOptions = formatCliOptions(parsedOptions);
		var args = [mochaPath].concat(cliOptions).concat(files);
		return spawnChildProcess(args);


		function getNpmModulePath(module) {
			return path.resolve(__dirname, '../../node_modules', module);
		}

		function parseOptions(options) {
			var clonedOptions = shallowCopy(options);
			if (clonedOptions.debug || clonedOptions.debugBrk) {
				clonedOptions.noTimeouts = true;
			}
			return clonedOptions;

			function shallowCopy(object) {
				return Object.keys(object).reduce(function(copy, key) {
					copy[key] = object[key];
					return copy;
				}, {});
			}
		}

		function formatCliOptions(options) {
			return Object.keys(options).map(function(key) {
				var value = options[key];
				var argName = convertCamelCaseToDashCase(key);
				if (!value) {
					return null;
				} else if (typeof value === 'boolean') {
					return formatBooleanOption(argName, value);
				} else if (typeof value === 'number') {
					return formatNumberOption(argName, value);
				} else if (typeof value === 'string') {
					return formatStringOption(argName, value);
				} else if (Array.isArray(value)) {
					return formatArrayOption(argName, value, ',');
				} else if (typeof value === 'object') {
					if (argName === 'compilers') {
						return formatKeyValueOption(argName, value, ':', ',');
					} else {
						return formatKeyValueOption(argName, value, '=', ',');
					}
				} else {
					throw new api.errors.TaskError('Invalid option: ' + key);
				}
			})
				.filter(function(arg) { return arg !== null; })
				.map(function(arg) {
					return arg.split(' ');
				})
				.reduce(function(args, arg) {
					return args.concat(arg);
				}, []);


			function formatBooleanOption(key, value) {
				if (!value) { return null; }
				return '--' + key;
			}

			function formatNumberOption(key, value) {
				return '--' + key + ' ' + value;
			}

			function formatStringOption(key, value) {
				return '--' + key + ' ' + value;
			}

			function formatArrayOption(key, value, separator) {
				if (value.length === 0) { return null; }
				var formattedValue = value.join(separator);
				return '--' + key + ' ' + formattedValue;
			}

			function formatKeyValueOption(key, value, assignment, separator) {
				var keys = Object.keys(value);
				if (keys.length === 0) { return null; }
				var formattedValue = keys.map(function(propertyKey) {
					var propertyValue = value[propertyKey];
					return propertyKey + assignment + propertyValue;
				}).join(separator);
				return '--' + key + ' ' + formattedValue;
			}

			function convertCamelCaseToDashCase(string) {
				return string.replace(/[A-Z]/g, function(match) {
					return '-' + match.toLowerCase();
				});
			}
		}

		function spawnChildProcess(args) {
			return new Promise(function(resolve, reject) {
				var childProcess = spawn(process.execPath, args, { stdio: 'inherit' });
				childProcess.on('exit', function(code, signal) {
					if (code === 0) {
						return resolve();
					} else if (code === 1) {
						return reject(new api.errors.TaskError('Tests failed'));
					} else if (signal) {
						return reject('Process terminated with ' + signal);
					} else {
						return reject();
					}
				});
				terminateOnSigint(childProcess);

				function terminateOnSigint() {
					process.on('SIGINT', onSigint);
					childProcess.on('exit', function(code, signal) {
						process.removeListener('SIGINT', onSigint);
					});


					function onSigint() {
						childProcess.kill('SIGINT');
						childProcess.kill('SIGTERM');
						process.kill(process.pid, 'SIGINT');
					}
				}
			});
		}
	}
};

module.exports.defaults = {
	files: null,
	options: {}
};

module.exports.description = 'Test JavaScript files using Mocha';
