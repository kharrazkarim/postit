 // client-side js
// run by the browser each time your view template referencing it is loaded
async function deletePostit(id) {

    var choix = confirm('Voulez vous supprimer');
    if (choix) {

        await fetch("effacer?id=" + id).then(function(response) {
            return response.json();
        });

        getListe();



    }

}

async function updatePostit(id) {

    var choix = prompt('Entrer le nouveau texte du postit');
    if (choix) {

        await fetch("modifier/" + id + "/" + choix).then(function(response) {
            return response.json();
        });

        getListe();



    }

}




async function getConnectedUser() {



    var user = await fetch("connectedUser");
    user = await user.json();

    if (user["user"] != "null" && user["user"] != "undefined") {

        document.getElementById("login").innerHTML = "Bonjour " + user["user"] + " <a href=\"logout\">Deconnexion<a/> ";
    var droits = await fetch("mesDroits");
    droits = await droits.json();
    if(droits[0]["administration"]=="1"){
       document.getElementById("login").innerHTML+=" <a href=\"admin\">Panneau d'administration<a/> ";
    }

    } else {
        document.getElementById("login").innerHTML = "Bonjour , veuillez vous connecter pour pouvoir ajouter des postit <a href=\"login\">Connexion<a/> <a href=\"signup\">inscription<a/> ";
    }
    

}
getConnectedUser()

async function getListe() {

    var loc = window.location.pathname.substring(1, window.location.pathname.length);
    var getLink = "liste";
    if (loc != "") {
        getLink += "/" + loc;

    }

    var j = await fetch(getLink);
    j = await j.json();



    var droits = await fetch("mesDroits");
    droits = await droits.json();

    document.getElementById("main").innerHTML = ""


    for (var postit in j) {
        console.log(j[postit]["id"]);
        var texte = JSON.stringify(j[postit]["texte"]);
        texte = texte.substring(1, texte.length - 1);
        var author = JSON.stringify(j[postit]["author"]);
        author = author.substring(1, author.length - 1);
        var date = JSON.stringify(j[postit]["date"].toString());
        date = date.substring(1, date.length - 1);
        var posx = JSON.stringify(j[postit]["posx"]);
        var posy = JSON.stringify(j[postit]["posy"]);
        var id = JSON.stringify(j[postit]["id"]);
        var self = j[postit]["self"];
        var supprimer = "effacer?id=" + id;
        var size = screen.width * 0.02;
        var postit = "<div id=\"" + id + "\" style=\" overflow-wrap: break-word; display:inline-block; %; position: absolute; width:20%  ;left: " + posx + "%;top: " + posy + "%; background: #ffff88; /* Old browsers */background: -moz-linear-gradient(-45deg, #ffff88 81%, #ffff88 82%, #ffff88 82%, #ffffc6 100%);background: -webkit-gradient(linear, left top, right bottom, color-stop(81%,#ffff88), color-stop(82%,#ffff88), color-stop(82%,#ffff88), color-stop(100%,#ffffc6)); background: -webkit-linear-gradient(-45deg, #ffff88 81%,#ffff88 82%,#ffff88 82%,#ffffc6 100%); background: -o-linear-gradient(-45deg, #ffff88 81%,#ffff88 82%,#ffff88 82%,#ffffc6 100%); background: -ms-linear-gradient(-45deg, #ffff88 81%,#ffff88 82%,#ffff88 82%,#ffffc6 100%); background: linear-gradient(135deg, #ffff88 81%,#ffff88 82%,#ffff88 82%,#ffffc6 100%);filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffff88', endColorstr='#ffffc6',GradientType=1 );border-bottom-right-radius: 60px 5px;box-shadow:0px 15px 5px rgba(0, 0, 0, 0.40);\">";




        console.log("admin=", droits);
        if (droits[0]["administration"] == "1") {
            postit += "<button style=\"position:absolute;left: 80%;\" onclick=\"return updatePostit(" + id + ")\">M</button>";
            postit += "<button style=\"position:absolute;left: 90%;\" onclick=\"return deletePostit(" + id + ")\">X</button>";

        } else if (self) {

            if (droits[0]["effacement"] == "1") {
                postit += "<button style=\"position:absolute;left: 80%;\" onclick=\"return updatePostit(" + id + ")\">M</button>";
            }


            if (droits[0]["modification"] == "1") {
                postit += "<button style=\"position:absolute;left: 90%;\" onclick=\"return deletePostit(" + id + ")\">X</button>";
            }




        }

        postit += "<p>" + author + " " + date + "</p> <p>" + texte + "</p></div>";


        document.getElementById("main").innerHTML += postit;

        if ((self && droits[0]["modification"] == "1") || droits[0]["administration"]) {
            var myDiv = document.getElementById(id);
            var att = document.createAttribute("draggable");
        
      
      
      
            att.value = "true";
            myDiv.setAttributeNode(att);  }  }
  
  
  
            document.getElementById("main").addEventListener("dragstart", function(event) {
               
                // Stocke une référence sur l'objet glissable
                var dragged = event.target;
                // transparence 50%
                event.target.style.opacity = 0.1;
            }, false);

            document.getElementById("main").addEventListener("dragend", function(event) {
                // reset de la transparence
              
                event.target.style.opacity = "";

                var wth = getWidth();
                var hth = getHeight();


                var xpos = event.clientX;
                var ypos = event.clientY;
                console.log("x=" + xpos);
                if (ypos > hth * 0.05) {

                    if (ypos < 5) {
                        ypos = ypos + (5 - ypos);
                    }
                    if (xpos + (wth * 0.2) > wth) {

                        xpos = xpos - ((xpos + 10 + (wth * 0.2)) - wth);
                    }
                    if (ypos + (wth * 0.03) > hth) {

                        ypos = ypos - ((ypos + (wth * 0.03)) - hth);
                    }

                    var pourcentageX = (xpos / wth * 100);
                    var pourcentageY = (ypos / hth * 100);
                    event.target.style.left=pourcentageX+"%";
                     event.target.style.top=pourcentageY+"%";
                    var result = modifierPosition(event.target.id, pourcentageX, pourcentageY);
                 
                    
                }

            }, false);



       return j;
    }



   




    //  setTimeout(getListe(), 10000);





//Hauteur actuelle ecran
function getHeight() {
    var myHeight = 0;
    if (typeof(window.innerWidth) == 'number') {
        //Non-IE

        myHeight = window.innerHeight;
    } else if (document.documentElement && (document.documentElement.clientHeight)) {
        //IE 6+ in 'standards compliant mode'

        myHeight = document.documentElement.clientHeight;
    } else if (document.body && (document.body.clientHeight)) {
        //IE 4 compatible

        myHeight = document.body.clientHeight;
    }

    return myHeight;
}
//largeur actuelle ecran
function getWidth() {
    var myWidth = 0;
    if (typeof(window.innerWidth) == 'number') {
        //Non-IE
        myWidth = window.innerWidth;
    } else if (document.documentElement && (document.documentElement.clientWidth)) {
        //IE 6+ in 'standards compliant mode'
        myWidth = document.documentElement.clientWidth;

    } else if (document.body && (document.body.clientWidth)) {
        //IE 4 compatible
        myWidth = document.body.clientWidth;
    }
    return myWidth;
}

async function ajouterPostIt(texte, x, y) {

    var loc = window.location.pathname.substring(1, window.location.pathname.length);
    var fetchString = 'ajouter/' + texte + '/' + x + '/' + y;
    if (loc != "") {
        fetchString += "/" + loc;
    }



    await fetch(fetchString).then(function(response) {
        return response.json();
    }).then(function(j) {

        if (j["error"] == null) {
            alert("Ajoutée avec succes");
            getListe();


        } else if (j["error"] == "login") {
            alert("connecter vous avant d'ajouter un postit");
        } else {
            alert("erreur d'ajout");
        }
        return j;
    });
}




async function modifierPosition(id, x, y) {


    var fetchString = 'modifierPosition/' + id + '/' + x + '/' + y;



    await fetch(fetchString).then(function(response) {
        return response.json();
    }).then(function(j) {

        if (j["ok"] == "ok") {

        } else {
            alert("erreur ");
        }
        return j;
    });
}


getListe();
window.setInterval(function() {

    getConnectedUser();
    getListe();

}, 5000);

document.getElementById("main").addEventListener("dblclick", function(event) {
    // console.log(event.screenX, event.screenY);

    var wth = getWidth();
    var hth = getHeight();
    var xpos = event.clientX;
    var ypos = event.clientY;
    console.log("x=" + xpos);
    if (ypos > hth * 0.05) {
        var texte = prompt("Que voulez vous poster");
        if (ypos < 5) {
            ypos = ypos + (5 - ypos);
        }
        if (xpos + (wth * 0.2) > wth) {

            xpos = xpos - ((xpos + 10 + (wth * 0.2)) - wth);
        }
        if (ypos + (wth * 0.03) > hth) {

            ypos = ypos - ((ypos + (wth * 0.03)) - hth);
        }

        var pourcentageX = (xpos / wth * 100);
        var pourcentageY = (ypos / hth * 100);

        var result = ajouterPostIt(texte, pourcentageX, pourcentageY);
    }


    // document.getElementById("main").innerHTML += texte+" asba x="+event.screenX+" y="+event.screenY+" screen.width="+screen.width+"screen.heigth="+screen.width+"<br>";




});

var content = document.getElementById('main')
var zX = 1;
window.addEventListener('wheel', function (e) {
    var dir;
   
    dir = (e.deltaY > 0) ? 0.1 : -0.1;
    zX += dir;
  if(zX>0){
        console.log(zX);
         content.style.transformOrigin=e.clientX+'px '+e.clientY+'px';
         content.style.transform = 'scale(' + zX + ') ';
         
  }

    e.preventDefault();
    return;
});





