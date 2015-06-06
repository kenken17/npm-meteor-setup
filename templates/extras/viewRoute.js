
Router.route('__DEFAULTVIEW_PATH__', {
	template: '__DEFAULTVIEW__',
	name: '__DEFAULTVIEW__',
	waitOn: function() {
		// return Meteor.subscribe('__DEFAULTVIEW__');
	},
	subscriptions: function() {
		// return Meteor.subscribe('__DEFAULTVIEW__');
	}
});