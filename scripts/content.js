const article = document.querySelector("article");
console.log('extension running');

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

httpGet("https://era.snapschedule365.com/dataapi/ERA/CalendarView?monthDate=2023-10-01");
