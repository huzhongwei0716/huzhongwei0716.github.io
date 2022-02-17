
/* Jquery objects */
const uniPrefSelect = $("#uniPref");
const subjectSelect = $("#subject");
const campusSelect = $("#campus");
const courseFeeChange = $(".course-fee");
const accommodationFeeChange = $(".accommodation-fee");
const totalFeeChange = $(".total-fee");
var localityRadio = $("input[name=localityOptions]:checked");
var rentingRadio = $("input[name=rentOptions]:checked");
/* Important global variables */
var universities = Object.keys(costData);
var uni;
var faculties;
var selectedSubject;
var selectedFaculty;
var selectedCampus;

var courseFees = 0;
var accommodationFees = 0;
var totalFees = 0;

// Render list of universities
universities.forEach(uni => {
    uniPrefSelect.append(`<option>${uni}</option>`);
});

/*!!! Input changes !!!*/
// On uni preference change
uniPrefSelect.on("change", function () {
    clearList(subjectSelect);
    clearList(campusSelect);
    if (uniPrefSelect.val() != "Select...") {
        subjectSelect.prop("disabled", false);
    } else {
        subjectSelect.prop("disabled", true);
        return;
    }   
    campusSelect.prop("disabled", true);
    // Define faculties, and subjects according to selected uni
    uni = uniPrefSelect.val();
    faculties = Object.keys(costData[uni]);
    subjects = [];
    faculties.forEach(faculty => {
        let subjects = Object.keys(costData[uni][faculty]);
        subjects.forEach(subject => {
            if (!subjects.includes(subject)) {
                subjects.push(subject);
            }
        });
    });
    renderSubjectSelect();
});
// On subject change
subjectSelect.on("change", function() {
    clearList(campusSelect);
    if (subjectSelect.val() != "Select...") {
        campusSelect.prop("disabled", false);
    } else {
        campusSelect.prop("disabled", true);
        return;
    }
    selectedSubject = subjectSelect.val();
    renderCampusSelect();
});
// On campus change
campusSelect.on("change", function() {
    selectedCampus = campusSelect.val();
});
// On change of fields affecting course fees
courseFeeChange.on("change", function() {
    if (subjectSelect.val() != "Select...") {
        localityRadio = $("input[name=localityOptions]:checked");
        renderCourseFee();
    } else {
        courseFees = 0;
        $("#course").text("");
    }
});
// On change of fields affecting accommodation fees
accommodationFeeChange.on("change", function () {
    if (campusSelect.val() != "Select...") {
        rentingRadio = $("input[name=rentOptions]:checked");
        renderAccommodationFee();
    } else {
        accommodationFees = 0;
        $("#accommodation").text("");
    }
});
// On change of fields affecting total fees
totalFeeChange.on("change", function() {
    renderTotalFees();
});
// On click of reset study cost button
$("#reset-costs").on("click", function () {
    // Clear lists
    clearList(subjectSelect);
    clearList(campusSelect);
    // Disable lists
    uniPrefSelect.val("Select..."); 
    subjectSelect.prop("disabled", true);
    campusSelect.prop("disabled", true);
    // Initialise radio inputs
    let localityRadios = $("input:radio[name=localityOptions]");
    localityRadios.filter('[value=Domestic]').prop("checked", true);
    let rentRadios = $("input:radio[name=rentOptions]");
    rentRadios.filter("[value=yes]").prop("checked", true);
    // Clear span text
    $(".cost-span").text("");
});
/*!!! FUNCTIONS !!!*/
// Resets options of a given select list
function clearList(selectList) {
    selectList.empty();
    selectList.append('<option>Select...</option>');
}
// Gets the associated faculty of the selected subject
function getFaculty() {
    faculties.forEach(faculty => {
        let subjects = Object.keys(costData[uni][faculty]);
        if (subjects.includes(selectedSubject)) {
            selectedFaculty = faculty;
        }
    });
}
// Converts string of numbers to currency format with commas
function convertCurrency(numberStr) {
    var outStr = "$";
    for (let i = 0; i < numberStr.length; i++) {
        outStr += numberStr[i];
        if ((numberStr.length-1-i) % 3 == 0 && i != numberStr.length-1) {
            outStr += ",";
        }
    }
    return outStr;
}

/*!!! RENDERING FUNCTIONS !!!*/
// Renders subject select list
function renderSubjectSelect() {
    // Render subject list for chosen university
    faculties.forEach(faculty => {
        $("#subject").append(`<optgroup value="${faculty}" label="${faculty}">`);
        let subjects = Object.keys(costData[uni][faculty]);
        subjects.forEach(subject => {
            $("#subject").append(`<option>${subject}</option>`);           
        });
        $("#subject").append(`</optgroup>`);
    });
}
// Renders Campus select list
function renderCampusSelect() {
    getFaculty();
    let campuses = Object.keys(costData[uni][selectedFaculty][selectedSubject]["Campuses"]);
    campuses.forEach(campus => {
        $("#campus").append(`<option>${campus}</option>`);
    });
}
// Renders course fee
function renderCourseFee() {
    let courseFeeStr = costData[uni][selectedFaculty][selectedSubject]["Locality"][localityRadio.val()];
    if (courseFeeStr.includes("-")) {
        var courseFeeSplit = courseFeeStr.split("-");
        courseFees = courseFeeSplit.map(num => {
            return parseInt(num, 10);
        });
        $("#course").text(convertCurrency(courseFeeSplit[0]) + "-" + convertCurrency(courseFeeSplit[1]));
    } else {
        courseFees = parseInt(courseFeeStr);
        $("#course").text(convertCurrency(courseFeeStr));
    }
}
// Renders accommodation fee
function renderAccommodationFee() {
    if (rentingRadio.val() === "no") {
        accommodationFees = 0;
        $("#accommodation").text("");
        return;
    }
    let accommodationFeeStr = costData[uni][selectedFaculty][selectedSubject]["Campuses"][selectedCampus];
    if (accommodationFeeStr.includes("-")) {
        var accommodationFeeSplit = accommodationFeeSplit.split("-");
        accommodationFees = accommodationFeeSplit.map(num => {
            return parseInt(num, 10);
        });
        $("#accommodation").text(convertCurrency(accommodationFeeStr.split("-")[0]) + "-" + convertCurrency(accommodationFeeStr.split("-")[1]));
    } else {
        accommodationFees = parseInt(accommodationFeeStr);
        $("#accommodation").text(convertCurrency(accommodationFeeStr));
    }
}
// Renders total fees
function renderTotalFees() {
    // Course fees must always be established to reach this point
    // Therefore can do simple assignment
    totalFees = courseFees;
    // Adding values of campus fees depends on the types of each fee value
    if (accommodationFees != 0) {
        if (!Number.isInteger(accommodationFees) && !Number.isInteger(totalFees)) {
            totalFees = accommodationFees.map(val, idx => {
                return val + totalFees[idx];
            });
        } else if (!Number.isInteger(accommodationFees) && Number.isInteger(totalFees)) {
            totalFees = accommodationFees.map(val=> {
                return val + totalFees;
            });
        } else if (Number.isInteger(accommodationFees) && !Number.isInteger(totalFees)) {
            totalFees = totalFees.map(val => {
                return val + accommodationFees;
            });
        } else if (Number.isInteger(accommodationFees) && Number.isInteger(totalFees)) {
            totalFees += accommodationFees;
        }
    } 
    if (typeof(totalFees) == Array) {
        $("#total").text(convertCurrency(totalFees[0].toString()) + "-" + convertCurrency(totalFees[1].toString));
    } else {
        $("#total").text(convertCurrency(totalFees.toString()));
    }
}