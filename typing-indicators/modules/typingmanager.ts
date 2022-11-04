import {ChannelStore, TypingStore, PrivateChannelSortStore} from "./discordmodules";

const TypingManager = {
    filterTyping(userId: string) {return true;},
    getGuildTyping(guildId: string) {
        return ChannelStore.getChannels(guildId)?.SELECTABLE
            ?.some(({channel}) => Object.keys(TypingStore.getTypingUsers(channel.id)).filter(this.filterTyping).length) ?? false;
    },
    getDMTyping() {
        return PrivateChannelSortStore.getPrivateChannelIds()?.some(id => Object.keys(TypingStore.getTypingUsers(id)).filter(this.filterTyping).length);
    }
}

export default TypingManager;
