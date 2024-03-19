var path = require("path");
var Queue = require("./lib/queue");
// const queue = new Queue();
// queue.createNameSpace("test", path.join(process.cwd(), "test.js"), {
//   isAsync: true,
//   onSuccess: (data) => console.log("success", data),
// });
// let i = 0;
// while (i < 5) {
//   console.log(queue.getNamespaceRemainingJobs("test"));
//   queue.enqueue("test", { id: Math.floor(Math.random() * 8) + 1 });
//   i++;
// }
// let z = 0;
// let interval = setInterval(() => {
//   queue.enqueue("test", { id: Math.floor(Math.random() * 8) + 1 });
// }, 2000);
module.exports = Queue;
