import React from "react";

export function useSubscribe(store: any) {
    const [, forceUpdate] = React.useReducer(n => !n, false);

    React.useEffect(() => {
        store.subscribe(forceUpdate);
        
        return () => void store.unsubscribe(forceUpdate);
    }, []);
}

export default function createStore<T>({handler, initialState}: {
    handler(event: any, state: T): false | T;
    initialState: T;
}) {
    let state: T = initialState;
    const store: {
        getState<S = typeof state>(factory?: (state: T) => S): S;
        _listeners: Set<Function>;
        useStore: <S = typeof state>(factory?: (state: T) => S) => S;
        subscribe(listener: Function): Function;
        unsubscribe(listener: Function): boolean;
        dispatch(event: any): void;
    } = {
        useStore: <S = typeof state>(factory?: (state: T) => S) => {
            useSubscribe(store);

            return factory(state);
        },
        getState: <S = typeof state>(factory = _ => _) => factory(state) as S,
        _listeners: new Set<Function>(),
        subscribe: (listener: Function) => {
            store._listeners.add(listener);    

            return () => void store.unsubscribe(listener);
        },
        unsubscribe: (listener: Function) => {
            return store._listeners.delete(listener);
        },
        dispatch: (event) => {
            const listeners = [...store._listeners];

            const data = handler(event, state);
            if (data === false) return;

            state = data;

            for (let i = 0; i < listeners.length; i++) {
                listeners[i](event);
            }
        }
    };

    return store;
}
