//const article = document.querySelector("article");
console.log('extension running');

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function getMonthFromString(mon){
   return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1
}

const month = getMonthFromString(document.getElementById("txtMonthPicker").value.split(" ")[0]);
const year = document.getElementById("txtMonthPicker").value.split(" ")[1];

const response = httpGet(`https://era.snapschedule365.com/dataapi/ERA/CalendarView?monthDate=${year}-${month}-01`);

//Get employee ID to filter assigned shifts
const employeeID = response.MyEmployee.ID

//Get shift definitions, create object with shift ID keys and shift description values
const shifts = Object.fromEntries(response.Shifts.map((s) => [parseInt(s.ID), s.Description]))

//Create CSV starting with headers
let gCal = `Subject, Start Date, Start Time, End Time`
  .concat(response.ShiftAssignments
      .filter((s) => s.EmployeeID == employeeID)
      .map((s) =>
           `\n${response.Shifts.find(x => x.ID == s.ShiftID).Description}, ${new Date(s.StartDateTime).toLocaleDateString()}, ${new Date(s.StartDateTime).toLocaleTimeString()}, ${new Date(s.EndDateTime.split("+")[0]).toLocaleTimeString()}`)
   ).toString()

console.log(gCal)
