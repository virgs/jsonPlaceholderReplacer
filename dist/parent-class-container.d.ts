import { Injection } from "../src/Injection";
export interface Injectable {
    name: string;
    options: Injection.Options;
    constructor: ObjectConstructor;
    singletonInstance?: any;
}
export declare class ParentClassContainer {
    private injectables;
    private default;
    create: (argument?: any) => any;
    createAll: (argument: any) => any[];
    addInjectable: (injectable: Injectable) => any;
}
