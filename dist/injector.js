"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Injection_1 = require("./Injection");
const container_1 = require("./container");
function Injectable(options) {
    return function (constructor) {
        var superClassName = Object.getPrototypeOf(constructor.prototype).constructor.name;
        const className = constructor.prototype.constructor.name;
        const injectableContainer = container_1.Container.getSuperClassContainer(superClassName);
        let mergedOption = Injection_1.Injection.createdDefaultOption(options);
        injectableContainer
            .addInjectable({
            name: className,
            constructor: constructor,
            options: mergedOption
        });
    };
}
exports.Injectable = Injectable;
