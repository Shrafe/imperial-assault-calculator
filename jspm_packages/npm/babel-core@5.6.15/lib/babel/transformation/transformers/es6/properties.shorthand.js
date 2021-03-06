/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../../../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var visitor = {
  Property: function Property(node) {
    if (node.method) {
      node.method = false;
    }

    if (node.shorthand) {
      node.shorthand = false;
    }
  }
};
exports.visitor = visitor;