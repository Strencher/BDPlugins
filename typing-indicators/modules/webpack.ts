import type {Webpack} from "betterdiscord";
import Api from "./api";

const {Webpack, Webpack: {Filters}} = Api;

export type ModuleFilter = Parameters<typeof Webpack.getModule>[0];
type SearchOptions = Parameters<typeof Webpack.getModule>[1];

interface WebpackModule extends Webpack {
    getByPrototypeFields: typeof getByPrototypeFields,
    getMangled: typeof getMangled,
    getByProps: typeof getByProps,
    getStore: typeof getStore
    getBulk: typeof getBulk,
}

export const getByProps = (...props: string[]) => {
    return Webpack.getModule(Filters.byProps(...props));
};

export const getBulk = (...queries: (ModuleFilter | Parameters<typeof Webpack.getBulk>[0])[]) => {
    return Webpack.getBulk.apply(null, queries.map(q => typeof q === "function" ? {filter: q} : q));
};

export const getByPrototypeFields = (...fields: string[]) => {
    return Webpack.getModule(Filters.byPrototypeFields(...fields));
};

export const getStore = (name: string) => {
    return Webpack.getModule(m => m?._dispatchToken && m.getName?.() === name);
};

export const getMangled = function* (filter: (m: any) => boolean, target?: any) {
    yield target = getModule(m => Object.values(m).some(filter), {searchExports: false});
    yield target && Object.keys(target).find(k => filter(target[k]));
};

export const getModule = Webpack.getModule;

export default {
    ...Webpack,
    getByPrototypeFields,
    getMangled,
    getByProps,
    getStore,
    getBulk
} as WebpackModule;

export {Filters};
