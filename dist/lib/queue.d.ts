export = Queue;
declare class Queue {
  static sleep(seconds: number): any;
  namespaces: {};
  sleep(seconds: number): any;
  createNameSpace(
    namespace: string,
    filepath: string,
    options?: {
      isAsync?: boolean;
      onSuccess?: (data: any) => any;
      onError?: (data: any) => any;
      onExit?: (data: any) => any;
      jobsLimit?: number;
    }
  ): boolean;
  enqueue(namespace: string, data?: any): void;
  dequeue(namespace: any): any;
  process(namespace: any): void;
  _createNamespaceIfNotExists(
    namespace: any,
    filepath: any,
    workerOptions: any
  ): boolean;
  _namespaceExists(namespace: any): any;
  _namespaceJobsAreEmpty(namespace: any): boolean;
  _namespaceProcessing(namespace: any): void;
  _namespaceEndProcessing(namespace: any): void;
  _namespaceIsProcessing(namespace: any): boolean;
  _getNamespaceWorker(namespace: any): any;
  _getNamespaceAsyncMode(namespace: any): any;
  _getNamespaceExecutablePath(namespace: any): any;
  _getNamespaceEmitter(namespace: any): any;
  publishMessage(namespace: any, data: any): void;
  publishErrorMessage(namespace: any, data: any): void;
  publishExitMessage(namespace: any, exitCode: any): void;
  setupNamespaceEmitter(namespace: any, handlers: any): any;
  dropNamespaceEmitter(namespace: any): void;
  toWorkerResultPayload(data: any): any;
  dropNamespace(namespace: string): void;
  getNamespaceRemainingJobs(namespace: string): any;
  getNamespaceJobs(namespace: string): any[];
}
