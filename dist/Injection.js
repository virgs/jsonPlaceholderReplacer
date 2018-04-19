"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Injection;
(function (Injection) {
    let Scope;
    (function (Scope) {
        Scope[Scope["Singleton"] = 0] = "Singleton";
        Scope[Scope["Request"] = 1] = "Request";
    })(Scope = Injection.Scope || (Injection.Scope = {}));
    ;
    let Creation;
    (function (Creation) {
        Creation[Creation["Multi"] = 0] = "Multi";
        Creation[Creation["Default"] = 1] = "Default";
    })(Creation = Injection.Creation || (Injection.Creation = {}));
    ;
    function createdDefaultOption(option) {
        if (typeof option == "undefined")
            return {
                scope: Scope.Request,
                creation: Creation.Default
            };
        let defaultOption = {
            scope: option.scope || Scope.Request
        };
        if (option.creation)
            defaultOption.creation = option.creation;
        else if (option.predicate)
            defaultOption.predicate = option.predicate;
        else
            defaultOption.creation = Creation.Default;
        return defaultOption;
    }
    Injection.createdDefaultOption = createdDefaultOption;
})(Injection = exports.Injection || (exports.Injection = {}));
