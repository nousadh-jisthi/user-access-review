const auditList = document.getElementById('auditList');
const navLogoutButton = document.getElementById('navLogoutButton');
const navLogoutForm = document.getElementById('navLogoutForm');

function getAudits(){
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/admin/all-audits", true);
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
        startDate = new Date(audit.auditStartDate)
        auditStartDate.textContent = startDate.toDateString();
        tr.appendChild(auditStartDate);

        const auditStatus = document.createElement('td');
        
        if(audit.completed_at != null){
            auditStatus.textContent = "Completed";
        }else if(audit.collected_at != null){
            auditStatus.textContent = "In Progress";
        }else if(startDate >= new Date()){
            auditStatus.textContent = "Scheduled";
        }else{
            auditStatus.textContent = "Pending";
        }
        tr.appendChild(auditStatus);

        const auditLink = document.createElement('td');
        const link = document.createElement('a');
        link.href = "/admin/view-audit?audit_id=" + audit.id;
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

navLogoutButton.addEventListener('click', function(){
    navLogoutForm.submit();
});