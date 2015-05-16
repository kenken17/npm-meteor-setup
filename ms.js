#!/usr/bin/env node

var CREATE_TEMPLATE = __dirname + '/templates';

var path = require('path'),
	fs = require('fs-extra'),
	shell = require('shelljs'),
	program = require('commander'),
	pkg = require(path.join(__dirname, 'package.json')),
	pwd = shell.pwd(),
	templatePath = CREATE_TEMPLATE,
	addPackages = 'underscore iron:router reactive-var accounts-password',
	removePackages = 'autopublish insecure';

program
	.version(pkg.version);

// Create a new project
program
	.command('create <name>')
	.option('-f, --force', 'Create project (empty current folder).')
	.option('-t, --template <templatePath>', 'User defined template as folder structure.')
	.description('Create a new boilerplate Meteor project.')
	.action(function(name, options) {
		var createAndCopy = function() {
			var versions = '';

			shell.exec('meteor create ' + name, function(err) {
				// Tasks
				taskRemoveDefaultFiles(name, options);
				taskCopyTemplate(name, options);


				// cd to new folder
				shell.cd(name);

				// more tasks
				taskRemovePackages(removePackages);
				taskAddPackages(addPackages);
			});
		};

		if (!shell.which('meteor')) {
			echo('Sorry dude. You need meteor to run this command.');
			exit(1);

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

program.parse(process.argv);


// tasks
var taskRemoveDefaultFiles = function(name, options) {
	process.stdout.write('\n - Removing Meteor default files....');
	// remove the default files
	fs.removeSync(pwd + '/' + name + '/' + name + '.html');
	fs.removeSync(pwd + '/' + name + '/' + name + '.css');
	fs.removeSync(pwd + '/' + name + '/' + name + '.js');
	process.stdout.write('Done.');
};

var taskCopyTemplate = function(name, options) {
	// with user provide template
	if (options.template) {
		templatePath = options.template;
	}

	process.stdout.write('\n - Coping over templates...');
	// copy over our template
	fs.copySync(templatePath, pwd + '/' + name);
	process.stdout.write('Done.');
};

var taskAddPackages = function(packages) {
	process.stdout.write('\n - Adding packages...');
	shell.exec('meteor add ' + packages);
};

var taskRemovePackages = function(packages) {
	process.stdout.write('\n - Removing packages...');
	shell.exec('meteor remove ' + packages);
};