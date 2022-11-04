const {exec} = require("child_process");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..", "..");
const ignored = fs.readFileSync(path.resolve(root, ".buildignore"), "utf8")
    .trim()
    .split("\n")
    .filter(e => e.indexOf("#") === -1);

async function main() {
    for (const name of fs.readdirSync(root)) {
        const location = path.resolve(root, name);

        if (!ignored.includes(name) &&
            fs.statSync(location).isDirectory() &&
            fs.existsSync(path.resolve(root, "manifest.json"))
        ) continue;

        
        await run("node Builder -m betterdiscord -i " + name);
    }

    await run("git add ./dist/*");
    await run("git commit -m \"Deploy Build\"");
    await run("git push origin main");
}

main();

function run(cmd, cwd = root) {
    return new Promise((res, rej) => {
        exec(cmd, {cwd}, (error, stdout) => {
            if (error) return rej(error);

            res(stdout);
        });
    });
}
