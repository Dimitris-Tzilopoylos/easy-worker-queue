var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var Worker = require("worker_threads").Worker;
var EventEmitter = require("events");
var Queue = /** @class */ (function () {
    function Queue() {
        this.namespaces = {};
    }
    Queue.prototype.createNameSpace = function (namespace, filepath, workerOptions) {
        if (workerOptions === void 0) { workerOptions = {
            isAsync: false,
            onSuccess: function (data) { return data; },
            onError: function (data) { return data; },
            onExit: function (data) { return data; }
        }; }
        return this._createNamespaceIfNotExists(namespace, filepath, workerOptions);
    };
    Queue.prototype.enqueue = function (namespace, data) {
        try {
            if (!this._namespaceExists(namespace)) {
                throw new Error("Namespace: " + namespace + " is not registered");
            }
            this.namespaces[namespace].jobs.push(data);
            this.process(namespace);
        }
        catch (error) {
            console.log(error);
        }
    };
    Queue.prototype.dequeue = function (namespace) {
        if (this._namespaceJobsAreEmpty(namespace)) {
            return null;
        }
        return this.namespaces[namespace].jobs.shift();
    };
    Queue.prototype.process = function (namespace) {
        try {
            if (this._namespaceJobsAreEmpty(namespace)) {
                this._namespaceEndProcessing(namespace);
                return;
            }
            if (this._namespaceIsProcessing(namespace)) {
                return;
            }
            var worker = this._getNamespaceWorker(namespace);
            var jobData = this.dequeue(namespace);
            if (!jobData) {
                this._namespaceEndProcessing(namespace);
                return;
            }
            this._namespaceProcessing(namespace);
            worker.postMessage(JSON.stringify({
                namespace: namespace,
                isAsync: this._getNamespaceAsyncMode(namespace),
                executable: this._getNamespaceExecutablePath(namespace),
                data: jobData
            }));
        }
        catch (error) {
            console.log(error);
        }
    };
    Queue.prototype._createNamespaceIfNotExists = function (namespace, filepath, workerOptions) {
        var _this = this;
        if (!this.namespaces[namespace]) {
            var _a = workerOptions || {}, isAsync = _a.isAsync, onSuccess = _a.onSuccess, onError = _a.onError, onExit = _a.onExit, options_1 = __rest(_a, ["isAsync", "onSuccess", "onError", "onExit"]);
            var emitter = this.setupNamespaceEmitter(namespace, {
                onSuccess: onSuccess,
                onError: onError,
                onExit: onExit
            });
            this.namespaces[namespace] = {
                jobs: [],
                isProcessing: false,
                filepath: filepath,
                isAsync: isAsync,
                worker: null,
                emitter: emitter
            };
            var makeWorker = function () {
                var worker = new Worker(__dirname + "/worker.js", options_1);
                worker.on("error", function (err) {
                    _this.publishErrorMessage(namespace, err);
                });
                worker.on("message", function (val) {
                    var data = _this.toWorkerResultPayload(val);
                    if (data) {
                        try {
                            var error = data.error;
                            var handler = error
                                ? _this.publishErrorMessage.bind(_this)
                                : _this.publishMessage.bind(_this);
                            handler(namespace, data);
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }
                    _this._namespaceEndProcessing(namespace);
                    _this.process(namespace);
                });
                worker.on("exit", function (exitCode) {
                    console.log("Worker " + namespace + " exited with code " + exitCode);
                    _this.publishExitMessage(namespace, exitCode);
                    delete _this.namespaces[namespace];
                });
                return worker;
            };
            this.namespaces[namespace].worker = makeWorker;
            return true;
        }
        return false;
    };
    Queue.prototype._namespaceExists = function (namespace) {
        return this.namespaces[namespace];
    };
    Queue.prototype._namespaceJobsAreEmpty = function (namespace) {
        var _a, _b;
        return !((_b = (_a = this.namespaces[namespace]) === null || _a === void 0 ? void 0 : _a.jobs) === null || _b === void 0 ? void 0 : _b.length);
    };
    Queue.prototype._namespaceProcessing = function (namespace) {
        this.namespaces[namespace].isProcessing = true;
    };
    Queue.prototype._namespaceEndProcessing = function (namespace) {
        this.namespaces[namespace].isProcessing = false;
    };
    Queue.prototype._namespaceIsProcessing = function (namespace) {
        return !!this.namespaces[namespace].isProcessing;
    };
    Queue.prototype._getNamespaceWorker = function (namespace) {
        var _a;
        try {
            var worker = (_a = this.namespaces[namespace]) === null || _a === void 0 ? void 0 : _a.worker;
            if (typeof worker === "function") {
                this.namespaces[namespace].worker = this.namespaces[namespace].worker();
            }
            return this.namespaces[namespace].worker;
        }
        catch (error) {
            return null;
        }
    };
    Queue.prototype._getNamespaceAsyncMode = function (namespace) {
        var _a;
        return (_a = this.namespaces[namespace]) === null || _a === void 0 ? void 0 : _a.isAsync;
    };
    Queue.prototype._getNamespaceExecutablePath = function (namespace) {
        var _a;
        return (_a = this.namespaces[namespace]) === null || _a === void 0 ? void 0 : _a.filepath;
    };
    Queue.prototype._getNamespaceEmitter = function (namespace) {
        var _a;
        return (_a = this.namespaces[namespace]) === null || _a === void 0 ? void 0 : _a.emitter;
    };
    Queue.prototype.publishMessage = function (namespace, data) {
        try {
            var emitter = this._getNamespaceEmitter(namespace);
            if (emitter) {
                emitter.emit("message", data);
            }
        }
        catch (error) {
            console.log(error);
        }
    };
    Queue.prototype.publishErrorMessage = function (namespace, data) {
        try {
            var emitter = this._getNamespaceEmitter(namespace);
            if (emitter) {
                emitter.emit("error", data);
            }
        }
        catch (error) {
            console.log(error);
        }
    };
    Queue.prototype.publishExitMessage = function (namespace, exitCode) {
        try {
            var emitter = this._getNamespaceEmitter(namespace);
            if (emitter) {
                emitter.emit("exit", exitCode);
            }
        }
        catch (error) {
            console.log(error);
        }
    };
    Queue.prototype.setupNamespaceEmitter = function (namespace, handlers) {
        try {
            var emitter = new EventEmitter();
            emitter.on("message", function (data) {
                var _a;
                (_a = handlers === null || handlers === void 0 ? void 0 : handlers.onSuccess) === null || _a === void 0 ? void 0 : _a.call(handlers, data);
            });
            emitter.on("error", function (data) { var _a; return (_a = handlers === null || handlers === void 0 ? void 0 : handlers.onError) === null || _a === void 0 ? void 0 : _a.call(handlers, data); });
            emitter.on("exit", function (data) { var _a; return (_a = handlers === null || handlers === void 0 ? void 0 : handlers.onExit) === null || _a === void 0 ? void 0 : _a.call(handlers, data); });
            return emitter;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    };
    Queue.prototype.dropNamespaceEmitter = function (namespace) {
        try {
            this.namespaces[namespace].emitter.removeAllListeners("message");
            this.namespaces[namespace].emitter.removeAllListeners("error");
            this.namespaces[namespace].emitter.removeAllListeners("exit");
        }
        catch (error) {
            console.log(error);
        }
    };
    Queue.prototype.toWorkerResultPayload = function (data) {
        try {
            return JSON.parse(data);
        }
        catch (error) {
            return null;
        }
    };
    Queue.prototype.dropNamespace = function (namespace) {
        var _a, _b;
        try {
            if (!this._namespaceExists(namespace)) {
                return;
            }
            (_b = (_a = this._getNamespaceWorker(namespace)) === null || _a === void 0 ? void 0 : _a.terminate) === null || _b === void 0 ? void 0 : _b.call(_a);
            this.dropNamespaceEmitter(namespace);
            delete this.namespaces[namespace];
        }
        catch (error) { }
    };
    Queue.prototype.getNamespaceRemainingJobs = function (namespace) {
        try {
            if (!this._namespaceExists(namespace)) {
                return 0;
            }
            return this.namespaces[namespace].jobs.length;
        }
        catch (error) {
            return 0;
        }
    };
    Queue.prototype.getNamespaceJobs = function (namespace) {
        try {
            if (!this._namespaceExists(namespace)) {
                return [];
            }
            return __spreadArrays(this.namespaces[namespace].jobs);
        }
        catch (error) {
            return [];
        }
    };
    return Queue;
}());
module.exports = Queue;
