const cron = require("node-cron");
const Queue = require("./queue");
class CronQueue extends Queue {
  constructor() {
    super();
  }

  schedule(namespace, scheduleString, options) {
    if (!this._namespaceExists(namespace)) {
      return;
    }
    const { data } = options || {};
    const task = cron.schedule(
      scheduleString,
      () => {
        this.enqueue(namespace, { taskID: task.options.name, namespace, data });
      },
      { ...options, name: namespace }
    );
  }

  getTasks() {
    return cron.getTasks();
  }

  getTask(namespace) {
    return this.getTasks()?.get(namespace);
  }
}

module.exports = CronQueue;
