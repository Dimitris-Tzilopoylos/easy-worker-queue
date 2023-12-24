const { parentPort } = require("worker_threads");

parentPort.on("message", async (inputData) => {
  let startTime = performance.now();
  const { executable, data, isAsync = true, namespace } = JSON.parse(inputData);
  try {
    const result = isAsync
      ? await require(executable)(data)
      : require(executable)(data);
    let endTime = performance.now();
    let executionTime = endTime - startTime;
    parentPort.postMessage(
      JSON.stringify({
        inputData: data,
        result,
        executionTime,
        executionTimeScale: "ms",
        namespace,
        error: false,
      })
    );
  } catch (error) {
    let endTime = performance.now();
    let executionTime = endTime - startTime;
    parentPort.postMessage(
      JSON.stringify({
        result: error.message,
        inputData: data,
        executionTime,
        executionTimeScale: "ms",
        namespace,
        error: true,
      })
    );
  }
});
