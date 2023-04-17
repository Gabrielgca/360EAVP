const express = require('express');
const app = express();
const port = 3001; //porta padrão
const mysql = require('mysql');

app.use(express.json());

//inicia o servidor
app.listen(port);
console.log('API funcionando!');

app.get('/', (req, res) => res.json({ message: 'Funcionando!' }));

app.get('/people', (req, res) => {
    execSQLQuery('SELECT * FROM PEOPLE', res);
})

app.post('/people', (req, res) => {
    console.log(req.body.name);
    console.log(req.body.age);
    const name = req.body.name.substring(0,150);
    const age = req.body.age.substring(0,11);
    execSQLQuery(`INSERT INTO PEOPLE(NAME, AGE) VALUES('${name}','${age}')`, res);
    console.log('Person Added!');
});

function execSQLQuery(sqlQry, res){
    const con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "123",
        database: "experiment"
      });
  
    con.query(sqlQry, (error, results, fields) => {
        if(error) 
          res.json(error);
        else
          res.json(results);
        con.end();
        console.log('Done!');
    });
  }


