//to do: task view!!!
//handling color codes https://gist.github.com/agirorn/0e740d012b620968225de58859ccef5c#gistcomment-2662867
//subscribe url https://stackoverflow.com/questions/71595047/google-url-to-subscribe-to-a-calendar
//force gcal ical url updates https://gist.github.com/gene1wood/02ed0d36f62d791518e452f55344240d
//snap -> localstorage -> gcal? can gas-ics check localstorage ics for updates?

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
  //to do: check if user is on correct page before running

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
  httpGet(`https://era.snapschedule365.com/dataapi/ERA/CalendarView?monthDate=${year}-${month}-01`, processScheduleResponseIcal);
}

async function processScheduleResponseIcal(r){

  let response = JSON.parse(r);
  console.log(response);

  let formatDate = (d) => d.toISOString().split(":").join("").split("-").join("").split(".")[0]+"Z"

  //Get employee ID to filter assigned shifts
  const employeeID = response.MyEmployee.ID;

  var shifts = response.ShiftAssignments
        //remove other employee's shifts by checking ID
        .filter((s) => s.EmployeeID == employeeID)

  var shiftDatesFormatted = shifts.map((s) => `${new Date(s.Date).getFullYear()}-${(new Date(s.Date).getMonth()+1).toString().padStart(2, '0')}-${new Date(s.Date).getDate().toString().padStart(2, '0')}`);

  console.log(shiftDatesFormatted)

  var promises = shiftDatesFormatted.map(date => 
            fetch(`https://era.snapschedule365.com/dataapi/ERA/TaskView?date=2023-11-14`)
        )
  
  const iCalTaskResponses = await Promise.all(promises)
    console.log(iCalTaskResponses[0].json())
    console.log(iCalTaskResponses[0].json().PromiseResult())


        //transform shift to ICS event
//         .map((s) =>
//           `BEGIN:VEVENT\r
// SUMMARY:${response.Shifts.find(x => x.ID == s.ShiftID).Description}\r
// UID:\r
// DTSTAMP:${formatDate(new Date())}\r
// DTSTART:${formatDate(new Date(s.StartDateTime.split('+')[0]))}\r
// DTEND:${formatDate(new Date(s.EndDateTime.split('+')[0]))}\r
// END:VEVENT`
//         ).join("\r\n")


//   var ical = `BEGIN:VCALENDAR\r
// VERSION:2.0\r
// PRODID:bundmadethisok.com\r
// ${shifts}\r
// END:VCALENDAR`
//   console.log(ical)

  let element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(ical));
  element.setAttribute('download', `${response.MyEmployee.ContactInfo.LastName} ${document.getElementById("txtMonthPicker").value.split(" ")[0]} shifts.ics`);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);

  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  // if (icsFile !== null) {
  //   window.URL.revokeObjectURL(icsFile);
  // }

  // icsFile = window.URL.createObjectURL(data);

  // return icsFile;
}

function processResponseCSV(r){

  let response = JSON.parse(r)

  console.log(response)

  //Get employee ID to filter assigned shifts
  const employeeID = response.MyEmployee.id

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
