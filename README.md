# Strapi application

Setting up Strapi

The first thing you do after forking the ACC-repo is to run "npm run build" and "npm run develop" to start the server, but as you will see, its not that easy.

To get started with Strapi you need to install PostgreSQL, and for that you need Homebrew. HomeBrew is a package manager that takes care of everything NPM or Yarn doesn´t. Read more about it on https://brew.sh/

This is the website that will get you started. Most of the steps here are taken directly from there. https://www.moncefbelyamani.com/how-to-install-postgresql-on-a-mac-with-homebrew-and-lunchy/ PS: This is only for mac. Not sure if it works the same way with Linux or Windows.

To install HomeBrew, run this command in your terminal:

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

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
