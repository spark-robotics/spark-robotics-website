const s = require('sequelize');
const pg = require('pg');

pg.defaults.ssl = true;

const db = new s.Sequelize('postgres://radqgnvfbkpedn:b32bb13b93066e0018f506689c4e9bae267a533df3f390b71831a8c2899c8a03@ec2-54-235-123-159.compute-1.amazonaws.com:5432/d58va1g8e9tkts');



db.authenticate().then(()=>{
    console.log("Connected to Datebase!");
}).catch(err =>{
    console.log(err);
});


exports.Users = db.define('users', {
    firstName: {
        type: s.Sequelize.STRING
    },
    lastName: {
        type: s.Sequelize.STRING
    },
    email: {
        type: s.Sequelize.STRING
    },
    password: {
        type: s.Sequelize.STRING
    }
});

const Sponsors = db.define('sponsors', {
    name: {
        type: s.Sequelize.STRING
    },
    img_url: {
        type: s.Sequelize.STRING
    },
    url: {
        type: s.Sequelize.STRING
    }

});


//Sync up the models with the database



//TODO: Remove 'force' from development
db.sync().then(()=>{
    console.log("Database Synced");
});


