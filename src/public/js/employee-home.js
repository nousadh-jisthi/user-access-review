const auditList = document.getElementById('auditList');

function getAudits(){
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/employee/on-going-audits-for-manager", true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 ) {
            if (this.status == 200){
                console.log("Response: " + this.responseText);
                response = JSON.parse(this.responseText)
                const audits = response
                populateAudits(audits);
            } else{
                console.log("Error: " + this.responseText);
            }
        };
    }
}

function populateAudits(audits){
    audits.forEach(audit => {
        const tr = document.createElement('tr');
        tr.className = 'audit';
        
        const auditId = document.createElement('td');
        auditId.textContent = audit.id;
        tr.appendChild(auditId);

        const auditName = document.createElement('td');
        auditName.textContent = audit.auditName;
        tr.appendChild(auditName);

        const auditDescription = document.createElement('td');
        auditDescription.textContent = audit.auditDescription;
        tr.appendChild(auditDescription);

        const auditStartDate = document.createElement('td');
        auditStartDate.textContent = audit.auditStartDate;
        tr.appendChild(auditStartDate);

        const auditStatus = document.createElement('td');
        // TODO: get audit status from data
        //auditStatus.textContent = audit.status;
        auditStatus.textContent = "ongoing";
        tr.appendChild(auditStatus);

        const auditLink = document.createElement('td');
        const link = document.createElement('a');
        link.href = "/employee/audit-employees?audit_id=" + audit.id;
        link.textContent = "View";
        auditLink.appendChild(link);
        tr.appendChild(auditLink);

        auditList.appendChild(tr);
    });

    $(document).ready(function() {
        $('#datatable').dataTable();
    });
}

getAudits();