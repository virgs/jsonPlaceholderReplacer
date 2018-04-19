import { ParentClassContainer } from "./parent-class-container";
export declare class Container {
    private static injectableContainer;
    static getSuperClassContainer(superClassName: string): any;
    static get(superClass: any): ParentClassContainer;
}
