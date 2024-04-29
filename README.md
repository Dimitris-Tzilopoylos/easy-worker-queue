# Easy Worker Queue

Easy Worker Queue is a lightweight library designed for managing asynchronous tasks in Node.js applications efficiently, using worker threads. It simplifies the process of handling task execution, errors, and completion.

## Installation

You can install Easy Worker Queue via npm:

```bash
npm install easy-worker-queue
```

## Usage

```javascript
const { Queue } = require("easy-worker-queue");
const path = require("path");

// Create a new instance of the Queue
const queue = new Queue();

// Create a named queue "firstQueue" with a worker file and optional configurations
queue.createNameSpace("firstQueue", path.join(__dirname, "worker.js"), {
  isAsync: true,
  onError: (err) => {
    console.log(err);
  },
  onExit: (exitCode) => {
    console.log(exitCode);
  },
  onSuccess: (data) => {
    console.log(data);
  },
  jobsLimit: 5,
});

// Create another named queue "secondQueue" with a different worker file
queue.createNameSpace("secondQueue", path.join(__dirname, "other-worker.js"), {
  isAsync: true,
  onError: (err) => {
    console.log(err);
  },
  onExit: (exitCode) => {
    console.log(exitCode);
  },
  onSuccess: (data) => {
    console.log(data);
  },
});

// Enqueue tasks to the created queues at intervals
setInterval(() => {
  queue.enqueue("firstQueue", 123);
  queue.enqueue("secondQueue", { message: "ok" });
}, 5000);
```

## Explanation

In this example:

- **Note:** The `worker.js` file must be a JavaScript file that exports a default function using `module.exports`.
- Two named queues, "firstQueue" and "secondQueue", are created using `queue.createNameSpace()`.
- Each queue is associated with a specific worker file (`worker.js` and `other-worker.js`).
- Optional configuration options such as error handling (`onError`), exit handling (`onExit`), success handling (`onSuccess`), and job limit (`jobsLimit`) can be specified.
- Tasks are enqueued to the queues at regular intervals using `queue.enqueue()`.

### Using CronQueue for Scheduled Tasks

```javascript
const { CronQueue } = require("easy-worker-queue");
const path = require("path");

// Create a new instance of the CronQueue
const queue = new CronQueue();

// Create a named queue "firstQueue" with a worker file and optional configurations
queue.createNameSpace("firstQueue", path.join(__dirname, "worker.js"), {
  isAsync: true,
  onError: (err) => {
    console.log(err);
  },
  onExit: (exitCode) => {
    console.log(exitCode);
  },
  onSuccess: (data) => {
    console.log(data);
  },
  jobsLimit: 5,
});

// Create another named queue "secondQueue" with a different worker file
queue.createNameSpace("secondQueue", path.join(__dirname, "other-worker.js"), {
  isAsync: true,
  onError: (err) => {
    console.log(err);
  },
  onExit: (exitCode) => {
    console.log(exitCode);
  },
  onSuccess: (data) => {
    console.log(data);
  },
});

// Schedule tasks for the created queues using cron expressions
queue.schedule("firstQueue", "* * * * *");
queue.schedule("secondQueue", "*/3 * * * *");
```

## Explanation

In this example:

- **Note:** The `worker.js` file must be a JavaScript file that exports a default function using `module.exports`.
- Two named queues, "firstQueue" and "secondQueue", are created using `queue.createNameSpace()`.
- Each queue is associated with a specific worker file (`worker.js` and `other-worker.js`).
- Optional configuration options such as error handling (`onError`), exit handling (`onExit`), success handling (`onSuccess`), and job limit (`jobsLimit`) can be specified.
- The `CronQueue` class allows scheduling tasks based on cron expressions.
- The `schedule()` method of the `CronQueue` class is used to schedule tasks for each queue, specifying the cron expression.

## Properties

### `name`

- **Description**: Specifies the name of the queue namespace.
- **Type**: String
- **Example**: `"firstQueue"`

### `workerPath`

- **Description**: Specifies the path to the worker file associated with the queue.
- **Type**: String
- **Example**: `path.join(__dirname, "worker.js")`

### `options`

- **Description**: Optional configuration options for the queue.
- **Type**: Object
- **Properties**:
  - `isAsync`: Indicates whether the worker function is asynchronous.
    - **Type**: Boolean
    - **Default**: `false`
    - **Example**: `true`
  - `onError`: Callback function to handle errors that occur during task execution.
    - **Type**: Function
    - **Default**: `undefined`
    - **Example**:
      ```javascript
      onError: (err) => {
        console.log(err);
      };
      ```
  - `onExit`: Callback function to handle the exit event of the worker thread.
    - **Type**: Function
    - **Default**: `undefined`
    - **Example**:
      ```javascript
      onExit: (exitCode) => {
        console.log(exitCode);
      };
      ```
  - `onSuccess`: Callback function to handle successful completion of tasks.
    - **Type**: Function
    - **Default**: `undefined`
    - **Example**:
      ```javascript
      onSuccess: (data) => {
        console.log(data);
      };
      ```
  - `jobsLimit`: Specifies the maximum number of jobs that can be queued before skipping new ones.
    - **Type**: Number
    - **Default**: `undefined`
    - **Example**: `5`
