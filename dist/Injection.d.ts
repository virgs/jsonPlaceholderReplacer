export declare module Injection {
    enum Scope {
        Singleton = 0,
        Request = 1,
    }
    enum Creation {
        Multi = 0,
        Default = 1,
    }
    type Predicate = (argument: any) => boolean;
    type Options = {
        scope?: Scope;
        creation?: Creation;
        predicate?: Predicate;
    };
    function createdDefaultOption(option?: Options): any;
}
