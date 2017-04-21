/*jshint esversion: 6 */

const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/spark-robotics';

const client = new pg.Client(connectionString);

client.connect();

exports.Users = class Users{

  constructor(){
    client.query('CREATE TABLE IF NOT EXISTS users(name TEXT, email TEXT, password TEXT)');
    client.query('ALTER TABLE IF EXISTS users ADD COLUMN id SERIAL PRIMARY KEY;').catch(function(){

    });
  }
  get(selector ,_name, callback){
    if(typeof _name == "string"){
      client.query(`SELECT * FROM users WHERE ${selector} = '${_name}'`, function(err, result){
          callback(result.rows);
      });
    }
    else{
      client.query(`SELECT * FROM users WHERE ${selector} = ${_name}`, function(err, result){
          callback(result.rows);
      });
    }




  }
  insert(_name, _email, _password, callback){
    client.query(`INSERT INTO users(name,email,password) VALUES('${_name}','${_email}', '${_password}')`, function(err, resul){
      client.query(`SELECT * FROM users WHERE email = '${_email}'`, function(err, result){
          callback(result.rows);
      });
    });
    //TODO Make this better, i am tired and I cant think of a better way to do this


  }
  dropTable(){
    client.query('DROP TABLE users');
  }
};

function stopClient(){
  client.end();
}
