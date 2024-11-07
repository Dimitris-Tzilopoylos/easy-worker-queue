export = CronQueue;
declare class CronQueue extends Queue {
  schedule(namespace: string, scheduleString: string, options?: any): any;
  getTasks(): any;
  getTask(namespace: string): any;
}
import Queue = require("./queue");
