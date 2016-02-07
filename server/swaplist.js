Tasks = new Mongo.Collection("tasks");
 

  // This code only runs on the server
  Meteor.publish("tasks", function () {
    return Tasks.find();
  });

Accounts.validateNewUser(function(user) {
  console.log("entered validateNewUser function on server");
  if (/@pitt\.edu$/.test(user.emails[0].address.toLowerCase())) {
    return true;
  } else {
    throw new Meteor.Error(403, "Email domain not allowed.");
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

