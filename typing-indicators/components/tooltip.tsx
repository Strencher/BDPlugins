import {getByProps} from "../modules/webpack";
import {UserStore} from "../modules/discordmodules";
import React from "react";
import "./tooltip.scss";

const AvatarsModule = getByProps("DEFAULT_AVATARS");

const unknownUser = {
    id: "1337",
    username: "Unknown",
    discriminator: "0000",
    getAvatarURL: () => AvatarsModule.DEFAULT_AVATARS[0]
};
    
const listChildren = children => {
    return new Intl.ListFormat(document.documentElement.lang, {style: "long", type: "conjunction"})
        .formatToParts(Array.from({length: children.length}, (_, i) => i + ""))
        .map(e => e.type === "element" ? children[e.value] : e.value);
}

const TypingUsersTooltip = React.memo((props: {typing: string[]}) => {
    const mapped = React.useMemo(() => props.typing.slice(0, 3).map(id => UserStore.getUser(id) ?? unknownUser), []);
    const showAvatar = true;
    const showDiscriminator = true;

    return (
        <div className= "typing-users-tooltip">
            {listChildren(
                mapped.map(user => (
                    <div key={user.id} className="typing-user">
                        {showAvatar && <img src={user.getAvatarURL(null, 16)}/>}
                        <span>{user.username}#</span>
                        {showDiscriminator && <span>{user.discriminator}</span>}
                    </div>
                ))
            )}
        </div>
    );
});

export default TypingUsersTooltip;
