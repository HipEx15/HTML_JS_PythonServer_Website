//localStorage.clear();
//indexedDB.deleteDatabase("ProdusDB");

class ProdusGlobal
{
    constructor(nume, cantitate)
    {
        this.produs = new Produs(nume, cantitate);
    }
}

class Produs 
{
    constructor(nume, cantitate)
    {
    this.nume = nume;
    this.cantitate = cantitate;
    }
}

class ProdusDB
{
    constructor(id, nume, cantitate) 
    {
        this.id = id;
        this.nume = nume;
        this.cantitate = cantitate;
    }
}


class LocalStorage extends ProdusGlobal
{
    constructor(nume, cantitate)
    {
        super(nume, cantitate);
    }

    adauga_produs()
    {
        let numar_produse = localStorage.getItem("nr_prod");
        if(numar_produse == null)
            numar_produse = 0;
        else
            numar_produse = parseInt(numar_produse);
    
        let produs_nou = new Produs(this.produs.nume, this.produs.cantitate);
        numar_produse++;
        localStorage.setItem("nr_prod", numar_produse);
        localStorage.setItem(numar_produse, JSON.stringify(produs_nou));
    
        console.log(produs_nou);
    }

    adauga_coloana() 
    {
        let numar_produse = localStorage.getItem("nr_prod");
        if(numar_produse == null)
            numar_produse = 0;
        else
            numar_produse = parseInt(numar_produse);
    
        var tabel = document.getElementById("tabelProduse");
        var linie = tabel.insertRow(numar_produse);
    
        var id = linie.insertCell(0);
        var nume_produs = linie.insertCell(1);
        var cantitate = linie.insertCell(2);
    
        var JSON_produs = JSON.parse(localStorage.getItem(numar_produse));

        id.innerHTML = numar_produse;
        nume_produs.innerHTML = JSON_produs.nume;
        cantitate.innerHTML = JSON_produs.cantitate;
    }
}

function AdaugaProduse()
{
    var rb_local = document.getElementById("local_storage").checked;
    var rb_index = document.getElementById("index_DB").checked;
    var nume_produs = document.getElementById("nume_produs").value;
    var cantitate = document.getElementById("cantitate").value;

    var worker = new Worker('js/worker.js');
    worker.postMessage("Adauga_produs");

    worker.onmessage = (mesaj) => 
    {
        let raspuns_worker = mesaj.data;

        if(raspuns_worker == "actualizeaza_tabel_produse" && cantitate > 0)
        {
            console.log("Actualizez tabelul cu produse.")
            if(rb_local)
            {
                let produse_lc = new LocalStorage(nume_produs, cantitate);
                produse_lc.adauga_produs();
                produse_lc.adauga_coloana();
            }
            else if(rb_index)
            {
                let produse_index = new IndexedDB(nume_produs, cantitate);
                produse_index.adauga_produs();
            }
        }
        else
        {
            alert("Nu pot adauga produsul.");
        }
    }
    
}

function incarcaTabel()
{
    let numar_produse = localStorage.getItem("nr_prod");
    if(numar_produse == null)
        numar_produse = 0;
    else
        numar_produse = parseInt(numar_produse);
    
    var tabel = document.getElementById("tabelProduse");
    for(let i = 1; i <= numar_produse; i++)
    {
        let JSON_produs = JSON.parse(localStorage.getItem(i));

        let linie = tabel.insertRow(i);
        linie.insertCell(0).innerHTML = i;
        linie.insertCell(1).innerHTML = JSON_produs.nume;
        linie.insertCell(2).innerHTML = JSON_produs.cantitate;
    }   
}

var id_nou = 0;
class IndexedDB extends ProdusGlobal
{
    constructor(nume, cantitate)
    {
        super(nume, cantitate);
    }

    adauga_produs()
    {
        var nume_produs = this.produs.nume;
        var cantitate = this.produs.cantitate;

        var request = indexedDB.open("ProdusDB");
        
        request.onerror = (event) => 
        {
            console.error(`Eroare la baza de date: ${event.target.errorCode}`);
        };

        request.onupgradeneeded = (event) => 
        {
            // Save the IDBDatabase interface
            var db = event.target.result;
        
            // Create an objectStore for this database
            if(db.objectStoreNames.contains("produs") == 0)
                var objectStore = db.createObjectStore("produs", { keyPath: "id" });

            objectStore.createIndex("id", "id", {unique:true});
            objectStore.createIndex("nume", "nume", {unique:false});
            objectStore.createIndex("cantitate", "cantitate", {unique:false});
        };

        request.onsuccess = (event) => 
        {
            var db = request.result;

            var tranzactie = db.transaction("produs", "readwrite");
            var produse = tranzactie.objectStore("produs");

            //Pot cauta obiectele dupa id-uri
            var id = produse.index("id");
            var ids = id.getAll();

            ids.onsuccess = function()
            {
                //Preiau id-urile pe care le am, si le cresc cu 1 pt noul obiect
                id_nou = ids.result.length;
                id_nou++;

                //Cream noul obiect
                var produs_nou = new ProdusDB(id_nou, nume_produs, cantitate);
                
                //Trimitem obiectul creat in baza de date
                var raspuns = produse.put(
                    {
                        id: produs_nou.id,
                        nume: produs_nou.nume,
                        cantitate: produs_nou.cantitate
                    });
                
                //Afisam produsul introdus + lista veche pe ecran
                raspuns.onsuccess = function()
                {
                    var tabel = document.getElementById("tabelProduse");
                    tabel.innerHTML = "" +
                    "<tr>" +
                    "<th>Id</th>" +
                    "<th>Nume Produs</th>" +
                    "<th>Cantitate</th>" +
                    "</tr>";
                    var id = produse.index("id");
                    var noi_ids = id.getAll();
                    noi_ids.onsuccess = function(){
                        for (var i = 1; i <= noi_ids.result.length; i++) 
                        {
                            var linie = tabel.insertRow(noi_ids.result[i - 1].id);
                            
                            linie.insertCell(0).innerHTML = noi_ids.result[i - 1].id;
                            linie.insertCell(1).innerHTML = noi_ids.result[i - 1].nume;
                            linie.insertCell(2).innerHTML = noi_ids.result[i - 1].cantitate;
                          }
                    }
                }

                raspuns.onerror = function()
                {
                    console.log("Eroare ! Nu am putut adauga produsul.")
                }
            }
        };

    }
}