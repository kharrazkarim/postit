async function ajouterDroit(user, droit) {



    var user = await fetch("ajouterDroit/" + user + "/" + droit).then(function(response) {
        console.log(response);
        return response.json();
    });

    if (user["error"] == "ok") {
        updateUserList();

    }


}


async function annulerDroit(user, droit) {



    var user = await fetch("annulerDroit/" + user + "/" + droit).then(function(response) {
        console.log(response);
        return response.json();
    });

    if (user["error"] == "ok") {
        updateUserList();

    }


}




async function updateUserList() {

    document.getElementById("listeUtilisateurs").innerHTML = "";

    var user = await fetch("getUsers").then(function(response) {

        return response.json();
    });


    for (var u in user) {

        var col = "<tr><td>" + user[u]["user"] + "</td>";
        if (user[u]["creation"] == "1") {
            col += "<td><button onClick=annulerDroit(\"" + user[u]["user"] + "\",\"creation\")>annuler</button></td>";
        } else {
            col += "<td><button onClick=ajouterDroit(\"" + user[u]["user"] + "\",\"creation\")>ajouter</button></td>";
        }


        if (user[u]["modification"] == "1") {
            col += "<td><button onClick=annulerDroit(\"" + user[u]["user"] + "\",\"modification\")>annuler</button></td>";
        } else {
            col += "<td><button onClick=ajouterDroit(\"" + user[u]["user"] + "\",\"modification\")>ajouter</button></td>";
        }



        if (user[u]["effacement"] == "1") {
            col += "<td><button onClick=annulerDroit(\"" + user[u]["user"] + "\",\"effacement\")>annuler</button></td>";
        } else {
            col += "<td><button onClick=ajouterDroit(\"" + user[u]["user"] + "\",\"effacement\")>ajouter</button></td>";
        }



        if (user[u]["administration"] == "1") {
            col += "<td><button onClick=annulerDroit(\"" + user[u]["user"] + "\",\"administration\")>annuler</button></td>";
        } else {
            col += "<td><button onClick=ajouterDroit(\"" + user[u]["user"] + "\",\"administration\")>ajouter</button></td>";
        }




        col.innerHTML += "</tr>";

        document.getElementById("listeUtilisateurs").innerHTML += col;

    }
}

updateUserList();

window.setInterval(function() {

    updateUserList();

}, 10000);