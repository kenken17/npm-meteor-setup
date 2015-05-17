#!/usr/bin/env node

var TEMPLATE_START = __dirname + '/templates/start',
	TEMPLATE_VIEW = __dirname + '/templates/view',
	TEMPLATE_COLLECTION = __dirname + '/templates/collection',
	VIEW = 'client/views',
	COLLECTION = 'collections';

var path = require('path'),
	fs = require('fs-extra'),
	shell = require('shelljs'),
	program = require('commander'),
	pkg = require(path.join(__dirname, 'package.json')),
	pwd = shell.pwd(),
	addPackages = 'underscore iron:router reactive-var accounts-password',
	removePackages = 'autopublish insecure';

// tasks
var taskRemoveDefaultFiles = function(name, options) {
	process.stdout.write('\n - Removing Meteor default files....');
	// remove the default files
	fs.removeSync(pwd + '/' + name + '/' + name + '.html');
	fs.removeSync(pwd + '/' + name + '/' + name + '.css');
	fs.removeSync(pwd + '/' + name + '/' + name + '.js');
	process.stdout.write('Done.');
};

var taskCopyStartTemplate = function(name, options) {
	var templateStart = TEMPLATE_START;

	// with user provide template
	if (options.template) {
		templateStart = options.template;
	}

	process.stdout.write('\n - Coping over startup templates...');
	// copy over template
	fs.copySync(templateStart, pwd + '/' + name);
	process.stdout.write('Done.');
};

var taskCopyViewTemplate = function(name, options) {
	var path = checkPath(options.path) || '',
		targetPath = VIEW + path;

	if (fs.existsSync(targetPath + '/' + name + '.html') || fs.existsSync(targetPath + '/' + name + '.js')) {
		console.log('View existed. Action aborted.');
	} else {
		process.stdout.write(' - Coping over view templates...');

		// copy over template
		fs.copySync(TEMPLATE_VIEW, targetPath);

		// replace all string in default view
		shell.sed('-i', /defaultView/g, name, targetPath + '/defaultView.js');
		shell.sed('-i', /defaultView/g, name, targetPath + '/defaultView.html');

		// rename the template
		fs.renameSync(targetPath + '/defaultView.js', targetPath + '/' + name + '.js');
		fs.renameSync(targetPath + '/defaultView.html', targetPath + '/' + name + '.html');

		process.stdout.write('Done.');
	}
};

var taskCopyCollectionTemplate = function(name, options) {
	var path = checkPath(options.path) || '',
		targetPath = COLLECTION + path;

	if (fs.existsSync(targetPath + '/' + name + '.js')) {
		console.log('Collection existed. Action aborted.');
	} else {
		process.stdout.write(' - Coping over collection templates...');

		// copy over template
		fs.copySync(TEMPLATE_COLLECTION, targetPath);

		// replace all string in default collection, first one should be CAPS
		shell.sed('-i', /defaultCollection/, name.charAt(0).toUpperCase() + name.slice(1), targetPath + '/defaultCollection.js');
		shell.sed('-i', /defaultCollection/g, name, targetPath + '/defaultCollection.js');

		// rename the template
		fs.renameSync(targetPath + '/defaultCollection.js', targetPath + '/' + name + '.js');

		process.stdout.write('Done.');
	}
};

var taskAddPackages = function(packages) {
	process.stdout.write('\n - Adding packages...');
	shell.exec('meteor add ' + packages);
};

var taskRemovePackages = function(packages) {
	process.stdout.write('\n - Removing packages...');
	shell.exec('meteor remove ' + packages);
};

var checkPath = function(path) {
	if (path) {
		// make sure path has no last '/'
		if (path.slice(-1) === '/') {
			path = path.slice(0, -1);
		}

		// make sure path have start '/'
		if (path.slice(0) !== '/') {
			path = '/' + path;
		}
	}

	return path;
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
				taskRemoveDefaultFiles(name, options);
				taskCopyStartTemplate(name, options);

				// cd to new folder
				shell.cd(name);

				// more tasks
				taskRemovePackages(removePackages);
				taskAddPackages(addPackages);
			});
		};

		if (!shell.which('meteor')) {
			shell.echo('Sorry dude. You need meteor to run this command.');
			shell.exit(1);

			return;
		}

		if (!fs.existsSync(name)) {
			createAndCopy();
		} else {
			if (!options.force) {
				console.log('Directory/folder existed. Perform -f to force overwrite.');
			} else {
				fs.removeSync(name);

				createAndCopy();
			}
		}
	});


// Create a new view
program
	.command('view <name>')
	.description('Create a new view.')
	.option('-p, --path <path>', 'Path to copy the view into.')
	.action(function(name, options) {
		if (!shell.which('meteor')) {
			shell.echo('Sorry dude. You need meteor to run this command.');
			shell.exit(1);

			return;
		}

		if (!fs.existsSync('.meteor')) {
			shell.echo('Sorry dude. Please run this command in project root.');
			shell.exit(1);
		} else {
			taskCopyViewTemplate(name, options);
		}
	});


// Create a new collection
program
	.command('collection <name>')
	.description('Create a new collection.')
	.option('-p, --path <path>', 'Path to copy the collection into.')
	.action(function(name, options) {
		if (!shell.which('meteor')) {
			shell.echo('Sorry dude. You need meteor to run this command.');
			shell.exit(1);

			return;
		}

		if (!fs.existsSync('.meteor')) {
			shell.echo('Sorry dude. Please run this command in project root.');
			shell.exit(1);
		} else {
			taskCopyCollectionTemplate(name, options);
		}
	});

program.parse(process.argv);