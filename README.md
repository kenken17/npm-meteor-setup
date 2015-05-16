npm-meteor-setup
================

Command line tool for creating basic Meteor app structure.

## Installation

```bash
$ npm install -g meteor-setup
```

## Commands

```bash
$ ms create <dir>
```
This will create a new Meteor project under the `<dir>` folder with:

- Removed meteor default files.
- Copied over meteor-setup templates.
- Removed packages autopublish & insecure
- Added packages underscore, iron:router, reactive-var & accounts-password. 