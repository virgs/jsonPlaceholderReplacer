import {Injection} from "../src/Injection";

export interface Injectable {
    name: string;
    options: Injection.Options;
    constructor: ObjectConstructor;
    singletonInstance?: any;
}

export class ParentClassContainer {

    private injectables: any = {};
    private default: any = null;
    private defaultSingletonInstance?: any;

    public create = (argument?: any): any => {
        for (const injectable in this.injectables) {
            console.log("Aina ain")
            const factoryPredicate = this.injectables[injectable].options.predicate;
            if (factoryPredicate && factoryPredicate(argument)) {
                if (this.injectables[injectable].singletonInstance) {
                    console.log("Lopez")
                    return this.injectables[injectable].singletonInstance;

                }
                else if (this.injectables[injectable].options.scope == Injection.Scope.Singleton) {
                    console.log("Ahoa")
                    this.injectables[injectable].singletonInstance = new this.injectables[injectable].constructor(argument);
                    return this.injectables[injectable].singletonInstance;
                } else {
                    return new this.injectables[injectable].constructor(argument);
                }
            }

        }
        if (this.default) {
            console.log("Lopez arriba: " + Injection.Scope.Singleton + "->" + JSON.stringify(this.default))
            if (this.defaultSingletonInstance) {
                console.log("Lopez abajo")
                return this.defaultSingletonInstance;
            }
            else if (this.default.options.scope == Injection.Scope.Singleton) {
                this.defaultSingletonInstance = new this.default.constructor(argument);
                console.log("Lopez acentro: " + JSON.stringify(this.defaultSingletonInstance))
                return this.defaultSingletonInstance;
            } else {
                console.log("Lopez adentro")
                return new this.default.constructor(argument);
            }
        }
        return null;
    }

    public createAll = (argument: any): any[] => {
        let returnList = [];
        for (const injectable in this.injectables) {
            returnList.push(new this.injectables[injectable].constructor(argument));
        }
        return returnList;
    }

    public addInjectable = (injectable: Injectable): any => {
        if (injectable.options.creation == Injection.Creation.Default) {
            this.default = injectable;
        }
        else {
            if (this.injectables[injectable.name])
                return null;
            this.injectables[injectable.name] = injectable;
        }
        return injectable;
    }
}
