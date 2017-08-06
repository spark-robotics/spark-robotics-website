/*jshint esversion: 6 */

const pg = require('pg');

pg.defaults.ssl = true;
const connectionString = process.env.DATABASE_URL || 'postgres://radqgnvfbkpedn:b32bb13b93066e0018f506689c4e9bae267a533df3f390b71831a8c2899c8a03@ec2-54-235-123-159.compute-1.amazonaws.com:5432/d58va1g8e9tkts';
//const connectionString =process.env.DATABASE_URL;
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
        if(result!==null){
          //console.log(result.rows);
          callback(result.rows);
        }
        else{
          //console.log(result.rows);
          callback(false);
        }

      });
    }
    else{
      client.query(`SELECT * FROM users WHERE ${selector} = ${_name}`, function(err, result){
        if(result!==null){
          callback(result.rows);
        }
        else{
          callback(false);
        }

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

exports.Messages = class Messages{

  constructor(){
    client.query('CREATE TABLE IF NOT EXISTS messages(name TEXT, email TEXT, team_number TEXT, body TEXT)');
    client.query('ALTER TABLE IF EXISTS messages ADD COLUMN id SERIAL PRIMARY KEY;').catch(function(){

    });
  }
  get(selector ,_name, callback){
    if(typeof _name == "string"){
      client.query(`SELECT * FROM messages WHERE ${selector} = '${_name}'`, function(err, result){
        if(result!==null){
          //console.log(result.rows);
          callback(result.rows);
        }
        else{
          //console.log(result.rows);
          callback(false);
        }

      });
    }
    else{
      client.query(`SELECT * FROM messages WHERE ${selector} = ${_name}`, function(err, result){
        if(result!==null){
          callback(result.rows);
        }
        else{
          callback(false);
        }

      });
    }
  }
  get_all(callback){
    client.query('SELECT * FROM messages', function(err, result){
      if(result !== null){
        callback(result.rows);
      }
      else{
        callback(false);
      }
    });
  }
  insert(_name, _email, _team_number, _body, callback){
    client.query(`INSERT INTO messages(name,email,team_number,body) VALUES('${_name}','${_email}', '${_team_number}', '${_body}')`, function(err, resul){
      callback(resul);
    });
    //TODO Make this better, i am tired and I cant think of a better way to do this


  }
  dropTable(){
    client.query('DROP TABLE messages');
  }
};

function stopClient(){
  client.end();
}
