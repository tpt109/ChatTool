function Room(name) {
  this.name = name;
  this.people = [];
  this.chatHistory = {};
};

Room.prototype.addPerson = function(personID) {
    this.people.push(personID);
};

Room.prototype.removePerson = function(person) {
  console.log("start remove person: " + person);
  var personIndex = this.people.indexOf(person);
  console.log("index: " + personIndex);
  this.people.splice(personIndex, 1);
};

Room.prototype.getPerson = function(personID) {
  var person = null;
  for(var i = 0; i < this.people.length; i++) {
    if(this.people[i].id == personID) {
      person = this.people[i];
      break;
    }
  }
  return person;
};

module.exports = Room;
