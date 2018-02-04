/*jshint esversion: 6 */
module.exports = function(app){
  app.get('/test', (req,res)=>{
    res.send("Test!");
  });
};
