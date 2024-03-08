let mysql = require('mysql');



let connection = mysql.createPool({
    host     : 'localhost',
    user     : 'username',
    password : 'password',
    database : 'database',
    connectionLimit : 100,
    charset: 'utf8mb4'
  });
  

const mySqlQury =(qry)=>{
    return new Promise((resolve, reject)=>{
        connection.query(qry, (err, row)=>{
            if (err) return reject(err);
            resolve(row)
        })
    }) 
}

  
module.exports = {connection, mySqlQury}