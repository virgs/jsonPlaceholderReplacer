"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Injection_1 = require("../src/Injection");
class ParentClassContainer {
    constructor() {
        this.default = null;
        this.create = (argument) => {
            for (const injectable in this.injectables) {
                const factoryPredicate = this.injectables[injectable].options.predicate;
                if (factoryPredicate && factoryPredicate(argument)) {
                    if (this.injectables[injectable].singletonInstance)
                        return this.injectables[injectable].singletonInstance;
                    else {
                        this.injectables[injectable].singletonInstance = new this.injectables[injectable].constructor(argument);
                        return this.injectables[injectable].singletonInstance;
                    }
                }
            }
            if (this.default) {
                if (this.default.singletonInstance)
                    return this.default.singletonInstance;
                else {
                    this.default.singletonInstance = new this.default.constructor(argument);
                    return this.default.singletonInstance;
                }
            }
            return null;
        };
        this.createAll = (argument) => {
            let returnList = [];
            for (const injectable in this.injectables) {
                returnList.push(new this.injectables[injectable].constructor(argument));
            }
            return returnList;
        };
        this.addInjectable = (injectable) => {
            if (injectable.options.creation == Injection_1.Injection.Creation.Default) {
                this.default = injectable;
            }
            else {
                if (this.injectables[injectable.name])
                    return null;
                this.injectables[injectable.name] = injectable;
            }
            return injectable;
        };
    }
}
exports.ParentClassContainer = ParentClassContainer;
