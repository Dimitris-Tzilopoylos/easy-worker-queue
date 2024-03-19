export = CronQueue;
declare class CronQueue extends Queue {
    schedule(namespace: any, scheduleString: any, options: any): void;
    getTasks(): any;
    getTask(namespace: any): any;
}
import Queue = require("./queue");
