import React from "react";
import {TypingStore, Spinner} from "../modules/discordmodules";
import TypingManager from "../modules/typingmanager";
import Webpack, {Filters} from "../modules/webpack";
import TypingUsersTooltip from "./tooltip";

const [
    useStateFromStores,
    Tooltip
] = Webpack.getBulk(
    e => e.toString().includes("useStateFromStores"),
    Filters.byPrototypeFields("renderTooltip"),
    e => e?.Type?.CHASING_DOTS
) as [
    <T>(stores: any[], factory: () => T) => T,
    React.ComponentClass<{
        text: string | React.ReactElement,
        children: (props: {onMouseEnter: React.MouseEventHandler<HTMLDivElement>, onMouseLeave: React.MouseEventHandler<HTMLDivElement>}) => any
    }>
];


export default function ChannelTypingIndicator({channelId}) {
    const typing = useStateFromStores([TypingStore], () => 
        Object.keys(TypingStore.getTypingUsers(channelId)).filter(TypingManager.filterTyping)
    );

    if (!typing.length) return null;

    return (
        <Tooltip text={<TypingUsersTooltip typing={typing} />}>
            {props => (
                <div {...props}>
                    <Spinner type={Spinner.Type.PULSING_ELLIPSIS} />
                </div>
            )}
        </Tooltip>
    );
}
