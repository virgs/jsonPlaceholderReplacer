import {Injection} from "./Injection";
import {ParentClassContainer} from "./parent-class-container";
import {Container} from "./container";

export function Injectable(options?: Injection.Options) {
    return function(constructor: any) {
        var superClassName = Object.getPrototypeOf(constructor.prototype).constructor.name;
        const className = constructor.prototype.constructor.name;
        const injectableContainer: ParentClassContainer = Container.getSuperClassContainer(superClassName);

        let mergedOption = Injection.createdDefaultOption(options);
        injectableContainer
            .addInjectable(
                {
                    name: className,
                    constructor: constructor,
                    options: mergedOption
                });
    };
}