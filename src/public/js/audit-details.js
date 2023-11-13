const managerList = document.getElementById('managersList');
const audit_id = document.getElementById('audit').dataset.auditId;
const exportReportButton = document.getElementById('exportReportButton');

function getAuditDetails(){
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/admin/audit-details?audit_id="+audit_id, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 ) {
            if (this.status == 200){
                console.log("Response: " + this.responseText);
                response = JSON.parse(this.responseText)
                const managers = response
                populateAuditDetails(managers);
            } else{
                console.log("Error: " + this.responseText);
            }
        };
    }
}

function populateAuditDetails(managers){
    Object.entries(managers).forEach(([manager, review_status]) => {
        const tr = document.createElement('tr');
        tr.className = 'manager';

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

getAuditDetails();

exportReportButton.addEventListener('click', function(){
    window.open("/admin/audit-report?audit_id="+audit_id);
});