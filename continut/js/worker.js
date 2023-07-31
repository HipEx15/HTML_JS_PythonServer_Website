onmessage = function(mesaj) 
{
    console.log("Am primit mesaj de la cumparaturi.js: "+ mesaj.data);
    console.log("Trimit raspuns catre cumparaturi.js");
    postMessage("actualizeaza_tabel_produse");
}