var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b)
            if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError(
          "Class extends value " + String(b) + " is not a constructor or null"
        );
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var cron = require("node-cron");
var Queue = require("./queue");
var CronQueue = /** @class */ (function (_super) {
  __extends(CronQueue, _super);
  function CronQueue() {
    return _super.call(this) || this;
  }
  CronQueue.prototype.schedule = function (namespace, scheduleString, options) {
    var _this = this;
    if (!this._namespaceExists(namespace)) {
      return;
    }
    var data = (options || {}).data;
    var task = cron.schedule(
      scheduleString,
      function () {
        _this.enqueue(namespace, {
          taskID: task.options.name,
          namespace: namespace,
          data: data,
        });
      },
      __assign(__assign({}, options), { name: namespace })
    );
    return task;
  };
  CronQueue.prototype.getTasks = function () {
    return cron.getTasks();
  };
  CronQueue.prototype.getTask = function (namespace) {
    var _a;
    return (_a = this.getTasks()) === null || _a === void 0
      ? void 0
      : _a.get(namespace);
  };
  return CronQueue;
})(Queue);
module.exports = CronQueue;
