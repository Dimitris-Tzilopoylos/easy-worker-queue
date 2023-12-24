const path = require("path");
const Queue = require("./lib/queue/queue");

const queue = new Queue();

queue.createNameSpace("test", path.join(process.cwd(), "test.js"), {
  isAsync: true,
  onSuccess: (data) => console.log("success", data),
});

let i = 0;
while (i < 5) {
  console.log(queue.getNamespaceRemainingJobs("test"));
  queue.enqueue("test", Math.floor(Math.random() * 8));
  i++;
}
let z = 0;
let interval = setInterval(() => {
  queue.enqueue("test", Math.floor(Math.random() * 8));
}, 2000);
