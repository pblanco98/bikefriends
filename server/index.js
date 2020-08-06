const express = require('express');
const validator = require('validator');
const app = express();
const cors = require('cors');
const { Client } = require('pg');
const { userInfo } = require('os');
const client = new Client()

app.use(express.static('public'))

client.connect(err => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected')
    }
  })

app.use(cors());
app.use(express.json());



app.post('/register', async (req,res) => {
    const errors = []
    if(validator.isEmail(req.body.account.email) === false){
        errors.push('Invalid Email')
    }

    const email = req.body.account.email;
    const username = req.body.account.username;
    const password = req.body.account.password;

    const sqlSelectCommand = `SELECT email, username FROM cyclehub_user where email = '${email}' or username = '${username}'`
    const dbSelectRes = await client.query(sqlSelectCommand)
    console.log(dbSelectRes)


    if(dbSelectRes.rowCount > 0){
        errors.push('An account with this email or username already exists.')
    }else {
        const sqlCommand = `insert into cyclehub_user(email, username, password) values ('${email}', '${username}', '${password}') returning id`
        const dbRes = await client.query(sqlCommand)
        console.log(dbRes)
    }

    

        
    
    
    //console.log(dbRes) // Hello world!

    res.json({
        errors
    })

})

app.post('/login', async (req,res) => {
    const errors = []
    
    const login_username = req.body.account.login_username;
    const login_password = req.body.account.login_password;

    const sqlCommand = `SELECT * FROM cyclehub_user where username = '${login_username}'`
    const dbRes = await client.query(sqlCommand)
    
    console.log(dbRes)
    console.log("login_password: " + login_password)
    const password = dbRes.rows[0].password
    console.log("password: " + password)

    if(login_password === password) {
        res.status(200);
        
    }else{
        res.status(401);
    }
    res.send();
    
})

app.get('/home', async (req, res) => {
    const sqlCommand = 'SELECT * FROM cyclehub_user'

    const dbRes = await client.query(sqlCommand)
    const account = dbRes.rows
    console.log(account)
    res.json(account);
 })



app.listen(5005, () => {
    console.log('Listening on http://localhost:5005')
}) 
