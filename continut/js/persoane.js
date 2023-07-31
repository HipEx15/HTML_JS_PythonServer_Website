function incarcaPersoane(){
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) 
       {
           textXML = this.responseXML;
           persoane = textXML.getElementsByTagName("persoane");

           var tableHTML = "" +
           "<table>" +
           "<tr>" +
           "<th>Nume</th>" +
           "<th>Varsta</th>" +
           "<th>Adresa</th>" +
           "<th>Telefon</th>" +
           "<th>E-mail</th>" +
           "<th>Educatie</th>" +
           "<th>Limba Materna</th>" +
           "<th>Limba straina</th>" +
           "</tr>";

           for(var i = 0; i < persoane.length; i++)
           {
                persoana = persoane[i];
                for (var j of persoana.children)
                {
                    adresa = j.children.item(4).children;
                    tableHTML += 
                    "<tr>"+
                        "<td>" + j.children.item(0).innerHTML + " " + j.children.item(1).innerHTML + "</td>" +
                        "<td>" + j.children.item(2).innerHTML + "</td>" +
                        "<td>" + j.children.item(3).innerHTML + "</td>" +
                        "<td>" + adresa[0].innerHTML + "</td>" +
                        "<td>" + adresa[1].innerHTML + "</td>" +
                        "<td>" + adresa[2].innerHTML + "</td>" +
                        "<td>" + adresa[3].innerHTML + "</td>" +
                        "<td>" + adresa[4].innerHTML + "</td>" +
                    "</tr>";
                    
                }
                tableHTML += "</table>";
                document.getElementById("persoane_id").innerHTML = tableHTML;
           }
       }
    };
    xhttp.open("GET", "resurse/persoane.xml", true);
    xhttp.send();
}