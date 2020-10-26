const express = require('express');
const session = require('express-session');
const validator = require('validator');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
const { Client } = require('pg');
const { userInfo } = require('os');
const { RSA_NO_PADDING } = require('constants');
const client = new Client()
const mustache = require('mustache');
const fs = require('fs');

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

app.use(cookieParser());

app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

const sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/home');
    } else {
        next();
    }
};

app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

//route for user signup
app.route('/register')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/register.html');
    })
    .post(async (req, res) => {
        if(validator.isEmail(req.body.account.email) === false){
            res.json({next: '/register'});
            return;
        }

        const email = req.body.account.email;
        const username = req.body.account.username;
        const password = req.body.account.password;

        try {
            const sqlSelectCommand = `SELECT email, username FROM cyclehub_user where email = '${email}' or username = '${username}'`
            const dbSelectRes = await client.query(sqlSelectCommand)
            console.log(dbSelectRes)

            if(dbSelectRes.rowCount > 0){
                res.json({next: '/login'});
                return;
            }

            const sqlCommand = `insert into cyclehub_user(email, username, password) values ('${email}', '${username}', '${password}') returning id`
            const dbRes = await client.query(sqlCommand)
            console.log(dbRes)
            const id = dbRes.rows[0].id;

            req.session.user = {
                id,
                email,
                username
            }
            res.json({next: '/home'});
        } catch (err) {
            console.error(err);
            res.json({next: '/register'});
        }
    });

//route for user login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/login.html');
    })
    .post(async (req, res) => {
        var username = req.body.account.login_username,
            password = req.body.account.login_password

        console.log({password,username});
        const sqlCommand = `SELECT * FROM cyclehub_user where username = '${username}'`
        const dbResponse = await client.query(sqlCommand)

        // no user was found
        console.log(dbResponse)
        if(dbResponse.rows.length === 0){
            res.json({next: '/register'});
            return
        }

        // user was found but incorrect password
        const userRecord = dbResponse.rows[0]
        console.log(userRecord)
        if (userRecord.password !== password) {
            res.json({next: '/login'});
            return
        }

        // user found and correct password
        req.session.user = {
            id: userRecord.id,
            email: userRecord.email,
            username: userRecord.username
        }
        res.json({next: '/home'});
    });
    
app.route('/logout')
    .post((req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            res.clearCookie('user_sid');
            res.json({next: '/home'});
        } else {
            res.json({next: '/login'});
        }
    
    });

 app.route('/home')
    .get((req, res) => {
        console.log({
            user: req.session.user,
            userSID: req.cookies.user_sid,

        })
        if (req.session.user && req.cookies.user_sid) {
            console.log('should show home')
            res.sendFile(__dirname + '/public/home.html');
        } else {
            res.redirect('/login');
        }
    })
    .post(async (req,res) => {
        const sqlCommand = 'SELECT * FROM cyclehub_user'

        const dbRes = await client.query(sqlCommand)
        const accounts = dbRes.rows
        res.json({
            username: req.session.user.username,
            id: req.session.user.id,
            accounts
        });
    })

app.route('/build')
    .get((req, res) => {
        const isLoggedIn = req.session.user && req.cookies.user_sid;
        console.log(isLoggedIn)
        if(isLoggedIn === false || isLoggedIn === undefined){
            res.redirect('/login');
            return
        }
        res.sendFile(__dirname + '/public/build.html')
    })
    .post(async (req, res) => {
        console.log(req.body.buildData)
        const buildData = req.body.buildData;
        const user_id = req.session.user.id
        console.log(`user id: '${user_id}'`);
        try {
            const buildsqlCommand = `INSERT into bike_build (frame, fork_headset, crankset, pedals, drivetrain, handlebars, saddle, front_wheel, rear_wheel, more_info, user_id)
            values ('${buildData.frame}', '${buildData.fork_headset}', '${buildData.crankset}', '${buildData.pedals}', '${buildData.drivetrain}', '${buildData.handlebars}', '${buildData.saddle}', '${buildData.front_wheel}', '${buildData.rear_wheel}', '${buildData.more_info}', '${user_id}') returning id`
            console.log(buildsqlCommand);
            const dbRes = await client.query(buildsqlCommand)

            res.json({next: '/home'})
        } catch (err) {
            console.error(err);
            res.json({next: '/register'});
        }
    })

app.route('/editBuild/:buildId')
    .get(async (req, res) => {
        const isLoggedIn = req.session.user && req.cookies.user_sid;
        console.log(isLoggedIn)
        if(isLoggedIn === false || isLoggedIn === undefined){
            res.redirect('/login');
            return
        }

        const build_id = req.params.buildId
        const sqlCommand = `SELECT * FROM bike_build where id = '${build_id}'`
        const dbResponse = await client.query(sqlCommand)
        const buildData = dbResponse.rows[0]
        const template = fs.readFileSync(__dirname + '/public/editBuild.html', 'utf8');
        console.log(buildData)
        res.send(mustache.render(template, buildData))
       
    })
    .post(async (req, res) => {
        console.log(req.body.buildData)
        const buildData = req.body.buildData;
        const build_id = req.params.buildId
        const user_id = req.session.user.id
        
        console.log(buildData)
        console.log(build_id)
        console.log(user_id)
        try {
            let updateSet = ''
            for (const key in buildData) {
                updateSet = `${updateSet} ${key} = '${buildData[key]}',`
              }
            updateSet = updateSet.slice(0, -1)
            const buildsqlCommand = `UPDATE bike_build set${updateSet} WHERE id = ${build_id}`
            console.log(`BUILD SQL COMMAND = ${buildsqlCommand}`)
            const dbRes = await client.query(buildsqlCommand)
            console.log(dbRes);

            res.json({next: '/home'})
        }   catch (err) {
            console.error(err);
            res.json({next: '/register'});
        }
    })
    

// localhost:5055/profile/:user_id
app.get('/profile/:userId', async (req,res) => {
    // user_id
    // respond html file
    const user_id = req.params.userId
    const sqlCommand = `SELECT * FROM cyclehub_user where id = '${user_id}'`
    const dbResponse = await client.query(sqlCommand)
    console.log(dbResponse)
    console.log("hello world")
    if(dbResponse.rowCount === 0){
        res.status(404);
        res.sendFile(__dirname + '/public/404.html');
        return;
    }
    console.log("bye world")
    res.sendFile(__dirname + '/public/profile.html')
})
app.post('/profile', async (req,res) => {
    const user_id = req.body.user_id

    const sqlCommand = `SELECT * FROM bike_build where user_id = '${user_id}'`
    const dbResponse = await client.query(sqlCommand)

    // console.log(dbResponse)
    
    res.json({
        builds: dbResponse.rows
    })
})

app.get('/autocompleteParts', async (req,res) => {
    const sqlCommand = `SELECT * FROM bike_parts where part = 'frame'`
    const dbResponse = await client.query(sqlCommand)

    console.log(dbResponse);
    res.json({})
})

app.listen(5005, () => {
    console.log('Listening on http://localhost:5005')
})


