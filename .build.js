/**
 * Helper file made for package.json scripts
 * 
 * Node-based (and thus more cross-platform)
 */    
const fs = require("fs");

function errHandler(err) {
    if (err) {
        throw err;
    }
}

// Copy assets to dist/.
async function buildAssets() {
    return Promise.all(
        ["public/fonts/", "public/images/", "views/"].map(
            (dir) => { return fs.cp(dir, "dist/" + dir, {recursive:true}, errHandler); }
        )
    ).then((success) => {
        console.log("All files succesfully copied!")
    }, (rejected) => {
        console.error("Error whiel copying files")
        console.error(rejected)
    });
}

 buildAssets();