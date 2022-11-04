/**
 * @name TypingIndicators
 * @id typing-indicators
 * @author Strencher
 * @authorId 415849376598982656
 * @invite gvA2ree
 * @version 1.0.0
 * @description Shows a typing indicator on channel items, guilds, folders and the home icon.
 */

"use strict";
// #region manifest.json
const manifest = Object.freeze({
    "name": "TypingIndicators",
    "id": "typing-indicators",
    "author": "Strencher",
    "authorId": "415849376598982656",
    "invite": "gvA2ree",
    "version": "1.0.0",
    "description": "Shows a typing indicator on channel items, guilds, folders and the home icon."
});
// #endregion manifest.json

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

// #region react
var React = BdApi.React;
// #endregion react

// #region styles
var Styles = {
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

// #region api.ts
var Api = new BdApi("TypingIndicators");

// #endregion api.ts

// #region webpack.ts
const { Webpack, Webpack: { Filters } } = Api;
const getByProps = (...props) => {
    return Webpack.getModule(Filters.byProps(...props));
};
const getBulk = (...queries) => {
    return Webpack.getBulk.apply(null, queries.map((q) => typeof q === "function" ? { filter: q } : q));
};
const getByPrototypeFields = (...fields) => {
    return Webpack.getModule(Filters.byPrototypeFields(...fields));
};
const getStore = (name) => {
    return Webpack.getModule((m) => m?._dispatchToken && m.getName?.() === name);
};
Webpack.getModule;
var Webpack$1 = {
    ...Webpack,
    getByPrototypeFields,
    getByProps,
    getStore,
    getBulk
};

// #endregion webpack.ts

// #region discordmodules.ts
const byStore = (name) => (m) => m?._dispatchToken && m?.getName?.() === name;
const [
    Spinner,
    ReactSpring,
    ChannelStore,
    TypingStore,
    PrivateChannelSortStore,
    UserStore,
    i18n
] = Webpack$1.getBulk((e) => e?.Type?.CHASING_DOTS, Filters.byProps("Controller", "animated"), byStore("GuildChannelStore"), byStore("TypingStore"), byStore("PrivateChannelSortStore"), byStore("UserStore"), Filters.byProps("getLocale"));

// #endregion discordmodules.ts

// #region typingmanager.ts
const TypingManager = {
    filterTyping(userId) {
        return true;
    },
    getGuildTyping(guildId) {
        return ChannelStore.getChannels(guildId)?.SELECTABLE?.some(({ channel }) => Object.keys(TypingStore.getTypingUsers(channel.id)).filter(this.filterTyping).length) ?? false;
    },
    getDMTyping() {
        return PrivateChannelSortStore.getPrivateChannelIds()?.some((id) => Object.keys(TypingStore.getTypingUsers(id)).filter(this.filterTyping).length);
    }
};

// #endregion typingmanager.ts

// #region utils.ts
const { ReactUtils: ReactUtils$1, Utils } = Api;
const findInReactTree = (tree, filter) => Utils.findInTree(tree, filter, { walkable: ["props", "children"] });
const getReactProps = (filter = (_) => _, el, instance = ReactUtils$1.getInternalInstance(el)) => {
    for (let current = instance.return, i = 0; i > 1e4 || current !== null; current = current?.return, i++) {
        if (current?.pendingProps && filter(current.pendingProps))
            return current.pendingProps;
    }
    return null;
};

// #endregion utils.ts

// #region BlobContainer.tsx
class BlobContainer extends React.Component {
    timeoutId;
    componentDidMount() {
        this.forceUpdate();
    }
    componentWillAppear(start) {
        start();
    }
    componentWillEnter(start) {
        start();
    }
    componentWillLeave(start) {
        this.timeoutId = setTimeout(start, 300);
    }
    componentWillUnmount() {
        clearInterval(this.timeoutId);
    }
    render() {
        const { className, animatedStyle, children } = this.props;
        return React.createElement(ReactSpring.animated.div, {
            style: animatedStyle,
            className,
            children
        });
    }
}

// #endregion BlobContainer.tsx

// #region tooltip.scss

Styles.sheets.push("/* tooltip.scss */",
    `.typing-users-tooltip {
  text-align: center;
}
.typing-users-tooltip .typing-user {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.typing-users-tooltip .typing-user img {
  width: 16px;
  height: 16px;
  border-radius: 50px;
  margin-right: 3px;
}`);

// #endregion tooltip.scss

// #region tooltip.tsx
const AvatarsModule = getByProps("DEFAULT_AVATARS");
const unknownUser = {
    id: "1337",
    username: "Unknown",
    discriminator: "0000",
    getAvatarURL: () => AvatarsModule.DEFAULT_AVATARS[0]
};
const listChildren = (children) => {
    return new Intl.ListFormat(document.documentElement.lang, { style: "long", type: "conjunction" }).formatToParts(Array.from({ length: children.length }, (_, i) => i + "")).map((e) => e.type === "element" ? children[e.value] : e.value);
};
const TypingUsersTooltip = React.memo((props) => {
    const mapped = React.useMemo(() => props.typing.slice(0, 3).map((id) => UserStore.getUser(id) ?? unknownUser), []);
    return /* @__PURE__ */ React.createElement("div", {
        className: "typing-users-tooltip"
    }, listChildren(mapped.map((user) => /* @__PURE__ */ React.createElement("div", {
        key: user.id,
        className: "typing-user"
    }, /* @__PURE__ */ React.createElement("img", {
        src: user.getAvatarURL(null, 16)
    }), /* @__PURE__ */ React.createElement("span", null, user.username, "#"), /* @__PURE__ */ React.createElement("span", null, user.discriminator)))));
});

// #endregion tooltip.tsx

// #region ChannelTypingIndicator.tsx
const [
    useStateFromStores,
    Tooltip
] = Webpack$1.getBulk((e) => e.toString().includes("useStateFromStores"), Filters.byPrototypeFields("renderTooltip"), (e) => e?.Type?.CHASING_DOTS);

function ChannelTypingIndicator({ channelId }) {
    const typing = useStateFromStores([TypingStore], () => Object.keys(TypingStore.getTypingUsers(channelId)).filter(TypingManager.filterTyping));
    if (!typing.length)
        return null;
    return /* @__PURE__ */ React.createElement(Tooltip, {
        text: /* @__PURE__ */ React.createElement(TypingUsersTooltip, {
            typing
        })
    }, (props) => /* @__PURE__ */ React.createElement("div", {
        ...props
    }, /* @__PURE__ */ React.createElement(Spinner, {
        type: Spinner.Type.PULSING_ELLIPSIS
    })));
}

// #endregion ChannelTypingIndicator.tsx

// #region indicator.scss

Styles.sheets.push("/* indicator.scss */",
    `.typingIndicator {
  transform: scale(0.7);
  left: -6.6px;
  position: absolute;
  bottom: 34px;
  pointer-events: none;
  background: var(--background-secondary);
  width: 33px;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}`);

// #endregion indicator.scss

// #region index.tsx
const { ReactUtils, Patcher } = Api;
const blobMaskClasses = Webpack$1.getModule(Filters.byProps("wrapper", "upperBadge"));
class Test extends Plugin {
    refs = {};
    onStart() {
        Styles.load();
        this.patchChannelItem();
        this.forceUpdateMasks();
    }
    onStop() {
        Styles.unload();
        let BlobMask = null;
        Object.values(this.refs).forEach((ref) => {
            BlobMask ??= ref.constructor;
            ref.detachListener();
            delete ref.state.typing;
            delete ref.state.typingIndicatorMask;
            delete ref._didInitialUpdate;
            ref.forceUpdate();
        });
        if (BlobMask) {
            const items = ["updateMask", "detachListener", "attachListener", "handleUpdate", "hasAnyTyping", "typingIndicatorMask"];
            items.forEach((item) => {
                delete BlobMask.prototype[item];
            });
        }
        this.refs = {};
    }
    patchBlobMask(BlobMask) {
        const { animated, Controller } = ReactSpring;
        const configs = {
            in: {
                friction: 30,
                tension: 900,
                mass: 1
            },
            out: {
                duration: 150,
                friction: 10,
                tension: 100,
                mass: 1
            }
        };
        const ensureMask = (_this) => {
            if (!_this.state || _this.state.typingIndicatorMask)
                return;
            _this.state.typingIndicatorMask = new Controller({
                spring: 0
            });
        };
        Object.assign(BlobMask.prototype, {
            hasAnyTyping() {
                return this.state.typing;
            },
            updateMask(state) {
                if (this.state.typingIndicatorMask) {
                    this.state.typingIndicatorMask.update({
                        spring: state,
                        immediate: !document.hasFocus(),
                        config: !state ? configs.in : configs.out
                    }).start();
                }
            },
            handleUpdate() {
                if (this.props.guild) {
                    this.setState({
                        typing: TypingManager.getGuildTyping(this.props.guild.id)
                    });
                } else if (this.props.isDM) {
                    this.setState({
                        typing: TypingManager.getDMTyping()
                    });
                }
            },
            attachListener() {
                this.handleUpdate = this.handleUpdate.bind(this);
                TypingStore.addChangeListener(this.handleUpdate);
            },
            detachListener() {
                TypingStore.removeChangeListener(this.handleUpdate);
            }
        });
        Patcher.before(BlobMask.prototype, "render", (_this) => {
            ensureMask(_this);
            if (_this.props.guild)
                return;
            const fiber = React.createElement(null)._owner;
            const guildProps = getReactProps((e) => e.guild, void 0, fiber);
            if (guildProps) {
                _this.props.guild ??= guildProps.guild;
            } else if (!!getReactProps((e) => e.text === i18n.Messages.DIRECT_MESSAGES, void 0, fiber)) {
                _this.props.isDM ??= true;
            }
            if (!_this._didInitialUpdate) {
                _this._didInitialUpdate = true;
                this.refs[_this.props.guild?.id ?? "DM"] = _this;
                _this.attachListener();
                _this.handleUpdate();
            }
        });
        Patcher.after(BlobMask.prototype, "componentWillUnmount", (_this) => {
            _this.detachListener();
            if (_this.state.typingIndicatorMask) {
                _this.state.typingIndicatorMask.dispose();
            }
        });
        Patcher.after(BlobMask.prototype, "componentDidUpdate", (_this, args) => {
            const [, prevState] = args;
            ensureMask(_this);
            if (!_this.state.typingIndicatorMask)
                return;
            if (_this.state.typing && !prevState.typing) {
                _this.updateMask(1);
            } else if (!_this.state.typing && prevState.typing) {
                _this.updateMask(0);
            }
        });
        Patcher.after(BlobMask, "getDerivedStateFromProps", (_, args, res) => {
            const [props, state] = args;
            if (!state.typing)
                return;
            if (!res)
                res = {
                    hasRenderedBadge: false,
                    lowerBadgeMask: state.lowerBadgeMask ? state.lowerBadgeMask.update({ spring: props.lowerBadge ? 1 : 0, immediate: true }) : new Controller({ spring: props.lowerBadge ? 1 : 0, immediate: true }),
                    upperBadgeMask: state.upperBadgeMask ? state.upperBadgeMask.update({ spring: props.upperBadge ? 1 : 0, immediate: true }) : new Controller({ spring: props.upperBadge ? 1 : 0, immediate: true }),
                    typingIndicatorMask: null,
                    borderRadiusMask: state.borderRadiusMask || new Controller({ spring: 0 }),
                    renderComplex: false
                };
            if (!res.typingIndicatorMask)
                res.typingIndicatorMask = state.typingIndicatorMask ?? new Controller({
                    spring: state.typing ? 1 : 0
                });
            if (!res.hasRenderedBadge) {
                res.hasRenderedBadge = state.typing;
                if (!res.renderComplex)
                    res.renderComplex = state.typing;
            }
            return res;
        });
        Patcher.after(BlobMask.prototype, "render", (_this, _, res) => {
            ensureMask(_this);
            if (!_this.state.renderComplex || !_this.props.guild && !_this.props.isDM)
                return;
            const [defs, { props: { children: [, masks] } }, stroke] = findInReactTree(res, (e) => e?.overflow)?.children || [];
            const childTree = findInReactTree(res, (e) => e?.hasOwnProperty?.("transitionAppear"));
            if (!defs || !masks || !stroke || !childTree)
                return;
            const id = _this.state.maskId + "-typingIndicator";
            const useElement = React.createElement("use", {
                href: "#" + id,
                full: "black"
            });
            const spring = _this.state.typingIndicatorMask.springs.spring;
            const indicatorStyle = {
                opacity: spring.to([0, 0.5, 1], [0, 0, 1]),
                transform: spring.to((e) => `translate(${-1 * (16 - 16 * e)}px, ${-1 * (16 - 16 * e)}px) scale(0.7)`)
            };
            defs.props.children.push(React.createElement(animated.rect, {
                id,
                x: -3,
                y: 0,
                width: 26,
                height: 14,
                rx: 6,
                ry: 6,
                transform: spring.to([0, 1], [20, 0]).to((e) => `translate(${-1 * e} ${-1 * e})`)
            }));
            masks.props.children.push(useElement);
            stroke.props.children.push(useElement);
            if (_this.state.typing) {
                childTree.children.push( /* @__PURE__ */ React.createElement(BlobContainer, {
                    className: "typingIndicator",
                    animatedStyle: indicatorStyle,
                    key: "typingIndicator"
                }, /* @__PURE__ */ React.createElement(Spinner, {
                    type: Spinner.Type.PULSING_ELLIPSIS
                })));
            }
        });
    }
    patchChannelItem() {
        const ChannelItemModule = Webpack$1.getModule((m) => m?.Z?.toString().includes("hasActiveThreads"));
        Patcher.before(ChannelItemModule, "Z", (_, args) => {
            const [{ children = null, channel = null } = {}] = args;
            if (channel && Array.isArray(children) && !children.some((c) => c?.key === "typing-indicator")) {
                children.push( /* @__PURE__ */ React.createElement(ChannelTypingIndicator, {
                    key: "typing-indicator",
                    channelId: channel.id
                }));
            }
        });
    }
    forceUpdateMasks(stop = false) {
        const elements = document.getElementsByClassName(blobMaskClasses.wrapper);
        let hasMask = false;
        if (elements.length)
            for (const element of elements) {
                const instance = ReactUtils.getInternalInstance(element)?.return?.stateNode;
                if (!instance || !(instance instanceof React.Component))
                    continue;
                if (!hasMask && !stop) {
                    hasMask = true;
                    this.patchBlobMask(instance.constructor);
                }
                instance?.forceUpdate();
            }
    }
}

// #endregion index.tsx

module.exports = Test;
