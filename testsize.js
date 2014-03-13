if (Meteor.isClient) {
  var evnts = new Meteor.Collection(null);
  Template.hello.evnts = function () {
    return evnts.find().fetch();
  };

  Meteor.startup(function () {
    Accounts.createUser({
      email: 'test@test.com',
      password: 'password'
    }, function () {
      evnts.insert({
        text: 'Created new account with email: "test@test.com" and password: "password"'
      });

      evnts.insert({
        text: 'Calling server to find user with your user ID and exactly one login token'
      });
      callServer();
      
    });
  });

  Template.hello.events({
    'click #continue': function () {
      evnts.insert({
        text: 'Logging out other users...'
      });

      evnts.insert({
          text: 'Done logging out other clients.'
        });
        evnts.insert({
          text: 'Calling server again to verify there is only one login token in the database with your ID'
        });

        callServer();
    }
  });
}

function callServer (firstTime) {
  Meteor.call('dosomething', function (err, user) {
        if(!user) {
          evnts.insert({
            text: 'Failure, no user was returned'
          });
          evnts.insert({
            text: "if you're seeing this after the call to logoutOtherClients was made you can now see that the callback from logoutOtherClients fires to early"
          });
        } else {
          if(user._id === Meteor.userId()) {
            evnts.insert({
              text: 'Success, found a user with one login token and your user ID'
            });

            evnts.insert({
              text: 'At this point, could you open another browser, and log in as this user please, then click <a href="#" id="continue">here</a> when done. If this is the second time you have seen this, there is no bug.'
            });                    

          } else {
            evnts.insert({
              text: 'Something completely unexpected happened.'
            });
          }
        }        
      });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.users.remove();

    Meteor.methods({
      'dosomething': function () {
        return Meteor.users.findOne({
                    _id: Meteor.userId(),
                    // only one login token in existence
                    'services.resume.loginTokens': { $size: 1 }
                });
      }
    });
    // code to run on server at startup
  });
}
