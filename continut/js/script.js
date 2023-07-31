function sectiunea_1()
{
    var data = document.getElementById("data");
    var url = document.getElementById("URL");
    var locatie = document.getElementById("locatie");
    var nume = document.getElementById("browser");
    var versiune = document.getElementById("versiune");
    var so = document.getElementById("so");
    
    data.innerText = "Data curenta este: " + new Date().toDateString();
    url.innerText = "URL: " + window.location.href;
    navigator.geolocation.getCurrentPosition(
        (position) => 
        {
            locatie.innerHTML = "Latitudine: " + position.coords.latitude +
            "<br/>Longitudine: " + position.coords.longitude; 
        }
    );
    nume.innerText = "Browser: " + window.navigator.appCodeName;
    versiune.innerText = "Versiune: " + window.navigator.appVersion;
    so.innerText = "Sistem de operare: " + window.navigator.platform;
    ora_curenta();
}

function ora_curenta()
{
    var ora = document.getElementById("ora");
    var today = new Date();
    ora.innerHTML = "Ora curenta este: " + today.getHours() + ":" + today.getMinutes();
}

var puncte  = true;
var punct_2_x = null;
var punct_2_y = null;

function sectiunea_2(event)
{
    var canvas = document.getElementById("canvas");
    var pozitie_x = event.offsetX;
    var pozitie_y = event.offsetY;

    var ox = pozitie_x;
    var oy = pozitie_y;

    if(puncte == true)
    {
        puncte = false;
        punct_2_x = pozitie_x;
        punct_2_y = pozitie_y;
    }
    else
    {
        puncte = true;
        var ctx = canvas.getContext("2d");
        ctx.beginPath();

        if(punct_2_x < ox && punct_2_y < oy)
            ctx.rect(punct_2_x, punct_2_y, Math.abs(punct_2_x - ox), Math.abs(punct_2_y - oy));
        else if(punct_2_x > ox && punct_2_y > oy)
            ctx.rect(ox, oy, Math.abs(ox - punct_2_x), Math.abs(oy - punct_2_y));
        else if(punct_2_x > ox && punct_2_y < oy)
            ctx.rect(ox, punct_2_y, Math.abs(ox - punct_2_x), Math.abs(punct_2_y - oy));
        else if(punct_2_x < ox && punct_2_y > oy)
            ctx.rect(punct_2_x, oy, Math.abs(punct_2_x - ox), Math.abs(oy - punct_2_y));

        ctx.lineWidth = 3;
        ctx.strokeStyle = document.getElementById("contur").value;
        ctx.stroke();
        ctx.fillStyle = document.getElementById("umplere").value;
        ctx.fill();
    }
    
}

function schimba_culoarea()
{
    var pozitie = document.getElementById('pozitie').value;
    var tabel = document.getElementById('tabel').getElementsByTagName('td');
    var culoare = document.getElementById("fundal").value;
    tabel[pozitie].style.backgroundColor = culoare;
}

function adauga_linie()
{
    var pozitie_primita = document.getElementById('pozitie').value;
    var tabel_primit = document.getElementById('tabel');
    var locatie = document.createElement('table');

    if (pozitie_primita < 1)
        pozitie_primita = 1;

    var linie = tabel_primit.insertRow(pozitie_primita);
    for (var i = 0; i < tabel_primit.rows[0].cells.length; i++) 
    {
        locatie.appendChild(document.createTextNode(''));
        linie.insertCell(i).appendChild(locatie);
    }
}

function adauga_coloana()
{
    var pozitie_primita = document.getElementById('pozitie').value;
    var tabel_primit = document.getElementById('tabel');
    var locatie = document.createElement('table');

    if (pozitie_primita < 0)
        pozitie_primita = 1;

    for (var i = 0; i < tabel_primit.rows.length; i++) 
    {
        locatie.appendChild(document.createTextNode(''));
        tabel_primit.rows[i].insertCell(pozitie_primita).appendChild(locatie);
    }
}

function schimbaContinut(resursa, jsFisier, jsFunctie) 
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            document.getElementById("continut").innerHTML = this.responseText;
            if (jsFisier) 
            {
                var elementScript = document.createElement('script');
                elementScript.onload = function() 
                {
                    if (jsFunctie) 
                    {
                        window[jsFunctie]();
                    }
                };
                elementScript.src = jsFisier;
                document.head.appendChild(elementScript);
            } 
            else 
            {
                if (jsFunctie) {
                    window[jsFunctie]();
                }
            }
        }
    };
    xhttp.open("GET", resursa + ".html", true);
    xhttp.send();
}

function verificaUtilizator()
{
    var xhttp = new XMLHttpRequest();

    var user = document.getElementById('utilizator').value;
    var pass = document.getElementById('parola').value;

    xhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            myJson = JSON.parse(xhttp.responseText);
            for (var person in myJson)
            {
                if(myJson[person].utilizator == user && myJson[person].parola == pass)
                {
                    document.getElementById("rezultat").innerText = "Am găsit utilizatorul introdus.";
                    return;
                }
            }
            
            document.getElementById("rezultat").innerText = "Nu există un utilizator cu aceste date.";
        }
    }
    xhttp.open("GET", "resurse/utilizatori.json", true);
    xhttp.send();
}

function inregistreaza()
{
    var utilizator = document.getElementById("numeUtilizator").value;
    var parola = document.getElementById("parola").value;
    var jsonString;
    var xhttp = new XMLHttpRequest();
  
    var object = new Object();
    object.utilizator = utilizator;
    object.parola = parola;
    
    jsonString = JSON.stringify(object);
  
    xhttp.open("POST", "/api/utilizatori", true);
    xhttp.send(jsonString);
}