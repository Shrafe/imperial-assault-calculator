/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../../../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _types = require("../../../types");

var t = _interopRequireWildcard(_types);

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var metadata = {
  group: "builtin-trailing"
};

exports.metadata = metadata;
var visitor = {
  MemberExpression: {
    exit: function exit(node) {
      var prop = node.property;
      if (!node.computed && t.isIdentifier(prop) && !t.isValidIdentifier(prop.name)) {
        // foo.default -> foo["default"]
        node.property = t.literal(prop.name);
        node.computed = true;
      }
    }
  }
};
exports.visitor = visitor;