import React from "react";
import {ReactSpring} from "../modules/discordmodules";

export default class BlobContainer extends React.Component<{className?: string, animatedStyle: any, children: any}> {
    timeoutId: number;
    componentDidMount() {
        this.forceUpdate();
    }

    componentWillAppear(start: Function) { start(); }
    componentWillEnter(start: Function) { start(); }
    
    componentWillLeave(start: Function) {
        this.timeoutId = setTimeout(start, 300);
    }

    componentWillUnmount() {
        clearInterval(this.timeoutId);
    }

    render() {
        const {className, animatedStyle, children} = this.props;

        return React.createElement(ReactSpring.animated.div, {
            style: animatedStyle,
            className,
            children
        });
    }
}
