/**
 * @name CollapsibleForumThreads
 * @id collapsible-forum-threads
 * @author Strencher
 * @authorId 415849376598982656
 * @invite gvA2ree
 * @version 1.0.0
 * @description Allows you to collapse forum threads.
 */

"use strict";
// #region manifest.json
const manifest = Object.freeze({
    "name": "CollapsibleForumThreads",
    "id": "collapsible-forum-threads",
    "author": "Strencher",
    "authorId": "415849376598982656",
    "invite": "gvA2ree",
    "version": "1.0.0",
    "description": "Allows you to collapse forum threads."
});
// #endregion manifest.json

// #region react
var React = BdApi.React;
// #endregion react

// #region @structs
const defaultOverrides = {
    useMemo: (factory) => factory(),
    useState: (initialState) => [initialState, () => void 0],
    useReducer: (initialValue) => [initialValue, () => void 0],
    useEffect: () => {},
    useLayoutEffect: () => {},
    useRef: () => ({ current: null }),
    useCallback: (callback) => callback,
    useContext: (ctx) => ctx._currentValue
};
const isClassComponent = (what) => typeof what === "function" && Boolean(what.prototype?.isReactComponent);
class TreeSearcher {
    _current;
    _break;
    _exceptionsHandler;
    defaultWalkable;
    constructor(target, type = "") {
        this._current = target;
        this._break = false;
        switch (type) {
            case "react": {
                this.defaultWalkable = ["props", "children"];
            }
            break;
            case "react-vdom": {
                this.defaultWalkable = ["child", "return", "alternate"];
            }
            break;
            default: {
                this.defaultWalkable = [];
            }
        }
    }
    _wrapHandler(fn) {
        const self = this;
        return function() {
            try {
                return fn.apply(this, arguments);
            } catch (error) {
                if (self._exceptionsHandler)
                    this._break = Boolean(self._exceptionsHandler(error));
                else {
                    throw error;
                }
            }
        };
    }
    catch (handler) {
        return this._exceptionsHandler = handler, this;
    }
    type() {
        return typeof this._current;
    }
    isNull() {
        return this._current == null;
    }
    isArray() {
        return this._break = !Array.isArray(this._current), this;
    }
    isNumber() {
        return this._break = this.type() !== "number", this;
    }
    isFunction() {
        return this._break = this.type() !== "function", this;
    }
    isObject() {
        return this._break = !(this.type() === "object" && this._current !== null), this;
    }
    isClassComponent() {
        return this._break = !isClassComponent(this._current), this;
    }
    where(condition) {
        return this._break = !this._wrapHandler(condition).call(this, this.value(), this), this;
    }
    walk(...path) {
        if (this._break)
            return this;
        try {
            for (let i = 0; i < path.length; i++) {
                if (!this._current)
                    break;
                this._current = this._current?.[path[i]];
            }
        } catch (error) {
            if (this._exceptionsHandler)
                this._break = Boolean(this._exceptionsHandler(error));
            else {
                throw error;
            }
        }
        if (!this._current)
            this._break = true;
        return this;
    }
    find(filter, { ignore = [], walkable = this.defaultWalkable, maxProperties = 100 } = {}) {
        if (this._break)
            return this;
        const stack = [this._current];
        filter = this._wrapHandler(filter);
        while (stack.length && maxProperties) {
            const node = stack.shift();
            if (filter(node)) {
                this._current = node;
                return this;
            }
            if (Array.isArray(node))
                stack.push(...node);
            else if (typeof node === "object" && node !== null) {
                for (const key in node) {
                    const value = node[key];
                    if (walkable.length && (~walkable.indexOf(key) && !~ignore.indexOf(key)) || node && ~ignore.indexOf(key)) {
                        stack.push(value);
                    }
                }
            }
            maxProperties--;
        }
        this._break = true;
        this._current = null;
        return this;
    }
    render(props, options) {
        if (this._break)
            return this;
        if (isClassComponent(this._current)) {
            this._wrapHandler(() => {
                const instance = new this._current(props);
                const res = instance.render();
                if (res === null)
                    this._break = true;
                else {
                    this._current = res;
                }
            })();
            return this;
        }
        const overrides = Object.assign({}, defaultOverrides, options);
        const keys = Object.keys(overrides);
        const ReactDispatcher = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current;
        const originals = keys.map((e) => [e, ReactDispatcher[e]]);
        Object.assign(ReactDispatcher, overrides);
        let error = null;
        try {
            this._current = this.call(null, props)._current;
        } catch (err) {
            error = err;
        }
        Object.assign(ReactDispatcher, Object.fromEntries(originals));
        if (error && !this._exceptionsHandler)
            throw error;
        if (!this._current)
            this._break = true;
        return this;
    }
    put(factory) {
        if (this._break)
            return this;
        const value = this._current = this._wrapHandler(factory).call(this, this.value(), this);
        if (value == null)
            this._break = true;
        return this;
    }
    call(_this, ...args) {
        if (this._break)
            return this;
        const value = this._current = this._wrapHandler(this._current).call(_this, ...args);
        if (value == null)
            this._break = true;
        return this;
    }
    break () {
        return this._break = true, this;
    }
    value() {
        return this._current;
    }
    toString() {
        return String(this._current);
    }
    then(onSuccess, onError) {
        return Promise.resolve(this._current).then((value) => (onSuccess.call(this, value), this), onError ? (error) => (onError(error), this) : void 0);
    }
}

// #endregion @structs

// #region @structs
class Plugin {
    _settings = null;
    onStart() {}
    onStop() {}
    start() {
        if (typeof this.onStart === "function") {
            this.onStart();
        }
    }
    stop() {
        if (typeof this.onStop === "function") {
            this.onStop();
        }
    }
    registerSettings(settings) {
        this._settings = settings;
    }
    get getSettingsPanel() {
        if (!this._settings)
            return void 0;
        return () => this._settings;
    }
}

// #endregion @structs

// #region styles
var Style = {
    sheets: [],
    _element: null,
    load() {
        if (this._element) return;

        this._element = Object.assign(document.createElement("style"), {
            textContent: this.sheets.join("\n"),
            id: manifest.id
        });

        document.head.appendChild(this._element);
    },
    unload() {
        this._element?.remove();
        this._element = null;
    }
};
// #endregion styles

// #region store.ts
function useSubscribe(store) {
    const [, forceUpdate] = React.useReducer((n) => !n, false);
    React.useEffect(() => {
        store.subscribe(forceUpdate);
        return () => void store.unsubscribe(forceUpdate);
    }, []);
}

function createStore({ handler, initialState }) {
    let state = initialState;
    const store = {
        useStore: (factory) => {
            useSubscribe(store);
            return factory(state);
        },
        getState: (factory = (_) => _) => factory(state),
        _listeners: /* @__PURE__ */ new Set(),
        subscribe: (listener) => {
            store._listeners.add(listener);
            return () => void store.unsubscribe(listener);
        },
        unsubscribe: (listener) => {
            return store._listeners.delete(listener);
        },
        dispatch: (event) => {
            const listeners = [...store._listeners];
            const data = handler(event, state);
            if (data === false)
                return;
            state = data;
            for (let i = 0; i < listeners.length; i++) {
                listeners[i](event);
            }
        }
    };
    return store;
}

// #endregion store.ts

// #region arrow.scss

Style.sheets.push("/* arrow.scss */",
    `.cft-button {
  color: var(--interactive-normal);
  transition: transform 0.2s ease-out, -webkit-transform 0.2s ease-out;
  width: 16px;
  height: 16px;
}

.cft-button.cft-collapsed {
  transform: rotate(90deg);
}`);

// #endregion arrow.scss

// #region index.tsx
const { Webpack, Webpack: { Filters }, Patcher, ReactUtils, Utils, Data } = new BdApi(manifest.name);
const StatesStore = createStore({
    handler: (action, state) => {
        switch (action.type) {
            case "COLLAPSE":
                if (!state.includes(action.id)) {
                    return state.concat(action.id);
                }
            case "EXPAND":
                const index = state.indexOf(action.id);
                if (index > -1) {
                    state.splice(index, 1);
                    return state.concat();
                }
            default:
                return state;
        }
    },
    initialState: Data.load("collapsed") ?? []
});
const [
    ChannelStore,
    ChannelItem,
    ChannelTypes,
    Tooltip,
    classes
] = Webpack.getBulk({ filter: (m) => m?._dispatchToken && m.getName() === "ChannelStore" }, { filter: (m) => m?.Z?.toString().includes("hasActiveThreads") }, { filter: Filters.byProps("GUILD_FORUM"), searchExports: true }, { filter: Filters.byPrototypeFields("renderTooltip") }, { filter: Filters.byProps("iconItem") });

function ConnectedButton(props) {
    useSubscribe(StatesStore);
    const isCollapsed = StatesStore.getState((state) => state.includes(props.channel.id));
    const handleClick = () => {
        StatesStore.dispatch({
            type: isCollapsed ? "EXPAND" : "COLLAPSE",
            id: props.channel.id
        });
    };
    return /* @__PURE__ */ React.createElement(Tooltip, {
        text: isCollapsed ? "Expand" : "Collapse",
        spacing: 2
    }, (props2) => /* @__PURE__ */ React.createElement("div", {
        ...props2,
        onClick: handleClick
    }, /* @__PURE__ */ React.createElement("svg", {
        className: Utils.className(classes.iconItem, "cft-button", isCollapsed && "cft-collapsed"),
        width: "24",
        height: "24",
        viewBox: "0 0 24 24"
    }, /* @__PURE__ */ React.createElement("path", {
        fill: "currentColor",
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z"
    }))));
}
class CollapsibleForumThreads extends Plugin {
    didPatchThreadItem = false;
    cleanup = /* @__PURE__ */ new Set([
        () => Style.unload(),
        () => Patcher.unpatchAll(),
        () => this.didPatchThreadItem = false
    ]);
    onStart() {
        Style.load();
        this.patchChannelItem();
        this.subscribeSettings();
        let node;
        if (node = document.querySelector(".container-1Bj0eq")) {
            this.observer({
                addedNodes: [node]
            });
        }
    }
    subscribeSettings() {
        const clean = () => {
            this.cleanup.delete(clean);
            cancel();
        };
        const cancel = StatesStore.subscribe(() => {
            Data.save("collapsed", StatesStore.getState());
        });
        this.cleanup.add(clean);
    }
    patchChannelItem() {
        Patcher.before(ChannelItem, "Z", (_, args) => {
            const [props] = args;
            if (!Array.isArray(props?.children) || props.channel.type !== ChannelTypes.GUILD_FORUM)
                return;
            props.children.push( /* @__PURE__ */ React.createElement(ConnectedButton, {
                ...props
            }));
        });
    }
    patchThreadItem(GuildSidebarThreadList) {
        this.didPatchThreadItem = true;
        Patcher.instead(GuildSidebarThreadList, "type", (_, args, original) => {
            useSubscribe(StatesStore);
            const [props] = args;
            const collapsed = StatesStore.getState();
            const res = original(props);
            if (collapsed.includes(ChannelStore.getChannel(props.sortedThreadIds[0])?.parent_id)) {
                return null;
            }
            return res;
        });
    }
    observer({ addedNodes }) {
        if (this.didPatchThreadItem)
            return;
        for (const node of addedNodes) {
            if (node.nodeType === Node.TEXT_NODE || this.didPatchThreadItem)
                continue;
            const match = node.classList?.contains("container-1Bj0eq") && node || node.querySelector(".container-1Bj0eq");
            if (!match)
                continue;
            const GuildSidebarThreadList = new TreeSearcher(match).put((i) => ReactUtils.getInternalInstance(i)).walk("return", "return", "pendingProps").isArray().put((v) => v.find((e) => e?.props?.sortedThreadIds)).walk("type").value();
            if (!GuildSidebarThreadList)
                continue;
            this.patchThreadItem(GuildSidebarThreadList);
        }
    }
    onStop() {
        this.cleanup.forEach((fn) => fn());
    }
}

// #endregion index.tsx

module.exports = CollapsibleForumThreads;
