# Community Pinboard
A public event pinboard webapp for your local community, meant to be even lighter on the client devices than on the server!

## How-to
### Install & run
Pre-requirements: [node.js](https://nodejs.org/en), [yarn](https://yarnpkg.com/getting-started/install)

```bash
git clone https://github.com/Denperidge/community-pinboard.git
cd community-pinboard
yarn install

yarn dev
```
(Alternative use `yarn dev:debug` for extra debug information!)

## Reference
### Project structure
- [app/](app/): Custom back-end code. Routing, saving pins to disk, the Pin class etc.
- [bin/](bin/): auto-generated by `express-generator`. Ignore unless specifically required
- *data/pins/*: auto-generated in runtime. Stores all pin.json files 
- [public/](public/): front-end assets that do not get processed. Client-side CSS/JS, fonts, images...
- [views/](views/): front-end html templates, written in [Pug](https://pugjs.org/api/getting-started.html)
- [.gitignore](.gitignore): Which files are ignored by git/version control
- [app.js](app.js): auto-generated by `express-generator`. Ignore unless specifically required
- [LICENSE](LICENSE): license details.
- [package.json](package.json): package info. Stores startup scripts (`yarn start`), dependencies...
- [README.md](README.md): this file!
- [yarn.lock](yarn.lock): auto-generated by yarn, updates when npm packages are added/removed


## Notice
The non-edited post-it SVG is from Openclipart, licensed under the Public Domain. [More information on the SVG can be found here](https://publicdomainvectors.org/en/free-clipart/Note-paper/44863.html).

The current (placeholder) background is from the [Nookipedia assets page](https://nookipedia.com/wiki/Nookipedia:Assets).


## License
This project is licensed under the [MIT License](LICENSE).
