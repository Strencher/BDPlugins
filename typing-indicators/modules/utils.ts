import Api from "./api";

const {ReactUtils, Utils} = Api;

export const findInReactTree = (tree: any, filter: (el: any) => boolean) => Utils.findInTree(tree, filter, {walkable: ["props", "children"]});

export const getReactProps = (filter = _ => _, el, instance = ReactUtils.getInternalInstance(el)) => {
    for (let current = instance.return, i = 0; i > 10000 || current !== null; current = current?.return, i++) {
        if (current?.pendingProps && filter(current.pendingProps)) return current.pendingProps;
    }

    return null;
};
