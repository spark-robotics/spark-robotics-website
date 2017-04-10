var db = require(__dirname + '/models/database.js');var users =new db.Users();users.dropTable();console.log("Table Dropped!");
