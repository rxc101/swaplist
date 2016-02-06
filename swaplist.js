Tasks = new Mongo.Collection("tasks");
 
if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("tasks", function () {
    return Tasks.find();
  });
}


if (Meteor.isClient) {
  // This code only runs on the client

          //the following functions handle the lifecycle of the form 
        //submission and validation
      Template.Register.onCreated(function(){
          console.log("The 'register' template was just created.");
      });

      Template.Register.onRendered(function(){
          //console.log("The 'register' template was just rendered.");
          $('.Register').validate({ //attach jQuery validate fcn to form
            rules: {
              email: {
                  required: true,
                  email: true
              },
              password: {
                  required: true,
                  minlength: 6
              }
            }
          }); 
     });
      

      Template.Register.onDestroyed(function(){
          console.log("The 'register' template was just destroyed.");
      });

Meteor.subscribe("tasks");
  Template.body.helpers({
    tasks: function () {
    if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },

    incompleteCount: function () {
       return Tasks.find({checked: {$ne: true}}).count();
     }
  });

 Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form element
      var text = event.target.text.value;
      console.log(event);
      // Insert a task into the collection
      Meteor.call("addTask", text);
 
      // Clear form
      event.target.text.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

/*
  Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });
*/
/*
  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
      },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
      },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });
*/

////////////////////////////////////////////////////////////////////////
//Register //
////////////////////////////////////////////////////////////////////////



  Template.Register.events({
    'submit form' : function(event){
        event.preventDefault();







        /*
        var email = $('[name=Email]').val();
        var firstName = $('[name=FirstName]').val();
        var lastName = $('[name=LastName]').val();
        var birthday = $('[name=Birthday]').val();
        var major = $('[name=Major]').val();
        var gradDate = $('[name=GradDate]').val();
        var phone = $('[name=Phone]').val();
        var password = $('[name=Password]').val();

        we need to validate the data first then 
        call Accounts.createUser to add to db
        Accounts.createUser({
            email: email,
            firstname: firstname,
            lastname: lastname,
            birthday: birthday,
            major: major,
            gradDate: gradDate,
            phone: phone,
            password:password
        });
    
        //Router.go('Home'); //redirect user to different page
    }

  });
  
  Accounts.config({
   restrictCreationByEmailDomain: 'pitt.edu'
    });
    // was getting error that it was called on the client but not on the server
  
  //Accounts.ui.config({
   // passwordSignupFields: "USERNAME_ONLY"
  //});

Template.register.events({
    'submit form': function(event){
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
    }
});
*/
  }

});

Meteor.methods({
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
 
    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      //if the task is private, make sure the owner can delete it
      throw new Meteor.Error("not-authorized");
    }
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
   var task = Tasks.findOne(taskId);
     if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
     }
 
      Tasks.update(taskId, { $set: { checked: setChecked} });
    },
  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);
 
    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
 
    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});

}