"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JsonPlaceholderReplacer = /** @class */ (function () {
    function JsonPlaceholderReplacer() {
        var _this = this;
        this.variablesMap = [];
        this.replaceChildren = function (node) {
            for (var key in node) {
                var attribute = node[key];
                if (typeof attribute == 'object') {
                    node[key] = _this.replaceChildren(attribute);
                }
                else {
                    node[key] = _this.replaceValue(attribute.toString());
                }
            }
            return node;
        };
    }
    JsonPlaceholderReplacer.prototype.addVariableMap = function (variableMap) {
        this.variablesMap.unshift(variableMap);
        return this;
    };
    JsonPlaceholderReplacer.prototype.replace = function (json) {
        return this.replaceChildren(json);
    };
    JsonPlaceholderReplacer.prototype.replaceValue = function (node) {
        var _this = this;
        var output = node.replace(/{{\w+}}/g, function (placeHolder) {
            var key = placeHolder.substr(2, placeHolder.length - 4);
            return _this.checkInEveryMap(key) || placeHolder;
        });
        try {
            return JSON.parse(output);
        }
        catch (exc) {
            return output;
        }
    };
    JsonPlaceholderReplacer.prototype.checkInEveryMap = function (key) {
        var map = {};
        for (var _i = 0, _a = this.variablesMap; _i < _a.length; _i++) {
            map = _a[_i];
            var variableValue = map[key];
            if (variableValue) {
                if (typeof variableValue == 'object') {
                    return JSON.stringify(variableValue);
                }
                return variableValue;
            }
        }
        return null;
    };
    return JsonPlaceholderReplacer;
}());
exports.JsonPlaceholderReplacer = JsonPlaceholderReplacer;
