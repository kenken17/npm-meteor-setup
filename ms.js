#!/usr/bin/env node

var TEMPLATE_START = __dirname + '/templates/start',
	TEMPLATE_VIEW = __dirname + '/templates/view',
	TEMPLATE_COLLECTION = __dirname + '/templates/collection',
	TEMPLATE_EXTRA = __dirname + '/templates/extras';

var path = require('path'),
	fs = require('fs-extra'),
	shell = require('shelljs'),
	program = require('commander'),
	pkgDir = path.join(__dirname),
	pkg = require(pkgDir + '/package.json'),
	pwd = shell.pwd();

// tasks
var taskRemoveDefaultFiles = function(name) {
	process.stdout.write(' - Removing Meteor default files....');
	// remove the default files
	fs.removeSync(pwd + '/' + name + '/' + name + '.html');
	fs.removeSync(pwd + '/' + name + '/' + name + '.css');
	fs.removeSync(pwd + '/' + name + '/' + name + '.js');
	process.stdout.write('Done.\n');
};

var taskCopyInitFile = function() {
	process.stdout.write('- Copying over init file...');
	// copy over init file
	fs.copySync(pkgDir + '/ms.json', pwd + '/ms.json');
};

var taskCopyStartTemplate = function(name, options) {
	var templateStart = TEMPLATE_START;

	// with user provide template
	if (options.template) {
		templateStart = options.template;
	} else {
		// create the empty folder
		fs.mkdirsSync(pwd + '/' + name + '/collections');
		fs.mkdirsSync(pwd + '/' + name + '/private');
		fs.mkdirsSync(pwd + '/' + name + '/public');
		fs.mkdirsSync(pwd + '/' + name + '/server');
	}

	process.stdout.write(' - Copying over startup templates...');
	// copy over template
	fs.copySync(templateStart, pwd + '/' + name);

	process.stdout.write('Done.\n');
};

var taskCopyViewTemplate = function(name, options) {
	var targetPath = getViewTargetPath(options.path);

	if (fs.existsSync(targetPath + '/' + name + '.html') || fs.existsSync(targetPath + '/' + name + '.js')) {
		shell.echo('View existed. Action aborted.');
		shell.exit(1);
	} else {
		process.stdout.write(' - Copying over view templates...');

		// copy over template
		fs.copySync(TEMPLATE_VIEW, targetPath);

		// replace all string in default view
		shell.sed('-i', /__DEFAULTVIEW__/g, name, targetPath + '/defaultView.js');
		shell.sed('-i', /__DEFAULTVIEW__/g, name, targetPath + '/defaultView.html');

		// rename the template
		fs.renameSync(targetPath + '/defaultView.js', targetPath + '/' + name + '.js');
		fs.renameSync(targetPath + '/defaultView.html', targetPath + '/' + name + '.html');

		process.stdout.write('Done.\n');
	}
};

var taskAddViewRoute = function(name, options) {
	var targetPath = checkPath(options.path),
		targetRouteFile = getRouteTargetFile(),
		route = shell.cat(path.join(TEMPLATE_EXTRA + '/viewRoute.js'));

	process.stdout.write(' - Generating route...');
	fs.appendFileSync(targetRouteFile, route);

	// replace all placeholder in route
	shell.sed('-i', /__DEFAULTVIEW_PATH__/g, targetPath, targetRouteFile);
	shell.sed('-i', /__DEFAULTVIEW__/g, name, targetRouteFile);

	process.stdout.write('Done.\n');
};

var taskCopyCollectionTemplate = function(name, options) {
	var targetPath = getCollectionTargetPath(options.path),
		finalPath = targetPath + '/' + name + '.js';

	if (fs.existsSync(finalPath)) {
		shell.echo('Collection existed. Action aborted.');
		shell.exit(1);
	} else {
		process.stdout.write(' - Copying over collection templates...');

		// copy over template
		fs.copySync(TEMPLATE_COLLECTION, targetPath);

		// replace all string in default collection, first one should be CAPS
		shell.sed('-i', /CAPS__DEFAULTCOLLECTION__/g, name.charAt(0).toUpperCase() + name.slice(1), targetPath + '/defaultCollection.js');
		shell.sed('-i', /__DEFAULTCOLLECTION__/g, name, targetPath + '/defaultCollection.js');

		// rename the template
		fs.renameSync(targetPath + '/defaultCollection.js', finalPath);

		process.stdout.write('Done.\n');
	}
};

var taskAddCollectionCRUDMethod = function(name, options) {
	var targetPath = getCollectionTargetPath(options.path),
		methods = shell.cat(path.join(TEMPLATE_EXTRA + '/CRUDMethods.js')),
		finalPath = targetPath + '/' + name + '.js';

	process.stdout.write(' - Generating CRUD methods...');
	fs.appendFileSync(finalPath, methods);

	// replace all placeholder in collection
	shell.sed('-i', /CAPS__DEFAULTCOLLECTION__/g, name.charAt(0).toUpperCase() + name.slice(1), finalPath);
	shell.sed('-i', /__DEFAULTCOLLECTION__/g, name, finalPath);

	process.stdout.write('Done.\n');
};

var taskAddPackages = function() {
	var init = require(path.join(pwd + '/ms.json'));

	if (init && init.packages && init.packages.add) {
		process.stdout.write(' - Adding packages...');
		// TODO: Check if packages existed
		shell.exec('meteor add ' + init.packages.add.join(' '));
	}
};

var taskRemovePackages = function() {
	var init = require(path.join(pwd + '/ms.json'));

	if (init && init.packages && init.packages.remove) {
		process.stdout.write(' - Removing packages...');
		// TODO: Check if packages existed
		shell.exec('meteor remove ' + init.packages.remove.join(' '));
	}
};

var checkPath = function(path) {
	if (path) {
		// make sure path has no last '/'
		if (path.slice(-1) === '/') {
			path = path.slice(0, -1);
		}

		// make sure path have start '/'
		if (path.slice(0, 1) !== '/') {
			path = '/' + path;
		}

		return path;
	}

	return '';
};

var hasMeteor = function() {
	if (!shell.which('meteor')) {
		shell.echo('Sorry dude. You need meteor to run this command.');
		shell.exit(1);

		return false;
	}

	return true;
};

var isInRoot = function() {
	if (!fs.existsSync('.meteor')) {
		shell.echo('Sorry dude. Please run this command in project root.');
		shell.exit(1);

		return false;
	}

	return true;
};

var getViewTargetPath = function(newPath) {
	var userPath = checkPath(newPath),
		init = require(path.join(pwd + '/ms.json'));

	return pwd + checkPath(init.templates.viewPath) + userPath;
};

var getCollectionTargetPath = function(newPath) {
	var userPath = checkPath(newPath),
		init = require(path.join(pwd + '/ms.json'));

	return pwd + checkPath(init.templates.collectionPath) + userPath;
};

var getRouteTargetFile = function() {
	var init = require(path.join(pwd + '/ms.json'));

	return pwd + checkPath(init.templates.routeFile);
};

program.version(pkg.version);

// Create a new project
program
	.command('create <name>')
	.description('Create a new boilerplate Meteor project.')
	.option('-f, --force', 'Create project (empty current folder).')
	.option('-t, --template <templateDir>', 'User defined template as folder structure.')
	.action(function(name, options) {
		var createAndCopy = function() {
			shell.exec('meteor create ' + name, function(err) {

				// Tasks
				taskRemoveDefaultFiles(name);
				taskCopyStartTemplate(name, options);
			});
		};

		if (!hasMeteor()) return;

		if (!fs.existsSync(name)) {
			createAndCopy();
		} else {
			if (!options.force) {
				shell.echo('Directory/folder existed. Perform -f to force overwrite.');
				shell.exit(1);
			} else {
				fs.removeSync(name);

				createAndCopy();
			}
		}
	});

// Init the project
program
	.command('init')
	.description('Initialize a project.')
	.action(function() {
		if (!hasMeteor()) return;

		if (!isInRoot()) return;

		taskCopyInitFile();
	});

// Setup the project
program
	.command('setup')
	.description('Setup a new project based on init file, if any.')
	.action(function() {
		if (!hasMeteor()) return;

		if (!isInRoot()) return;

		// check init file
		if (!fs.existsSync(pwd + '/ms.json')) {
			taskCopyInitFile();
		}

		// more tasks
		taskRemovePackages();
		taskAddPackages();
	});

// Create a new view
program
	.command('view <name>')
	.description('Create a new view.')
	.option('-p, --path <path>', 'Path to copy the view into.')
	.option('-r, --route', 'Generate a route for this view.')
	.action(function(name, options) {
		if (!hasMeteor()) return;

		if (!isInRoot()) return;

		// check init file
		if (!fs.existsSync(pwd + '/ms.json')) {
			taskCopyInitFile();
		}

		taskCopyViewTemplate(name, options);

		if (options && options.route) {
			taskAddViewRoute(name, options);
		}
	});


// Create a new collection
program
	.command('collection <name>')
	.description('Create a new collection.')
	.option('-p, --path <path>', 'Path to copy the collection into.')
	.option('-m, --method', 'The CRUD methods for collection.')
	.action(function(name, options) {
		if (!hasMeteor()) return;

		if (!isInRoot()) return;

		// check init file
		if (!fs.existsSync(pwd + '/ms.json')) {
			taskCopyInitFile();
		}

		taskCopyCollectionTemplate(name, options);

		if (options && options.method) {
			taskAddCollectionCRUDMethod(name, options);
		}
	});

program.parse(process.argv);