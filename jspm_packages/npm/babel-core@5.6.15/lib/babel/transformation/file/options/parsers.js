/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../../../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;
exports.transformerList = transformerList;
exports.number = number;
exports.boolean = boolean;
exports.booleanString = booleanString;
exports.list = list;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _util = require("../../../util");

var util = _interopRequireWildcard(_util);

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function transformerList(val) {
  return util.arrayify(val);
}

transformerList.validate = function (key, val, pipeline) {
  if (val.indexOf("all") >= 0 || val.indexOf(true) >= 0) {
    val = Object.keys(pipeline.transformers);
  }

  return pipeline._ensureTransformerNames(key, val);
};

function number(val) {
  return +val;
}

function boolean(val) {
  return !!val;
}

function booleanString(val) {
  return util.booleanify(val);
}

function list(val) {
  return util.list(val);
}