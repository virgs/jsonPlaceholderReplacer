export module Injection {
    export enum Scope {
        Singleton = 1,
        Request = 2
    };
    export enum Creation {
        Multi = 1,
        Default = 2
    };

    export type Predicate = (argument: any) => boolean;

    export type Options = {
        scope?: Scope;
        creation?: Creation;
        predicate?: Predicate;
    }

    export function createdDefaultOption(option?: Options) {
        if (!option)
            return {
                scope: Scope.Request,
                creation: Creation.Default
            }
        let defaultOption: any = {
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
}
