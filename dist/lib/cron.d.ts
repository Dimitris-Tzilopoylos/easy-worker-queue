export = CronQueue;
declare class CronQueue extends Queue {
  schedule(namespace: string, scheduleString: string, options?: any): void;
  getTasks(): any;
  getTask(namespace: string): any;
}
import Queue = require("./queue");
