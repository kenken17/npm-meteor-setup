Meteor.methods({
	'__DEFAULTCOLLECTION__Add': function(props) {
		var user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'Login is needed.');
		}

		return CAPS__DEFAULTCOLLECTION__.insert(props);
	},

	'__DEFAULTCOLLECTION__List': function(props) {
		var user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'Login is needed.');
		}

		return CAPS__DEFAULTCOLLECTION__.find({});
	},

	'__DEFAULTCOLLECTION__Update': function(props) {
		var user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'Login is needed.');
		}

		return CAPS__DEFAULTCOLLECTION__.update({
				_id: props._id
			}, {
				$set: {
					props: props
				}
			}
		);
	},

	'__DEFAULTCOLLECTION__Delete': function(props) {
		var user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'Login is needed.');
		}

		return CAPS__DEFAULTCOLLECTION__.remove({
				_id: props._id
			}
		);
	}
});