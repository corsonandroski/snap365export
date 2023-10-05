//const article = document.querySelector("article");
console.log('extension running');

function httpGet(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function getMonthFromString(mon){
   return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1
}


let interval;

let viewedMonth;

interval = setInterval(updateButton, 1000);

function updateButton(){
  //get month and year from page header
  const month = getMonthFromString(document.getElementById("txtMonthPicker").value.split(" ")[0]);
  const year = document.getElementById("txtMonthPicker").value.split(" ")[1];

  console.log("checking for month change,", month, viewedMonth);

  //if the month displayed on page is different than the one referenced by download button (because page just loaded or switched to new month)
  if (viewedMonth !== month){

    //update download target month to match month displayed on page
    viewedMonth = month;

    // updateDownloadButton
    if (!document.getElementById("downloadButton")){
      let button = document.createElement("button");
      button.id = "downloadButton"
      document.querySelectorAll("[data-role='navbar']")[1].appendChild(button);
    }

    button = document.getElementById("downloadButton");
    button.innerHTML = `download ${
      document.getElementById("txtMonthPicker").value.split(" ").join(" ")
    } calendar`
    button.style.position = "absolute";
    button.style.top = "8px";
    button.style.right = "120px";
    button.style.width = "140px";
    button.onclick = download;
  }
}

function download(){
  console.log("downloading")
  //get month and year from page header
  const month = getMonthFromString(document.getElementById("txtMonthPicker").value.split(" ")[0]);
  const year = document.getElementById("txtMonthPicker").value.split(" ")[1];
  httpGet(`https://era.snapschedule365.com/dataapi/ERA/CalendarView?monthDate=${year}-${month}-01`, processResponse);
}

function processResponse(r){

  let response = JSON.parse(r);

  console.log(response);

  //Get employee ID to filter assigned shifts
  const employeeID = response.MyEmployee.ID;

  //Get shift definitions, create object with shift ID keys and shift description values
  //const shifts = Object.fromEntries(response.Shifts.map((s) => [parseInt(s.ID), s.Description]))

  //Create CSV starting with headers
  let gCalCSV = `Subject, Start Date, Start Time, End Time`
    .concat(response.ShiftAssignments
        .filter((s) => s.EmployeeID == employeeID)
        .map((s) =>
             `\n${response.Shifts.find(x => x.ID == s.ShiftID).Description}, ${new Date(s.StartDateTime).toLocaleDateString()}, ${new Date(s.StartDateTime).toLocaleTimeString()}, ${new Date(s.EndDateTime.split("+")[0]).toLocaleTimeString()}`)
     ).toString()

  console.log(gCalCSV)

  interval = null;
}
