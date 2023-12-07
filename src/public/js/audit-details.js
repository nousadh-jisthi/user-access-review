const managerList = document.getElementById('managersList');
const audit_id = document.getElementById('audit').dataset.auditId;
const exportReportButton = document.getElementById('exportReportButton');
const employeesWithoutManagerList = document.getElementById('employeesWithoutManagerList')
const saveChangesButton = document.getElementById('saveChangesButton')

var reviewerChanges = {"audit_id": audit_id, "changes": {}}

function getAuditDetails(){
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/admin/audit-details?audit_id="+audit_id, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 ) {
            if (this.status == 200){
                response = JSON.parse(this.responseText)
                const managers = response
                populateAuditDetails(managers);
                getEmployeesWithoutManagers(managers);
            } else{
                console.log("Error: " + this.responseText);
            }
        };
    }
}

function populateAuditDetails(managers){
    Object.entries(managers).forEach(([manager, review_status]) => {
        const tr = document.createElement('tr');
        tr.className = 'reviewer';

        const managerDn = document.createElement('td');
        managerDn.textContent = manager;
        tr.appendChild(managerDn);

        const reviewed = document.createElement('td');
        reviewed.textContent = review_status.reviewed+"/"+(review_status.notReviewed+review_status.reviewed);
        tr.appendChild(reviewed);

        const reviewStatus = document.createElement('td');
        if(review_status.notReviewed == 0){
            reviewStatus.textContent = "Completed";
        }else{
            reviewStatus.textContent = "In Progress";
        }
        tr.appendChild(reviewStatus);

        managerList.appendChild(tr);
    });

    $(document).ready(function() {
        $('#datatable').dataTable();
      });

}

function getEmployeesWithoutManagers(managers){
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/admin/employees-without-managers?audit_id="+audit_id, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 ) {
            if (this.status == 200){
                populateEmployeesWithoutManagers(JSON.parse(this.responseText), managers);
            } else{
                console.log("Error: " + this.responseText);
            }
        };
    }
}

function populateEmployeesWithoutManagers(employees, managers){
    employees.forEach((employee) => {
        const tr = document.createElement('tr');
        tr.className = 'employee';

        const employeeName = document.createElement('td');
        employeeName.textContent = employee.cn;
        tr.appendChild(employeeName);

        const employeeEmail = document.createElement('td');
        employeeEmail.textContent = employee.mail;
        tr.appendChild(employeeEmail);

        const employeeTitle = document.createElement('td');
        employeeTitle.textContent = employee.title;
        tr.appendChild(employeeTitle);

        const employeeManager = document.createElement('td');
        const select = document.createElement('select');
        select.className = "form-select employee-without-manager";
        select.setAttribute("aria-label", "Default select example");
        select.setAttribute("for", employee.id);

        const option = document.createElement('option');
        option.selected = true;
        option.textContent = "null";
        option.value = "";
        select.appendChild(option);

        Object.entries(managers).forEach(([manager, review_status]) => {
            if(manager != "null"){
                const option = document.createElement('option');
                option.textContent = manager;
                option.value = manager;
                select.appendChild(option);
            }
        });

        select.addEventListener('change', () => handleReviewerSelection(select.value, employee.id));

        employeeManager.appendChild(select);
        tr.appendChild(employeeManager);

        employeesWithoutManagerList.appendChild(tr);

    });

    $(document).ready(function() {
        $('#datatable').dataTable();
      });

}

function handleReviewerSelection(manager, employee_id){
    if (manager == ""){
        delete reviewerChanges["changes"][employee_id]
    } else{
        reviewerChanges["changes"][employee_id] = manager
    }
}

exportReportButton.addEventListener('click', function(){
    window.open("/admin/audit-report?audit_id="+audit_id);
});

saveChangesButton.addEventListener('click', function(){
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/admin/update-employee-managers", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(reviewerChanges));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 ) {
            if (this.status == 200){
                window.location.reload();
            } else{
                console.log("Error: " + this.responseText);
            }
        };
    }
});

function main(){
    getAuditDetails();
}

main();