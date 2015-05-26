'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var Promise = require('promise');

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('task:mocha', function() {
	var mockApi;
	var mockSpawn;
	var mockProcess;
	var task;
	before(function() {
		mockApi = createMockApi();
		mockProcess = createMockProcess();
		mockSpawn = createMockSpawn();
		task = rewire('../../lib/tasks/mocha');
		task.__set__('process', mockProcess);
		task.__set__('spawn', mockSpawn);
	});

	afterEach(function() {
		mockProcess.reset();
		mockSpawn.reset();
	});

	function createMockApi() {
		return {
			errors: {
				TaskError: createCustomError('TaskError')
			}
		};

		function createCustomError(type) {
			function CustomError(message) {
				this.message = message;
			}

			CustomError.prototype = Object.create(Error.prototype);
			CustomError.prototype.name = type;

			return CustomError;
		}
	}

	function createMockProcess() {
		var mockProcess = new EventEmitter();
		mockProcess.execPath = process.execPath;
		mockProcess.pid = process.pid;
		mockProcess.kill = sinon.spy(function(pid, signal) {});
		mockProcess.reset = function() {
			this.kill.reset();
		};
		return mockProcess;
	}

	function createMockSpawn() {
		var spawn = sinon.spy(function(command, args, options) {
			var childProcess = new EventEmitter();
			childProcess.kill = sinon.spy(function(signal) {
				childProcess.emit('exit', null, signal);
			});
			var didReceiveSigint = args.some(function(arg) {
				return path.basename(arg) === 'sigint.spec.js';
			});
			var testsDidThrowError = args.some(function(arg) {
				return path.basename(arg) === 'error.spec.js';
			});
			var testsDidFail = args.some(function(arg) {
				return path.basename(arg) === 'failure.spec.js';
			});
			setTimeout(function() {
				if (didReceiveSigint) {
					simulateSigint();
				} else if (testsDidThrowError) {
					simulateError(childProcess);
				} else if (testsDidFail) {
					simulateTestsFailed(childProcess);
				} else {
					simulateTestsPassed(childProcess);
				}

				function simulateSigint() {
					mockProcess.emit('SIGINT');
				}

				function simulateTestsPassed(childProcess) {
					childProcess.emit('exit', 0, null);
				}

				function simulateTestsFailed(childProcess) {
					childProcess.emit('exit', 1, null);
				}

				function simulateError(childProcess) {
					childProcess.emit('exit', 2, null);
				}
			});
			spawn.instance = childProcess;
			return childProcess;
		});
		var reset = spawn.reset;
		spawn.reset = function() {
			reset.call(spawn);
			delete spawn.instance;
		};
		return spawn;
	}

	it('should have a description', function() {
		expect(task.description).to.be.a('string');
	});

	it('should specify default configuration', function() {
		expect(task.defaults).to.eql({
			files: null,
			options: {}
		});
	});

	it('should throw an error if no files are specified', function() {
		var attempts = [
			function() { return task.call(mockApi, { options: {} }); },
			function() { return task.call(mockApi, { files: undefined, options: {} }); },
			function() { return task.call(mockApi, { files: null, options: {} }); },
			function() { return task.call(mockApi, { files: false, options: {} }); },
			function() { return task.call(mockApi, { files: '', options: {} }); }
		];
		attempts.forEach(function(attempt) {
			expect(attempt).to.throw(mockApi.errors.TaskError);
			expect(attempt).to.throw('No files');
		});
	});

	it('should run tests (tests passed)', function() {
		var promise = task.call(mockApi, {
			files: [
				'/project/tests/success.spec.js',
				'/project/tests/success.spec.js',
				'/project/tests/success.spec.js'
			],
			options: {
				asyncOnly: true,
				colors: true,
				noColors: true,
				growl: true,
				reporterOptions: {
					foo: 'bar',
					baz: 'qux'
				},
				reporter: 'dot',
				sort: true,
				bail: true,
				debug: true,
				grep: 'foobar',
				fgrep: 'foobar',
				exposeGc: true,
				invert: true,
				require: 'foobar',
				slow: 100,
				timeout: 200,
				ui: 'bdd',
				watch: true,
				checkLeaks: true,
				compilers: {
					foo: 'bar',
					baz: 'qux'
				},
				debugBrk: true,
				globals: [
					'foo',
					'bar'
				],
				inlineDiffs: true,
				interfaces: true,
				noDeprecation: true,
				noExit: true,
				noTimeouts: true,
				opts: 'test/mocha.opts',
				prof: true,
				recursive: true,
				reporters: true,
				throwDeprecation: true,
				trace: true,
				traceDeprecation: true,
				watchExtensions: [
					'foo',
					'bar'
				],
				delay: true
			}
		});
		return expect(promise).to.eventually.equal(undefined)
			.then(function() {
				var mochaPath = path.resolve(__dirname, '../../node_modules', 'mocha', 'bin/_mocha');
				var expectedPath = process.execPath;
				var expectedArgs = [
					mochaPath,
					'--async-only',
					'--colors',
					'--no-colors',
					'--growl',
					'--reporter-options', 'foo=bar,baz=qux',
					'--reporter', 'dot',
					'--sort',
					'--bail',
					'--debug',
					'--grep', 'foobar',
					'--fgrep', 'foobar',
					'--expose-gc',
					'--invert',
					'--require', 'foobar',
					'--slow', '100',
					'--timeout', '200',
					'--ui', 'bdd',
					'--watch',
					'--check-leaks',
					'--compilers', 'foo:bar,baz:qux',
					'--debug-brk',
					'--globals', 'foo,bar',
					'--inline-diffs',
					'--interfaces',
					'--no-deprecation',
					'--no-exit',
					'--no-timeouts',
					'--opts', 'test/mocha.opts',
					'--prof',
					'--recursive',
					'--reporters',
					'--throw-deprecation',
					'--trace',
					'--trace-deprecation',
					'--watch-extensions', 'foo,bar',
					'--delay',
					'/project/tests/success.spec.js',
					'/project/tests/success.spec.js',
					'/project/tests/success.spec.js'
				];
				var expectedOptions = {
					stdio: 'inherit'
				};
				expect(mockSpawn).to.have.been.calledWith(
					expectedPath,
					expectedArgs,
					expectedOptions
				);
			});
	});

	it('should run tests (tests failed)', function() {
		var promise = task.call(mockApi, {
			files: [
				'/project/tests/success.spec.js',
				'/project/tests/success.spec.js',
				'/project/tests/failure.spec.js'
			],
			options: {}
		});
		return Promise.all([
			expect(promise).to.be.rejectedWith(mockApi.errors.TaskError),
			expect(promise).to.be.rejectedWith('Tests failed')
		]);
	});

	it('should run tests (error)', function() {
		var promise = task.call(mockApi, {
			files: [
				'/project/tests/success.spec.js',
				'/project/tests/failure.spec.js',
				'/project/tests/error.spec.js'
			],
			options: {}
		});
		return expect(promise).to.be.rejectedWith(undefined);
	});

	it('should run tests (SIGINT)', function() {
		var sigintListeners = mockProcess.listeners('SIGINT');
		var promise = task.call(mockApi, {
			files: [
				'/project/tests/success.spec.js',
				'/project/tests/failure.spec.js',
				'/project/tests/sigint.spec.js'
			],
			options: {}
		});
		return expect(promise).to.be.rejectedWith(undefined)
			.then(function() {
				expect(mockSpawn.instance.kill).to.have.been.calledTwice;
				expect(mockSpawn.instance.kill).to.have.been.calledWith('SIGINT');
				expect(mockSpawn.instance.kill).to.have.been.calledWith('SIGTERM');
				expect(mockProcess.kill).to.have.been.calledWith(mockProcess.pid, 'SIGINT');
				expect(mockProcess.listeners('SIGINT')).to.eql(sigintListeners);
			});
	});

	it('should convert files string into array of files)', function() {
		return task.call(mockApi, {
			files: '/project/tests/success.spec.js',
			options: {}
		})
			.then(function(returnValue) {
				var mochaPath = path.resolve(__dirname, '../../node_modules', 'mocha', 'bin/_mocha');
				var expectedPath = process.execPath;
				var expectedArgs = [
					mochaPath,
					'/project/tests/success.spec.js'
				];
				var expectedOptions = {
					stdio: 'inherit'
				};
				expect(mockSpawn).to.have.been.calledWith(
					expectedPath,
					expectedArgs,
					expectedOptions
				);
			});
	});

	it('should enable "--no-timeouts" flag if "debug" flag is enabled', function() {
		var promise = task.call(mockApi, {
			files: [
				'/project/tests/success.spec.js',
				'/project/tests/success.spec.js',
				'/project/tests/success.spec.js'
			],
			options: {
				debug: true
			}
		});
		return expect(promise).to.eventually.equal(undefined)
			.then(function() {
				var mochaPath = path.resolve(__dirname, '../../node_modules', 'mocha', 'bin/_mocha');
				var expectedPath = process.execPath;
				var expectedArgs = [
					mochaPath,
					'--debug',
					'--no-timeouts',
					'/project/tests/success.spec.js',
					'/project/tests/success.spec.js',
					'/project/tests/success.spec.js'
				];
				var expectedOptions = {
					stdio: 'inherit'
				};
				expect(mockSpawn).to.have.been.calledWith(
					expectedPath,
					expectedArgs,
					expectedOptions
				);
			});
	});

	it('should enable "--no-timeouts" flag if "debug-brk" flag is enabled', function() {
		var promise = task.call(mockApi, {
			files: [
				'/project/tests/success.spec.js',
				'/project/tests/success.spec.js',
				'/project/tests/success.spec.js'
			],
			options: {
				debugBrk: true
			}
		});
		return expect(promise).to.eventually.equal(undefined)
			.then(function() {
				var mochaPath = path.resolve(__dirname, '../../node_modules', 'mocha', 'bin/_mocha');
				var expectedPath = process.execPath;
				var expectedArgs = [
					mochaPath,
					'--debug-brk',
					'--no-timeouts',
					'/project/tests/success.spec.js',
					'/project/tests/success.spec.js',
					'/project/tests/success.spec.js'
				];
				var expectedOptions = {
					stdio: 'inherit'
				};
				expect(mockSpawn).to.have.been.calledWith(
					expectedPath,
					expectedArgs,
					expectedOptions
				);
			});
	});
});
