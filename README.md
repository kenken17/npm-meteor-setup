npm-meteor-setup
================

Command line tool for creating basic Meteor app structure.

## Installation

```bash
$ npm install -g meteor-setup
```

## Commands

###create
Create a new boilerplate Meteor project.

```bash
$ ms create <dir>
```
This will create a new Meteor project under the `<dir>` folder, with the default folder structure.

**Options:**

```
-f: force to overwrite/empty the existing folder.
-t <templateDir>: the path to user defined folder.
```

Default folder structure as below:

```
/
├── client/
│   ├── _layouts/
│   │   └── defaultLayout.html
│   ├── views/
│   │   └── main.html
├── lib/
│   └── route.js
├── server/ 		
│   └── *
├── collections/ 		
│   └── *
├── public/ 		
│   └── *
├── private/ 		
│   └── *
```

###init
Initialize a project. This will copy over `ms.json` to the project.

```bash
$ ms init
```

Structure of the init file as below:

```json
{
	"templates": {
		"viewPath": "/client/views",
		"collectionPath": "/collections"
	},

	"packages": {
		"remove": ["autopublish", "insecure"],
		"add": ["underscore", "iron:router", "reactive-var", "accounts-password"]
	}
}
```

###setup
Setup a new project based on init file, if any. This will perform basic setup steps. I.e. adding packages and remove packages.

```bash
$ ms setup
```

###view
Create a new view. If `ms.json` is missing, it will create one before this command.

```bash
$ ms view <name>
```

**Options:**

```
-p <path>: the path for collection to put into.
-r: also add a route for this view.
```

###collection
Create a new collection. If `ms.json` is missing, it will create one before this command.

```bash
$ ms collection <name>
```

**Options:**

```
-p <path>: the path for collection to put into.
-m: create the collection with CRUD method appended.
```