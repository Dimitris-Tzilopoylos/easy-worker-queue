const { Worker } = require("worker_threads");
const EventEmitter = require("events");

class Queue {
  constructor() {
    this.namespaces = {};
  }

  createNameSpace(
    namespace,
    filepath,
    workerOptions = {
      isAsync: false,
      onSuccess: (data) => data,
      onError: (data) => data,
      onExit: (data) => data,
    }
  ) {
    return this._createNamespaceIfNotExists(namespace, filepath, workerOptions);
  }

  enqueue(namespace, data) {
    try {
      if (!this._namespaceExists(namespace)) {
        throw new Error(`Namespace: ${namespace} is not registered`);
      }

      this.namespaces[namespace].jobs.push(data);

      this.process(namespace);
    } catch (error) {
      console.log(error);
    }
  }

  dequeue(namespace) {
    if (this._namespaceJobsAreEmpty(namespace)) {
      return null;
    }
    return this.namespaces[namespace].jobs.shift();
  }

  process(namespace) {
    try {
      if (this._namespaceJobsAreEmpty(namespace)) {
        this._namespaceEndProcessing(namespace);
        return;
      }

      if (this._namespaceIsProcessing(namespace)) {
        return;
      }

      const worker = this._getNamespaceWorker(namespace);
      const jobData = this.dequeue(namespace);

      if (!jobData) {
        this._namespaceEndProcessing(namespace);
        return;
      }
      this._namespaceProcessing(namespace);
      worker.postMessage(
        JSON.stringify({
          namespace,
          isAsync: this._getNamespaceAsyncMode(namespace),
          executable: this._getNamespaceExecutablePath(namespace),
          data: jobData,
        })
      );
    } catch (error) {
      console.log(error);
    }
  }

  _createNamespaceIfNotExists(namespace, filepath, workerOptions) {
    if (!this.namespaces[namespace]) {
      const { isAsync, onSuccess, onError, onExit, ...options } =
        workerOptions || {};
      const emitter = this.setupNamespaceEmitter(namespace, {
        onSuccess,
        onError,
        onExit,
      });

      this.namespaces[namespace] = {
        jobs: [],
        isProcessing: false,
        filepath,
        isAsync,
        worker: null,
        emitter,
      };
      const makeWorker = () => {
        const worker = new Worker(__dirname + "/worker.js", options);
        worker.on("error", (err) => {
          this.publishErrorMessage(namespace, err);
        });
        worker.on("message", (val) => {
          const data = this.toWorkerResultPayload(val);
          if (data) {
            try {
              const { error } = data;
              const handler = error
                ? this.publishErrorMessage.bind(this)
                : this.publishMessage.bind(this);
              handler(namespace, data);
            } catch (error) {
              console.log(error);
            }
          }

          this._namespaceEndProcessing(namespace);
          this.process(namespace);
        });
        worker.on("exit", (exitCode) => {
          console.log(`Worker ${namespace} exited with code ${exitCode}`);
          this.publishExitMessage(namespace, exitCode);
          delete this.namespaces[namespace];
        });
        return worker;
      };

      this.namespaces[namespace].worker = makeWorker;
      return true;
    }

    return false;
  }

  _namespaceExists(namespace) {
    return this.namespaces[namespace];
  }

  _namespaceJobsAreEmpty(namespace) {
    return !this.namespaces[namespace]?.jobs?.length;
  }

  _namespaceProcessing(namespace) {
    this.namespaces[namespace].isProcessing = true;
  }

  _namespaceEndProcessing(namespace) {
    this.namespaces[namespace].isProcessing = false;
  }

  _namespaceIsProcessing(namespace) {
    return !!this.namespaces[namespace].isProcessing;
  }

  _getNamespaceWorker(namespace) {
    try {
      const worker = this.namespaces[namespace]?.worker;
      if (typeof worker === "function") {
        this.namespaces[namespace].worker = this.namespaces[namespace].worker();
      }
      return this.namespaces[namespace].worker;
    } catch (error) {
      return null;
    }
  }
  _getNamespaceAsyncMode(namespace) {
    return this.namespaces[namespace]?.isAsync;
  }

  _getNamespaceExecutablePath(namespace) {
    return this.namespaces[namespace]?.filepath;
  }

  _getNamespaceEmitter(namespace) {
    return this.namespaces[namespace]?.emitter;
  }

  publishMessage(namespace, data) {
    try {
      const emitter = this._getNamespaceEmitter(namespace);
      if (emitter) {
        emitter.emit("message", data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  publishErrorMessage(namespace, data) {
    try {
      const emitter = this._getNamespaceEmitter(namespace);
      if (emitter) {
        emitter.emit("error", data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  publishExitMessage(namespace, exitCode) {
    try {
      const emitter = this._getNamespaceEmitter(namespace);
      if (emitter) {
        emitter.emit("exit", exitCode);
      }
    } catch (error) {
      console.log(error);
    }
  }

  setupNamespaceEmitter(namespace, handlers) {
    try {
      const emitter = new EventEmitter();
      emitter.on("message", (data) => {
        handlers?.onSuccess?.(data);
      });
      emitter.on("error", (data) => handlers?.onError?.(data));
      emitter.on("exit", (data) => handlers?.onExit?.(data));
      return emitter;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  dropNamespaceEmitter(namespace) {
    try {
      this.namespaces[namespace].emitter.removeAllListeners("message");
      this.namespaces[namespace].emitter.removeAllListeners("error");
      this.namespaces[namespace].emitter.removeAllListeners("exit");
    } catch (error) {
      console.log(error);
    }
  }

  toWorkerResultPayload(data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  dropNamespace(namespace) {
    try {
      if (!this._namespaceExists(namespace)) {
        return;
      }

      this._getNamespaceWorker(namespace)?.terminate?.();
      this.dropNamespaceEmitter(namespace);
      delete this.namespaces[namespace];
    } catch (error) {}
  }

  getNamespaceRemainingJobs(namespace) {
    try {
      if (!this._namespaceExists(namespace)) {
        return 0;
      }

      return this.namespaces[namespace].jobs.length;
    } catch (error) {
      return 0;
    }
  }

  getNamespaceJobs(namespace) {
    try {
      if (!this._namespaceExists(namespace)) {
        return [];
      }
      return [...this.namespaces[namespace].jobs];
    } catch (error) {
      return [];
    }
  }
}

module.exports = Queue;
