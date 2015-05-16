#!/usr/bin/env node

var path = require('path'),
	fs = require('fs-extra'),
	shell = require('shelljs'),
	program = require('commander'),
	pkg = require(path.join(__dirname, 'package.json'));

program
	.version(pkg.version);

// Create a new project
program
	.command('create <name>')
	.option('-f, --force', 'Create project (empty current folder).')
	.description('Create a new boilerplate Meteor project.')
	.action(function(name, options) {
		var createAndCopy = function() {
			var versions = '',
				pwd = shell.pwd();

			shell.exec('meteor create ' + name, function(err) {
				// remove the default files
				fs.removeSync(pwd + '/' + name + '/' + name + '.html');
				fs.removeSync(pwd + '/' + name + '/' + name + '.css');
				fs.removeSync(pwd + '/' + name + '/' + name + '.js');
				console.log('\n- Removed meteor default files.');

				// copy over our template
				fs.copySync(__dirname + '/templates', pwd + '/' + name);
				console.log('- Copied over meteor-setup templates.');

				shell.cd(name);

				// remove the autopublish and insecure
				fs
					.createReadStream('.meteor/versions', {encoding: 'utf8'})
					.on('data', function(line) {
						var lineTokens = line.split('\n');

						lineTokens.forEach(function(line) {
							hasAutopublish = /autopublish@/g.test(line);
							hasInsecure = /insecure@/g.test(line);

						    if (!hasAutopublish && !hasInsecure) {
								versions += line + '\n';
							}
						});
					})
					.on('end', function() {
						fs.writeFile('.meteor/versions', versions, 'utf8');
						console.log('- Removed packages autopublish & insecure');

						shell.exec('meteor add underscore iron:router reactive-var accounts-password', function(err) {
							if (err) console.log(err);
							console.log('- Added packages underscore, iron:router, reactive-var & accounts-password');
						});
					});
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