var mysql = require('mysql');


var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123",
    database: "experiment"
  });
  
  conn.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    createTable(conn);
    addRows(conn);
  });

function createTable(conn){
      const sql = `CREATE TABLE IF NOT EXISTS PEOPLE(
                   ID int NOT NULL AUTO_INCREMENT,
                   Name VARCHAR(150) NOT NULL,
                   Age INT NOT NULL,
                   PRIMARY KEY (ID)
                   );`;
      
      conn.query(sql, (error, results, fields) => {
          if(error) return console.log(error);
          console.log('Table created!');
      });
}

function addRows(conn){
  const sql = "INSERT INTO PEOPLE(Name,Age) VALUES ?";
  const values = [
        ['João', '20'],
        ['Maria', '22'],
        ['José', '32']
      ];
  conn.query(sql, [values], (error, results, fields) => {
          if(error) return console.log(error);
          console.log('Registers Added!');
          conn.end();//fecha a conexão
      });
}
