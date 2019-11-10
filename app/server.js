// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));


var session = require('express-session');

app.use(session({
    secret: '12345',
    resave: false,
    saveUninitialized: false
}));


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use('/p', express.static('public'));

// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);
var sessionStorage = {};




function compare(a, b) {
    var x = new Date(a["date"]);
    var y = new Date(b["date"]);
    if (x.getTime() < y.getTime()) {
        return -1;
    }
    if (x.getTime() > y.getTime()) {
        return 1;
    }
    return 0;
}

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function() {
    if (!exists) {
        db.run('CREATE TABLE user (user text primary key,password text,creation integer ,modification integer,effacement integer,administration integer )');
        console.log('New table Users created!');
        db.run('CREATE TABLE postit (id integer primary key autoincrement, texte text,author text references user(user) ,posx integer, posy integer, date text,tableau text)');
        console.log('New table postit created!');

        // insert default dreams
        db.serialize(function() {
            db.run('INSERT INTO user VALUES ("admin","admin",1,1,1,1)');
            db.run('INSERT INTO user VALUES ("guest","",0,0,0,0)');
        });
    } else {
        console.log('Database "users" ready to go!');

        db.each('SELECT * from user', function(err, row) {
            if (row) {
                console.log('record:', row);
            }
        });
    }
});




// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
    response.sendFile(__dirname + "/public/index.html");
});


app.get('/client.js', function(request, response) {
    response.sendFile(__dirname + "/public/client.js");
});


app.get('/admin.js', function(request, response) {
    response.sendFile(__dirname + "/public/admin.js");
});

app.get('/style.css', function(request, response) {
    response.sendFile(__dirname + "/public/style.css");
});

app.get('/login.css', function(request, response) {
    response.sendFile(__dirname + "/public/login.css");
});



// endpoint to get all the dreams in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
app.get('/liste', function(request, response) {
    db.all('SELECT * from postit', function(err, rows) {
        for (var postit in rows) {

            if (rows[postit]["author"] == request.session.user) {
                rows[postit]["self"] = true;
            } else {
                rows[postit]["self"] = false;
            }
        }
        response.send(JSON.stringify(rows.sort(compare)));
    });
});

app.get('/liste/:tableau', function(request, response) {
    db.all('SELECT * from postit where tableau=\''+request.params.tableau+'\'', function(err, rows) {
        for (var postit in rows) {

            if (rows[postit]["author"] == request.session.user) {
                rows[postit]["self"] = true;
            } else {
                rows[postit]["self"] = false;
            }
        }
        response.send(JSON.stringify(rows.sort(compare)));
    });
});

app.post('/login', function(request, response) {
    if (request.session.user) {
        response.redirect('/');
    } else {
        db.all('SELECT * from user where user="' + request.body.user + '" and password = "' + request.body.password + '" ', function(err, rows) {
            console.log(rows);
            if (rows.length > 0) {
                console.log("login ok");
                request.session.user = request.body.user;
                response.redirect('/');
            } else {
                console.log("login not ok");
                response.redirect('/login');
            }
        });

    }
});

app.get('/ajouter/:text/:x/:y', function(request, response) {
    if (request.session.user) {
        //test droit 
         db.each('SELECT user from user where user = ? and (effacement = 1 or administration = 1)', [request.session.user], function(err, row) {
        //ajout 
        
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        var hrs = String(today.getHours());
        var mins = String(today.getMinutes());
        var ss = String(today.getSeconds()).padStart(2, '0');
        today = yyyy + '-' + mm + '-' + dd + 'T' + hrs + ':' + mins + ':' + ss;
        var query = 'insert into postit (texte,author,posx,posy,date,tableau ) values ("' + request.params.text + '","' + request.session.user + '",' + request.params.x + ',' + request.params.y + ',"' + today + '","")';
        console.log(query);
        db.run(query, function(err,row) {
            if (err) {
                response.send("{ \"error\" : \"insert\" }");
            }
            else{
            // get the last insert id
            var res = '{\"id\": ' + this.lastID + ' , \"text\" : \"' + request.params.text + '\" , \"author\" : \"' + request.session.user + '\" , \"posx\" : ' + request.params.x + ' , \"posy\" : ' + request.params.y + ' , \"date\" : \"' + today + '\" }';

            response.send(res);
            }
          
        });
           }, function(err, rows) {
        if (rows == 0) {
            response.status(400).send({
                message: 'Droit ajout non accordé'
            });
        }
    }); 

    } else {
        response.send("{ \"error\" : \"login\" }");
    }
});


app.get('/ajouter/:text/:x/:y/:tableau', function(request, response) {
    if (request.session.user) {
        //test droit 
         db.each('SELECT user from user where user = ? and (effacement = 1 or administration = 1)', [request.session.user], function(err, row) {
        //ajout 
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        var hrs = String(today.getHours());
        var mins = String(today.getMinutes());
        var ss = String(today.getSeconds()).padStart(2, '0');
        today = yyyy + '-' + mm + '-' + dd + 'T' + hrs + ':' + mins + ':' + ss;
        var query = 'insert into postit (texte,author,posx,posy,date ,tableau) values ("' + request.params.text + '","' + request.session.user + '",' + request.params.x + ',' + request.params.y + ',"' + today + '","'+request.params.tableau+'")';
        console.log(query);
        db.run(query, function(err) {
            if (err) {
                response.send("{ \"error\" : \"insert\" }");
            }
            // get the last insert id
            var res = '{\"id\": ' + this.lastID + ' , \"text\" : \"' + request.params.text + '\" , \"author\" : \"' + request.session.user + '\" , \"posx\" : ' + request.params.x + ' , \"posy\" : ' + request.params.y + ' , \"date\" : \"' + today + '\" }';

            response.send(res);
        });
           }, function(err, rows) {
        if (rows == 0) {
            response.status(400).send({
                message: 'Droit ajout non accordé'
            });
        }
    }); 

    } else {
        response.send("{ \"error\" : \"login\" }");
    }
});


app.get('/modifier/:id/:text', function(request, response) {
    if (request.session.user) {
      //test droits 
      db.each('SELECT user,administration from user where user = ? and (effacement = 1 or administration = 1)', [request.session.user], function(err, row) {
       
         var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        var hrs = String(today.getHours());
        var mins = String(today.getMinutes());
        var ss = String(today.getSeconds()).padStart(2, '0');
        today = yyyy + '-' + mm + '-' + dd + 'T' + hrs + ':' + mins + ':' + ss; 
        //modification
        if (row.administration == "1")
        {
          var query = 'update  postit set texte=\'' + request.params.text + '\' , date =\'' + today + '\' where id =' + request.params.id + '';
        console.log(query);
        db.run(query, function(err) {
            if (err) {
                response.send("{ \"error\" : \"update\" }");
            }

            response.send("{ \"ok\" : \"ok\" }");
        });
        }
        else
        {
         var query = 'update  postit set texte=\'' + request.params.text + '\' , date =\'' + today + '\' where id =' + request.params.id + ' and author=\'' + request.session.user + '\'';
        console.log(query);
        db.run(query, function(err) {
            if (err) {
                response.send("{ \"error\" : \"update\" }");
            }

            response.send("{ \"ok\" : \"ok\" }");
        }); 
          
        }  
          
      }, function(err, rows) {
        if (rows == 0) {
            response.status(400).send({
                message: 'Droit modification non accordé'
            });
        }
    }); 
      

    } else {
        response.send("{ \"error\" : \"login\" }");
    }
});




app.get('/modifierPosition/:id/:x/:y', function(request, response) {
    if (request.session.user) {
      //test droits 
      db.each('SELECT user,administration from user where user = ? and (modification = 1 or administration = 1)', [request.session.user], function(err, row) {
       
          
        //modification
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        var hrs = String(today.getHours());
        var mins = String(today.getMinutes());
        var ss = String(today.getSeconds()).padStart(2, '0');
        today = yyyy + '-' + mm + '-' + dd + 'T' + hrs + ':' + mins + ':' + ss;
        if (row.administration == "1")
        {
           var query = 'update postit set posx=' + request.params.x + ' , date =\'' + today + '\', posy =' + request.params.y + ' where id =' + request.params.id +  '';console.log(query);
        db.run(query, function(err) {
            if (!err) {
              
              response.send("{ \"ok\" : \"ok\" }");
                
            }
          else{
            response.send("{ \"error\" : \"update\" }");          
          }

            
        });
        }
        else
        {
           var query = 'update postit set posx=' + request.params.x + ' , date =\'' + today + '\', posy =' + request.params.y + ' where id =' + request.params.id + ' and author=\'' + request.session.user + '\'';console.log(query);
        db.run(query, function(err) {
            if (!err) {
              
              response.send("{ \"ok\" : \"ok\" }");
                
            }
          else{
            response.send("{ \"error\" : \"update\" }");          
          }

            
        });
        }
          
      }, function(err, rows) {
        if (rows == 0) {
            response.status(400).send({
                message: 'Droit modification non accordé'
            });
        }
    }); 
      

    } else {
        response.send("{ \"error\" : \"login\" }");
    }
});





app.get('/login', function(request, response) {
    if (request.session.user) {
        console.log("deja en ligne");
        response.redirect('/');

    } else {
        response.sendFile(__dirname + "/public/login.html");
    }
});



app.get('/logout', function(request, response) {
    request.session.user = null;
    response.redirect('/');

});


app.get('/connectedUser', function(request, response) {

    response.send("{ \"user\" : \"" + request.session.user + "\" }");

});


app.get('/effacer', function(request, response) {
  if (request.session.user)
  {
    var id = request.query.id;
    // test droits
    db.each('SELECT user,administration from user where user = ? and (effacement = 1 or administration = 1)', [request.session.user], function(err, row) {
        
      //effacement
      if (row.administration == "1")
      {
         db.each('SELECT id from postit where id = ? ', [id], function(err, row) {
        db.run('DELETE from postit where id = ?', [id]);
        response.status(200).send({
            message: 'id post it supprimé'
        });
      }, function(err, rows) {
        if (rows == 0) {
            response.status(400).send({
                message: 'id post it non existant '
            });
        }
    });
      }
      else
      {
       db.each('SELECT id from postit where id = ? and author = ? ', [id,request.session.user], function(err, row) {
        db.run('DELETE from postit where id = ?', [id]);
        response.status(200).send({
            message: 'id post it supprimé'
        });
      }, function(err, rows) {
        if (rows == 0) {
            response.status(400).send({
                message: 'id post it non existant ou accés a postit non accordé'
            });
        }
    });
      }
     
      
    }, function(err, rows) {
        if (rows == 0) {
            response.status(400).send({
                message: 'Droit effacement non accordé'
            });
        }
    });
    
  }
  else
  {
    response.send("{ \"error\" : \"login\" }");
  }
  
});

app.get('/signup', function(request, response) {

    response.sendFile(__dirname + "/public/signup.html");

});

app.get('/getUsers', function(request, response) {
    var ret=false;
    db.all('SELECT user ,creation ,modification ,effacement ,administration from user', function(err, rows) {
      for(var i in rows){
        if(rows[i]["user"]==request.session.user && rows[i]["administration"]==1){
            ret=true;
            break;
        }
      }
      if(ret){
       response.send(JSON.stringify(rows));
      }
      else{
      response.send("Vous n'avez pas le droit de visiter ce lien");
      }
     
    });
});


app.get('/mesDroits', function(request, response) {
   if (request.session.user) {
       db.all('SELECT creation,modification ,effacement ,administration from user where user=\''+request.session.user+'\'', function(err, rows) {
          if(!err){
            response.send(JSON.stringify(rows));
          }else{
             console.log("aaaa")
            response.send("{ \"error\" : \"error\"}");
          }
      
    });

    }
  else{
    db.all('SELECT creation,modification ,effacement ,administration from user where user=\'guest\'', function(err, rows) {
          if(!err){
           
            response.send(JSON.stringify(rows));
          }else{
             console.log("hhhh")
            response.send("{ \"error\" : \"error\"}");
          }
      
    });
  
  }
    
});


app.get('/admin', function(request, response) {
    db.all('SELECT user from user where user=\'' + request.session.user + '\' and administration=1', function(err, rows) {
        if (rows.length > 0) {

            response.sendFile(__dirname + "/public/admin.html");
        } else {
            response.redirect('/login');
        }
    });
});


app.get('/ajouterDroit/:user/:droit', function(request, response) {

    db.all('SELECT user from user where user=\'' + request.session.user + '\' and administration=1', function(err, rows) {
        if (rows.length > 0) {
          var query ="";
          if(request.params.droit=='administration'){
            query=  'UPDATE user set ' + request.params.droit + '=1 , creation=1,effacement=1,modification=1 where user=\'' + request.params.user + '\'';
          }
          else{
              query='UPDATE user set ' + request.params.droit + '=1 where user=\'' + request.params.user + '\'';
          }
           
            db.run(query, function(err) {
                if (err) {
                    response.send("{ \"error\" : \"update\" }");
                } else {
                    response.send("{ \"error\" : \"ok\" }");

                }
            });



        } else {
            response.send("{ \"error\" : \"admin\"}"); //utilisateur inexistant
        }
    });

});


app.get('/annulerDroit/:user/:droit', function(request, response) {

    db.all('SELECT user from user where user=\'' + request.session.user + '\' and administration=1', function(err, rows) {
        if (rows.length > 0) {

            var query = 'UPDATE user set ' + request.params.droit + '=0 where user=\'' + request.params.user + '\'';
            db.run(query, function(err) {
                if (err) {
                    response.send("{ \"error\" : \"update\" }");
                } else {
                    response.send("{ \"error\" : \"ok\" }");

                }
            });



        } else {
            response.send("{ \"error\" : \"admin\"}"); //utilisateur inexistant
        }
    });

});


app.post('/signup', function(request, response) {
    if (request.body.user != null && request.body.pass != null) {
        db.each('SELECT user from user where user = ?', [request.body.user], function(err, row) {

            response.status(400).send({
                message: 'utilisateur existant'
            });

        }, function(err, rows) {

            if (rows == 0) {
                db.run('INSERT INTO user VALUES (?,?,1,1,1,0)', [request.body.user, request.body.pass]);
                // test 
                db.each('SELECT * from user', function(err, row) {
                    if (row) {
                        console.log('record:', row);
                    }
                });
                response.status(200).send({
                    message: 'utilisateur crée'
                });
            }
        });
    } else {
        response.status(400).send({
            message: 'pas de champs'
        });
    }
});

app.get('/maj', function(request, response) {
    //date get 
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var hrs = String(today.getHours());
    var mins = String(today.getMinutes());
    var ss = String(today.getSeconds()).padStart(2, '0');
    today = yyyy + '-' + mm + '-' + dd + 'T' + hrs + ':' + mins + ':' + ss;


    if (request.session.user != null && request.query.pass != null) {
        var id = request.query.id;
        db.each('SELECT id from postit where id = ?', [id], function(err, row) {
            db.run('update postit set texte = ?, date = ? where id = ?', [request.query.texte, today, id]);
            response.status(200).send({
                message: 'id post it supprimé'
            });
        }, function(err, rows) {
            if (rows == 0) {
                response.status(400).send({
                    message: 'id post it non existant'
                });
            }
        });
    } else {
        response.status(400).send({
            message: 'pas de champs'
        });
    }
});

app.get('/*', function(request, response) {
    response.sendFile(__dirname + "/public/index.html");
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
    console.log('Your app is listening on port ' + listener.address().port);
});