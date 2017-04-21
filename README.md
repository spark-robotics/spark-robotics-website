# Spark Robotics Website
---

### Before you start
Make sure you have a few things installed to get the full website running and ready for development

For all development, when not live and live you will need:
1. Git | https://git-scm.com/downloads
2. Node.js | https://nodejs.org/en/

Before we put the website up live, you will need these:

1. PostgreSQL: https://www.postgresql.org/download/
2. pgadmin: https://www.pgadmin.org/download/

When installing do not change the port for the server to run on.

---
### Set up for editing
1. First things first, open Terminal and run this handy command:

   `git clone  https://github.com/spark-robotics/spark-robotics-website.git`

2. Now go to the directory that you created, and run the command

  `npm install`

  This will install all the necassary packages for the website to work properly
3. If you want to start the server, while you are in the directory, run the command `node app.js`



If the website is not live yet, and you want to use the database, you will need to do a few things to get that set up.

1. Open PGAdmin
2. Open Servers, and right-click "Login/Group User Roles" and "Create" + "Login/Group Role"
3. In the window that opened, change the name to a username you will use, I use nqmetke. and click the Privileges tab
4. In the Privileges tab, check yes to everything and press save
5. To create the database, right click on the Databases and create a new database
6. Add the owner as your user, and name the database "spark-robotics"


You should be ready to go!
