#!/usr/bin/env node

var TEMPLATE_START = __dirname + '/templates/start',
	TEMPLATE_VIEW = __dirname + '/templates/view',
	VIEW = 'client/views';

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
	process.stdout.write('\n - Coping over view templates...');

	if (fs.existsSync(VIEW + '/' + name + '.html') || fs.existsSync(VIEW + '/' + name + '.html')) {
		console.log('view existed. Aborted.');
	} else {
		// copy over template
		fs.copySync(TEMPLATE_VIEW, VIEW);

		// replace all string in default view
		shell.sed('-i', /defaultView/g, name, VIEW + '/defaultView.js');
		shell.sed('-i', /defaultView/g, name, VIEW + '/defaultView.html');

		// rename the template
		fs.renameSync(VIEW + '/defaultView.js', VIEW + '/' + name + '.js');
		fs.renameSync(VIEW + '/defaultView.html', VIEW + '/' + name + '.html');

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

program.parse(process.argv);