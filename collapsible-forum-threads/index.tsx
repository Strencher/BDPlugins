import {Plugin, TreeSearcher} from "@structs";
import Style from "styles";
import createStore, {useSubscribe} from "./store";
import React from "react";

import "./arrow.scss";

const {Webpack, Webpack: {Filters}, Patcher, ReactUtils, Utils, Data} = new BdApi(manifest.name);

const StatesStore = createStore<string[]>({
    handler: (action, state): string[] => {
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
] = Webpack.getBulk(
    {filter: m => m?._dispatchToken && m.getName() === "ChannelStore"},
    {filter: m => m?.Z?.toString().includes("hasActiveThreads")},
    {filter: Filters.byProps("GUILD_FORUM"), searchExports: true},
    {filter: Filters.byPrototypeFields("renderTooltip")},
    {filter: Filters.byProps("iconItem")}
);

function ConnectedButton(props) {
    useSubscribe(StatesStore);

    const isCollapsed = StatesStore.getState(state => state.includes(props.channel.id));

    const handleClick = () => {
        StatesStore.dispatch({
            type: isCollapsed ? "EXPAND" : "COLLAPSE",
            id: props.channel.id
        });
    };

    return (
        <Tooltip text={isCollapsed ? "Expand" : "Collapse"} spacing={2}>
            {props => (
                <div {...props} onClick={handleClick}>
                    <svg className={Utils.className(classes.iconItem, "cft-button", isCollapsed && "cft-collapsed")} width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z" />
                    </svg>
                </div>
            )}
        </Tooltip>
    );
}

export default class CollapsibleForumThreads extends Plugin {
    private didPatchThreadItem = false;

    private cleanup = new Set<Function>([
        () => Style.unload(),
        () => Patcher.unpatchAll(),
        () => this.didPatchThreadItem = false
    ]);

    public onStart(): void {
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

    private subscribeSettings() {
        const clean = () => {
            this.cleanup.delete(clean);
            cancel();
        };

        const cancel = StatesStore.subscribe(() => {
            Data.save("collapsed", StatesStore.getState());
        });

        this.cleanup.add(clean);
    }

    private patchChannelItem() {
        Patcher.before(ChannelItem, "Z" as never, (_, args) => {
            const [props] = args as any[];

            if (!Array.isArray(props?.children) || props.channel.type !== ChannelTypes.GUILD_FORUM) return;

            props.children.push(
                <ConnectedButton {...props} />
            );
        })
    }

    private patchThreadItem(GuildSidebarThreadList: any) {
        this.didPatchThreadItem = true;

        Patcher.instead(GuildSidebarThreadList, "type" as never, (_, args, original: Function) => {
            useSubscribe(StatesStore);

            const [props] = args as any[];

            const collapsed = StatesStore.getState();
            const res = original(props);

            if (collapsed.includes(ChannelStore.getChannel(props.sortedThreadIds[0])?.parent_id)) {
                return null;
            }

            return res;
        });
    }

    private observer({addedNodes}) {
        if (this.didPatchThreadItem) return;

        for (const node of addedNodes) {
            if (node.nodeType === Node.TEXT_NODE || this.didPatchThreadItem) continue;

            const match = (node.classList?.contains("container-1Bj0eq") && node) || node.querySelector(".container-1Bj0eq");

            if (!match) continue;
            const GuildSidebarThreadList =
                new TreeSearcher(match)
                    .put(i => ReactUtils.getInternalInstance(i))
                    .walk("return", "return", "pendingProps")
                    .isArray()
                    .put(v => v.find(e => e?.props?.sortedThreadIds))
                    .walk("type")
                    .value();

            if (!GuildSidebarThreadList) continue;

            this.patchThreadItem(GuildSidebarThreadList);
        }
    }

    public onStop(): void {
        this.cleanup.forEach(fn => fn());
    }
}
