## Development

To run the project locally for development, follow these steps:

1. Install [Node.js](https://nodejs.org/en/download) and [Yarn 1](https://classic.yarnpkg.com/en/docs/install) if you haven't done so already.
2. Clone the repo and run `yarn` in the root directory of the repo to fetch all required dependencies.
3. Run `yarn dev` to build and install the addon as a temporary extension in your Firefox. This uses [web-ext](https://github.com/mozilla/web-ext). It will automatically watch for changes and reload the extension.

   You can pass additional arguments to the `web-ext run`. For example, if you want to use a different Firefox binary, use `-f /path/to/firefox`. If you want want to use a temporary profile instead of your main one or you're getting the error "Your Firefox profile cannot be loaded. It may be missing or inaccessible.", first create an empty directory for the new profile (e.g. by running `mktemp -d` to make one in `/tmp`) and then pass that to `-p`.

   So, to combine the two scenarios, you might for example run:

   ```sh
   yarn dev -f /home/user/prog/firefox-beta/firefox -p /tmp/tmp.Rr8As37Jv2
   ```
