

/* if (window.jQuery) {  
    console.log('we have jquery'); 
} else {
    console.log('we don"t have jquery');
} */

// hosted file

// dictionary to hold weapons and their damage dice type. used to compile the new version of attack parameters
var armory = {
    'club': 4,
    'great club': 8,
    'dagger': 4,
    'short sword': 6,
    'long sword': 8,
    'bastard sword': 10,
    'great sword': 12,
    'rapier': 8,
    'scimitar': 6,
    'sickle': 4,
    'hand axe': 6,
    'battle axe': 8,
    'war axe': 10,
    'great axe': 12,
    'javelin': 6,
    'spear': 6,
    'flail': 8,
    'glaive': 10,
    'halberd': 10,
    'lance': 12,
    'pike': 10,
    'trident': 6,
    'war pick': 8,
    'light hammer': 4,
    'mace': 6,
    'war hammer': 8,
    'quaterstaff': 6,
    'morningstar': 8,
    'whip': 4,
    'claws': 8,
    'bite': 10
};


function flip(name, way) {
    if (way == 1) {
        $("#OFF_" + name).show();
        $("#ON_" + name).hide();
        $("#DIV_" + name).hide('slow');
    }
    else {
        $("#OFF_" + name).hide();
        $("#ON_" + name).show();
        $("#DIV_" + name).show('slow');
    }
}

//function duel_t() {
//    $.ajax({
//        method: "POST",
//        url: "",
//        data: []
//    })
//        .done(function (msg) {
//            alert("Data Saved: " + msg);
//        });
//}

function duel_t() {
    var lineup = sessionStorage.getItem('lineup')
    $.ajax({
        type: "POST",
        contentType: 'application/json',
        url: "/poster/",
        dataType: 'json',
        data: JSON.stringify(lineup)
    })
        .done(function (msg) {
            alert("Data Saved: " + msg);
        });
}


function Output(text) {
    flip("result", 0);
    $("#OUT_battles").html("");
    $("#OUT_rounds").html("");
    $("#OUT_prediction").html("");
    $("#OUT_notes").html("");
    $("#OUT_team").html("");
    $("#OUT_combattant").html("");
    $("#status").html("Calculations complete");
    console.log(text);
    reply = JSON.parse(text);

    header = {
        notes: "Notes",
        rounds: "Total number of rounds fought",
        battles: "Total number of battles fought",
        prediction: "Rought predictions",
    }
    for (k in header) {
        console.log("#OUT_" + k)
        $("#OUT_" + k).html(header[k] + ": " + reply[k]);
    }
    tmax = 100 / 4;
    t = "<table class=res><thead><tr>" +
        "<th width='" + tmax + "%'>Team name</th>" +
        "<th width='" + tmax + "%'>Number of victories</th>" +
        "<th width='" + tmax + "%'>Number of close calls</th>" +
        "<th width='" + tmax + "%'>Number of perfects</th>" + "</tr></thead><tbody>";
    for (ti = 0; ti < reply["team_names"].length; ti++) {
        t += "<tr><th width='" + tmax + " %'>" + reply["team_names"][ti] + "</th><td width='" + tmax + "%'>" +
            reply["team_victories"][ti] + "</td><td width='" + tmax + "%'>" +
            reply["team_close"][ti] + "</td><td width='" + tmax + "%'>" +
            reply["team_perfects"][ti] + "</td>" + "</tr>";
    }
    t += "</tbody></table>";
    $("#OUT_team").html(t);
    cmax = 100 / 6;
    c = "<table class=res><thead><tr>" +
        "<th width='" + cmax + "%'>Combattant</th>" +
        "<th width='" + cmax + "%'>Team</th>" +
        "<th width='" + cmax + "%'>avg damage</th>" +
        "<th width='" + cmax + "%'>avg hits</th>" +
        "<th width='" + cmax + "%'>avg misses</th>" +
        "<th width='" + cmax + "%'>avg rounds</th>" +
        "</tr></thead><tbody>";
    for (ci = 0; ci < reply["combattant_names"].length; ci++) {
        c += "<tr><th width='" + cmax + " %'>" + reply["combattant_names"][ci] + "</th><td width='" + cmax + " %'>" +
            reply["combattant_alignments"][ci] + "</td><td width='" + cmax + " %'>" +
            parseFloat(reply["combattant_damage_avg"][ci]).toFixed(2) + "</td><td width='" + cmax + " %'>" +
            parseFloat(reply["combattant_hit_avg"][ci]).toFixed(2) + "</td><td width='" + cmax + " %'>" +
            parseFloat(reply["combattant_miss_avg"][ci]).toFixed(2) + "</td><td width='" + cmax + " %'>" +
            parseFloat(reply["combattant_rounds"][ci]).toFixed(2) + "</td>" +
            "</tr>";
    }
    c += "</table>";
    $("#OUT_combattant").html(c);
    $("#OUT_sample").html(reply['sample_encounter']);
}

function duel() {
    var lineup = sessionStorage.getItem('lineup')
    console.log(lineup);
    flip("result", 1)
    document.getElementById("status").innerHTML = "<i class='fa fa-spinner fa-pulse'></i> Simulation in progress.";
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) { Output(xmlhttp.responseText); }
    }
    xmlhttp.open("POST", "/poster/", true); // formerly : "POST", "wsgi.py", true
    // xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send(lineup);
}

function Add(newbie) {
    var lineup = JSON.parse(sessionStorage.getItem('lineup'));
    lineup.push(newbie);
    sessionStorage.setItem('lineup', JSON.stringify(lineup));
    $("#lineup").html(JSON.stringify(lineup));
}

function AddA() {
    var newbie = $("#drop").val();
    var numberOf = $("#numberOfA").val();

    for (var x = 0; x < numberOf; x++) {
        Add(newbie);
    }

    $("#confA").show("slow");
    $("#confA").hide("slow");
}

function AddB() {
    var newbie = {};
    var numberOf = $("#numberOfC").val();

    $("#table").find('input').each(function (index, element) {
        key = $(this).attr('id');
        var v = $("#" + key).val();

        // if the value is not null
        if (!!v) {
            // record the value of CR
            newbie[key] = v;
            // get value of BR/Morale from CR and store value
            if (key == "CR") {
                key = "BR";//this could also be "morale"
                v = calcBR(v);
                newbie[key] = v;
            };
        };

    });

    for (var x = 0; x < numberOf; x++) {
        Add(newbie);
    }
    $("#confC").show("slow");
    $("#confC").hide("slow");
}

function figureAtkParams() {
    var w = $("#weapon").val();
    var th = $("#attack_hit").val();
    var dMod = $("#attack_dmgmod").val();
    var dice = armory[w];

    if (dice) {
        $("#attack_dicedmg").val(dice);
        $("#attack_dicedmg").prop("disabled", true);
    } else {
        $("#attack_dicedmg").prop("disabled", false);
        dice = $("#attack_dicedmg").val();
    }

    // if there's a value in the To Hit field, they must want that one to be used, so we will leave it alone.
    if (th == "") {
        // call method to figure to hit from st or dx (should add... somthing to indicate which one... slapdash for the moment)
        // getToHit();
        th = 0;
    }

    if (dMod == "") {
        dMod = 0;
    }

    var r = w + ", " + th + ", " + dMod + ", " + dice;
    $('#aParams').text("[" + r + "]");
    // call method to figure Damage modifier
}

function weaponDice() {
    var w = $("#weapon").val();
    for (var arm in armory) {
        if (arm == w) {
            $("#attack_dicedmg").val(armory[w]);
            return
        }
    }
}

function getToHit() {

}

function queueAttack() {
    // move new attack parameter to attack list
    var c = '';
    if ($("#attacks").text().length > 1) {
        c = ','
    }
    $("#attacks").append(c + $("#aParams").text());
}

function saveAttack() {
    // move attack list to attack parameters field in custom combatant
    var s = '[' + $("#attacks").text() + ']';
    $("#attack_parameters").val(s);
}

function clearAttacks() {
    // clears the attack queue
    $("#attacks").text("");
}

function calcBR(v) {
    if (v > 5) {
        var t;
        // sans equation, so have to do with a switch to find BR.
        switch (v) {
            case "6":
                t = 7;
                break;
            case "7":
                t = 8;
                break;
            case "8":
                t = 9;
                break;
            case "9":
                t = 10.5;
                break;
            case "10":
                t = 12;
                break;
            case "11":
                t = 14;
                break;
            case "12":
                t = 15;
                break;
            case "13":
                t = 16.5;
                break;
            case "14":
                t = 18;
                break;
            case "15":
                t = 20;
                break;
            case "16":
                t = 22;
                break;
            case "17":
                t = 24;
                break;
            case "18":
                t = 27;
                break;
            case "19":
                t = 30;
                break;
            case "20":
                t = 33;
                break;
            case "21":
                t = 36;
                break;
            case "22":
                t = 40;
                break;
            case "23":
                t = 44;
                break;
            case "24":
                t = 48;
                break;
            case "25":
                t = 55;
                break;
            case "26":
                t = 68;
                break;
            case "27":
                t = 81;
                break;
            case "28":
                t = 95;
                break;
            case "29":
                t = 110;
                break;
            case "30":
                t = 126;
                break;
        }

        v = t;
    }
    return v;
}

function clearB() {
    // Resets the input values to default value, if one is assined else, makes field blank.

    $("#table").find('input').each(function (index, element) {
        key = $(this).attr('id');
        defaultVal = $(this).attr('value');

        // if the field has a default value, reset it
        if (!!defaultVal) {
            $("#" + key).val(defaultVal);
        }
        else { $("#" + key).val(""); } // else clear value
    })
}

function initial() {
    $("#def").keyup(function (event) { if (event.keyCode == 13) { AddB(); } });
    $("#confA").hide();
    $("#confB").hide();
    $("#confC").hide();
    $("#failB").hide();
    sessionStorage.setItem('lineup', JSON.stringify([]));
    $("#OFF_more").hide();
    $("#OFF_work").hide();
    $("#OFF_link").hide();
    $("#OFF_motive").hide();
    $("#OFF_tool").hide();
    $("#OFF_future").hide();
    $("#OFF_setup").hide();
    $("#ON_result").hide();
    $("#DIV_result").hide();
    $("#OUT_sample").hide();
}

$(document).ready(initial) 