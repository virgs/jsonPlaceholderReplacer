import {Injectable} from "./injector";
import {Container} from "./container";
import {Injection} from "./Injection";
import Creation = Injection.Creation;
import Scope = Injection.Scope;

describe('Injector', function() {

    it('should inject object correctly', function() {
        class ParentClass {};
        @Injectable({predicate: (argument: string) => argument == "object"})
        class SubClass extends ParentClass {}

        @Injectable({predicate: (argument: string) => argument == "someOtherValue"})
        class SomeSubClass extends ParentClass {}

        const injected = Container.get(ParentClass).create("object");

        expect(injected).toBeInstanceOf(SubClass);
    });

    it('should inject null if no Null is given and no factory function returns true', function() {
        class ParentClass {};
        const injected = Container.get(ParentClass).create("wrong");

        expect(injected).toBeNull();
    });

    it('should inject last added DefaultObject', function() {
        class ParentClass {};
        @Injectable({creation: Creation.Default})
        class DefaultClass extends ParentClass {}

        @Injectable({creation: Creation.Default})
        class AnotherDefaultClass extends ParentClass {}

        const injected = Container.get(ParentClass).create("wrong");
        expect(injected).toBeInstanceOf(AnotherDefaultClass);
    });

    it('should inject DefaultObject', function() {
        class ParentClass {};
        @Injectable({creation: Creation.Default})
        class DefaultClass extends ParentClass {}

        @Injectable({predicate: () => false})
        class PredicateClass extends ParentClass {}

        const injected = Container.get(ParentClass).create("wrong");
        expect(injected).toBeInstanceOf(DefaultClass);
    });

    it('should return different instances if not singleton', function() {
        class ParentClass {};
        @Injectable()
        class NotSingletonClass extends ParentClass {
            public value: number = 0;
        }

        const firstInjection = Container.get(ParentClass).create();
        const secondInjection = Container.get(ParentClass).create();

        (<NotSingletonClass>firstInjection).value = 2;
        expect((<NotSingletonClass>secondInjection).value).toBe(0)
    });

    it('should return same instance if singleton', function() {
        class SingletonParentClass {};
        @Injectable({scope: Scope.Singleton})
        class SingletonClass extends SingletonParentClass {
            public value: number = 0;
        }

        const firstInjection = Container.get(SingletonParentClass).create();
        const secondInjection = Container.get(SingletonParentClass).create();

        (firstInjection as SingletonClass).value = 2;
        expect((<SingletonClass>secondInjection).value).toBe(2);
    });

    it('should instantiate every subclass', function() {
        expect.extend({
            toContainInstanceOfAny(instanceList, classList) {
                for (const instance of instanceList) {
                    let instanceOfSome = true;
                    for (const clazz of classList) {
                        instanceOfSome = (instance instanceof clazz);
                        if (instanceOfSome)
                            break;
                    }
                    if (!instanceOfSome)
                        return {
                            message: () => (`${this.utils.printReceived(instance)} is not an instance of any class of the list ${this.utils.printExpected(classList)}`),
                            pass: false
                        }
                }

                return {
                    message: () => (`OK`),
                    pass: true
                }
            }
        })

        class ParentEveryTestClass {}
        @Injectable()
        class SubClassA extends ParentEveryTestClass { a = "a"; constructor() { super();} }
        @Injectable()
        class SubClassB extends ParentEveryTestClass { constructor() { super();} }
        @Injectable()
        class SubClassC extends ParentEveryTestClass { constructor() { super();} }

        const injectedList: any[] = Container.get(ParentEveryTestClass).createAll({anyStuff: "blahBlah"});
        expect(injectedList).toContainInstanceOfAny([SubClassA, SubClassB, SubClassC]);
    });

});