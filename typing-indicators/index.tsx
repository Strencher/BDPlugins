/// <reference path="../Builder/types.d.ts" />

import {Plugin} from "@structs";
import React from "react";
import Styles from "styles";
import Webpack, {Filters} from "./modules/webpack";
import {i18n, ReactSpring, Spinner, TypingStore} from "./modules/discordmodules";
import TypingManager from "./modules/typingmanager";
import Api from "./modules/api";
import {findInReactTree, getReactProps} from "./modules/utils";
import BlobContainer from "./components/BlobContainer";
import ChannelTypingIndicator from "./components/ChannelTypingIndicator";

import "./indicator.scss";

const {ReactUtils, Patcher} = Api;
const blobMaskClasses = Webpack.getModule(Filters.byProps("wrapper", "upperBadge"));

type BlobMaskType = React.Component<{
    guild?: any,
    lowerBadge?: any,
    upperBadge?: any,
    isDM?: boolean,
}, {
    typing: boolean,
    typingIndicatorMask: any,
    lowerBadgeMask: any,
    upperBadgeMask: any,
    borderRadiusMask: any,
    renderComplex?: boolean,
    maskId?: string
}> & {
    _didInitialUpdate: boolean,
    attachListener(): void;
    detachListener(): void;
    handleUpdate(): void;
    updateMask(state: 1 | 0): void;
    hasAnyTyping(): boolean
};

type BlobMaskConstructor = new (props: any) => BlobMaskType;

export default class Test extends Plugin {
    public refs = {} as any;

    public onStart() {
        Styles.load();
        this.patchChannelItem();
        this.forceUpdateMasks();
    }

    public onStop() {
        Styles.unload();
        let BlobMask = null;

        Object.values<any>(this.refs).forEach(ref => {
            BlobMask ??= ref.constructor;            
            ref.detachListener();
            delete ref.state.typing;
            delete ref.state.typingIndicatorMask;
            delete ref._didInitialUpdate;
            ref.forceUpdate();
        });

        if (BlobMask) {
            const items = ["updateMask", "detachListener", "attachListener", "handleUpdate", "hasAnyTyping", "typingIndicatorMask"];
            items.forEach(item => {
                delete BlobMask.prototype[item];
            });
        }

        this.refs = {};
    }

    public patchBlobMask(BlobMask: BlobMaskConstructor) {
        const {animated, Controller} = ReactSpring;

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

        const ensureMask = (_this: BlobMaskType) => {
            if (!_this.state || _this.state.typingIndicatorMask) return;

            // @ts-expect-error
            _this.state.typingIndicatorMask = new Controller({
                spring: 0
            });
        };

        Object.assign(BlobMask.prototype, {
            hasAnyTyping() {
                return this.state.typing;
            },
            updateMask(state: 0 | 1) {
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

        Patcher.before(BlobMask.prototype as any, "render" as never, (_this: BlobMaskType) => {
            ensureMask(_this);
            if (_this.props.guild) return;

            const fiber = (React.createElement(null) as any)._owner;
            const guildProps = getReactProps(e => e.guild, void 0, fiber);
            if (guildProps) {
                // @ts-expect-error
                _this.props.guild ??= guildProps.guild;
            } else if (!!getReactProps(e => e.text === i18n.Messages.DIRECT_MESSAGES, void 0, fiber)) {
                // @ts-expect-error
                _this.props.isDM ??= true;
            }

            if (!_this._didInitialUpdate) {
                _this._didInitialUpdate = true;
                this.refs[_this.props.guild?.id ?? "DM"] = _this;
                _this.attachListener();
                _this.handleUpdate();
                // _this.updateMask();
            }
        });

        Patcher.after(BlobMask.prototype, "componentWillUnmount" as never, (_this: BlobMaskType) => {
            _this.detachListener();

            if (_this.state.typingIndicatorMask) {
                _this.state.typingIndicatorMask.dispose();
            }
        });

        Patcher.after(BlobMask.prototype, "componentDidUpdate" as never, (_this: BlobMaskType, args) => {
            const [, prevState] = args as [never, BlobMaskType["state"]];
            ensureMask(_this);
            if (!_this.state.typingIndicatorMask) return;

            if (_this.state.typing && !prevState.typing) {
                _this.updateMask(1);
            } else if (!_this.state.typing && prevState.typing) {
                _this.updateMask(0);
            }
        });

        Patcher.after(BlobMask, "getDerivedStateFromProps" as never, (_, args, res: any) => {
            const [props, state] = args as [BlobMaskType["props"], BlobMaskType["state"]];

            if (!state.typing) return;
            if (!res) res = {
                hasRenderedBadge: false,
                lowerBadgeMask: state.lowerBadgeMask 
                    ? state.lowerBadgeMask.update({spring: props.lowerBadge ? 1 : 0, immediate: true})
                    : new Controller({spring: props.lowerBadge ? 1 : 0, immediate: true}),
                upperBadgeMask: state.upperBadgeMask 
                    ? state.upperBadgeMask.update({spring: props.upperBadge ? 1 : 0, immediate: true})
                    : new Controller({spring: props.upperBadge ? 1 : 0, immediate: true}),
                typingIndicatorMask: null,
                borderRadiusMask: state.borderRadiusMask || new Controller({spring: 0}),
                renderComplex: false
            };
            
            if (!res.typingIndicatorMask) res.typingIndicatorMask = state.typingIndicatorMask ?? new Controller({
                spring: state.typing ? 1 : 0
            });
            
            if (!res.hasRenderedBadge) {
                res.hasRenderedBadge = state.typing;
                if (!res.renderComplex) res.renderComplex = state.typing;
            }
            
            return res;
        });

        Patcher.after(BlobMask.prototype, "render" as never, (_this: BlobMaskType, _, res) => {
            ensureMask(_this);
            if (!_this.state.renderComplex || (!_this.props.guild && !_this.props.isDM)) return;
            const [defs, {props: {children: [, masks]}}, stroke] = findInReactTree(res, e => e?.overflow)?.children || [];
            const childTree = findInReactTree(res, e => e?.hasOwnProperty?.("transitionAppear"));
            if (!defs || !masks || !stroke || !childTree) return;
            
            const id = _this.state.maskId + "-typingIndicator";
            const useElement = React.createElement("use", {
                href: "#" + id,
                full: "black"
            });
                
            const spring = _this.state.typingIndicatorMask.springs.spring;

            const indicatorStyle = {
                opacity: spring.to([0, 0.5, 1], [0, 0, 1]),
                transform: spring.to(e => `translate(${-1 * (16 - 16 * e)}px, ${-1 * (16 - 16 * e)}px) scale(0.7)`)
            };

            defs.props.children.push(
                React.createElement(animated.rect, {
                    id: id,
                    x: -3,
                    y: 0,
                    width: 26,
                    height: 14,
                    rx: 6,
                    ry: 6,
                    transform: spring
                        .to([0, 1], [20, 0])
                        .to(e => `translate(${-1 * e} ${-1 * e})`)
                })
            );

            masks.props.children.push(useElement);
            stroke.props.children.push(useElement);
            
            if (_this.state.typing) {
                childTree.children.push(
                    <BlobContainer className="typingIndicator" animatedStyle={indicatorStyle} key="typingIndicator">
                        <Spinner type={Spinner.Type.PULSING_ELLIPSIS} />
                    </BlobContainer>
                )
            }
        });
    }

    public patchChannelItem() {
        const [ChannelItemModule, methodName] = Webpack.getMangled(m => m?.toString().includes("hasActiveThreads"));

        Patcher.before(ChannelItemModule, methodName as never, (_, args) => {
            const [{children = null, channel = null} = {}] = args as any[];

            if (channel && Array.isArray(children) && !children.some(c => c?.key === "typing-indicator")) {
                children.push(
                    <ChannelTypingIndicator key="typing-indicator" channelId={channel.id} />
                );
            }
        });
    }

    public forceUpdateMasks(stop = false) {
        const elements = document.getElementsByClassName(blobMaskClasses.wrapper) as unknown as HTMLElement[];

        let hasMask = false;
        if (elements.length) for (const element of elements) {
            const instance = ReactUtils.getInternalInstance(element)?.return?.stateNode;

            if (!instance || !(instance instanceof React.Component)) continue;

            if (!hasMask && !stop) {
                hasMask = true;
                this.patchBlobMask(instance.constructor as BlobMaskConstructor);
            }

            instance?.forceUpdate();
        }
    }
}
