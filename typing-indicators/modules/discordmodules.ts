import Webpack, {Filters} from "./webpack";

const byStore = (name: string) => m => m?._dispatchToken && m?.getName?.() === name; 

type Store = {
    addChangeListener(fn: () => void): void;
    removeChangeListener(fn: () => void): void;
    emitChange(): void;
};

export const [
    Spinner,
    ReactSpring,
    ChannelStore,
    TypingStore,
    PrivateChannelSortStore,
    UserStore,
    i18n
] = Webpack.getBulk(
    e => e?.Type?.CHASING_DOTS,
    Filters.byProps("Controller", "animated"),
    byStore("GuildChannelStore"),
    byStore("TypingStore"),
    byStore("PrivateChannelSortStore"),
    byStore("UserStore"),
    Filters.byProps("getLocale")
) as [
    React.FunctionComponent<{type: string}> & {Type: {
        CHASING_DOTS: string,
        LOW_MOTION: string,
        PULSING_ELLIPSIS: string,
        SPINNING_CIRCLE: string,
        WANDERING_CUBES: string
    }},
    any,
    Store & {getChannels(guildId: string): any},
    Store & {getTypingUsers(channelId: string): {[userId: string]: number}},
    Store & {getPrivateChannelIds(): string[]},
    Store & {getUser(id: string): any, getCurrentUser(): any},
    {getLocale(): string, Messages: {[key: string]: string}}
];
