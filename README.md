# Setting up Strapi

### Quickstart

###### This section only works for mac and linux

Windows sections will be added later. For now check out these links to set up:

- Windows: https://www.microfocus.com/documentation/idol/IDOL_12_0/MediaServer/Guides/html/English/Content/Getting_Started/Configure/_TRN_Set_up_PostgreSQL.htm

#### Proceedings for Mac users

1. Install Homebrew by running command: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`. _(This will ask for you password and confirmation of download)_
1. Check that homebrew is up to date and healty by running: `brew update` then `brew doctor`
1. Install Postgres by running: `brew install postgresql`
1. Start Postgres service by running: `brew services start postgresql`
1. If you get error: "Error: role 'postgres' does not exist", run command: `/usr/local/opt/postgres/bin/createuser -s postgres`

_Remember to run `npm run build` and `npm run develop` after doing these steps._

_PS: The step “Downloading Command Line Tools for Xcode” can take very long._
My best suggestion for that is checking out this discussion: https://github.com/Homebrew/discussions/discussions/131

And especially this comment:

Apple's XCode command-line installer is...quite uncommunicative. You have at least two choices: 1. Wait for as long as it takes...or the installer errors out. 2. Go to https://developer.apple.com/download/more/ (you'll need to sign up for an Apple developer account if you don't have one), then download and install the latest Command Line Tools package that your OS supports.

### More info

Most of the steps here are taken directly from this website: https://www.moncefbelyamani.com/how-to-install-postgresql-on-a-mac-with-homebrew-and-lunchy/. There is more to learn there.

HomeBrew is a package manager that takes care of everything NPM or Yarn doesn´t. Read more about it on https://brew.sh/

It will ask for your password and to confirm the download.

Beware that the step “Downloading Command Line Tools for Xcode” can take very long. My best suggestion for that is checking out this discussion:

https://github.com/Homebrew/discussions/discussions/131

And especially this comment:

Apple's XCode command-line installer is...quite uncommunicative. You have at least two choices: 1. Wait for as long as it takes...or the installer errors out. 2. Go to https://developer.apple.com/download/more/ (you'll need to sign up for an Apple developer account if you don't have one), then download and install the latest Command Line Tools package that your OS supports.

Don´t worry, it takes some time, but will complete in the end.

After all this, you might get the error: “error: role "postgres" does not exist”

To solve that, simply run this in the command line:

/usr/local/opt/postgres/bin/createuser -s postgres

Then, run “npm run build” and “npm run develop” again and you should be good!
