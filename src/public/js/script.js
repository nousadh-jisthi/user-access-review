// JavaScript to populate the user list and handle user selection

// Sample data

const audit_id = document.getElementById('audit').dataset.auditId;

  function getMyEmployees(){
    const xhttp = new XMLHttpRequest();
    // TODO: Make audit_id dynamic
    xhttp.open("GET", "/employee/get-my-employees?audit_id="+audit_id, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 ) {
        if (this.status == 200){
          console.log("Response: " + this.responseText);
          response = JSON.parse(this.responseText)
          const users = response.employees
          populateUsers(users, response.groups);

        } else{
          console.log("Error: " + this.responseText);
        }
      };
    }
  }

  getMyEmployees();

  
  const userList = document.getElementById('userList');
  const userInfo = document.getElementById('userInfo');
  const permissionsList = document.getElementById('permissionsList');
  const permissionInfo = document.getElementById('permissionInfo');
  const submitButton = document.getElementById('submitButton');
  
  // Populate the user list
  function populateUsers(users, groups){
    
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user.cn;
      li.addEventListener('click', () => handleUserSelection(user, groups));
      userList.appendChild(li);
    });
  }
  
  // Handle user selection
  function handleUserSelection(user, groups) {
    // Clear previous selections
    const selectedUser = userList.querySelector('.selected');
    if (selectedUser) {
      selectedUser.classList.remove('selected');
    }
  
    // Highlight selected user
    event.target.classList.add('selected');
  
    // Display user information
    userInfo.textContent = `User DN: ${user.dn}\nUser CN: ${user.cn}`;

    const permissions = user.groups;

  
    // Clear previous permissions
    while (permissionsList.firstChild) {
      permissionsList.removeChild(permissionsList.firstChild);
    }
    while (permissionInfo.firstChild) {
      permissionInfo.removeChild(permissionInfo.firstChild);
    }
    
    // TODO: Change permissions to be a json object
    // TODO: Get permission details from database as a separate AJAX request
    permissions.forEach(permission => {
      const tr = document.createElement('tr');  
      tr.className = 'permission';

      const name_td = document.createElement('td');
      name_td.textContent = groups[permission.id].cn;
      tr.appendChild(name_td);

      const approve_td = document.createElement('td');
      const approve_button = document.createElement('button');
      const approve_i = document.createElement('i');
      approve_i.className = 'bi bi-check-circle';
      approve_button.appendChild(approve_i);
      approve_button.className = 'btn btn-success';
      approve_button.addEventListener('click', () => {
        handleChangePermissionStatus(user.dn, permission, 'approved');
      });
      approve_td.appendChild(approve_button);
      tr.appendChild(approve_td);

      const reject_td = document.createElement('td');
      const reject_button = document.createElement('button');
      const reject_i = document.createElement('i');
      reject_i.className = 'bi bi-x-circle';
      reject_button.appendChild(reject_i);
      reject_button.className = 'btn btn-danger';
      reject_button.addEventListener('click', () => {
        handleChangePermissionStatus(user.dn, permission, 'rejected');
      });
      reject_td.appendChild(reject_button);
      tr.appendChild(reject_td);

      const view_td = document.createElement('td');
      const view_button = document.createElement('button');
      const view_i = document.createElement('i');
      view_i.className = 'bi bi-info-circle';
      view_button.appendChild(view_i);
      view_button.className = 'btn btn-primary';
      view_button.addEventListener('click', () => handlePermissionSelection(permission, groups[permission.id]));
      view_td.appendChild(view_button);
      tr.appendChild(view_td);

      const status_td = document.createElement('td');
      const status_label = document.createElement('label');
      status_label.className = 'status-label';
      status_label.textContent = permission.status;
      //status_label.setAttribute('for', `permissionStatus-${permission.id}`);
      status_label.setAttribute('for', `permissionStatus-${permission.id}`);
      status_td.appendChild(status_label);
      tr.appendChild(status_td);
      
      permissionsList.appendChild(tr);
    });

    $(document).ready(function() {
      $('#datatable').dataTable();
    });
  }
  
  // Handle permission status change
  function handleChangePermissionStatus(userDn, permission, status) {
    permission.status = status;
    const status_label = permissionsList.querySelector(`label[for="permissionStatus-${permission.id}"]`);
    status_label.textContent = permission.status;
    // TODO: add status changes to a list and send it to the server when the submit button is clicked
  }

  // Handle permission selection
  function handlePermissionSelection(permission, group) {
    // Display additional information about the selected permission
    permissionInfo.style.display = 'block';
    permissionInfo.textContent = `Permission ID: ${permission.id}\nPermission Name: ${group.cn}`;
  }
  
  // Handle submit button click
  submitButton.addEventListener('click', () => {
    const selectedUser = userList.querySelector('.selected');
    const permissions = permissionsList.querySelectorAll('.permission');
    if (selectedUser && permissions.length > 0) {
      const userId = selectedUser.textContent;
      const permissionStatuses = Array.from(permissions).map(permission => {
        const permissionName = permission.querySelector('label:not(.status-label)').textContent;
        const permissionStatus = permission.querySelector(`input[name="permissionStatus-${permission.id}"]:checked`).value;
        return { name: permissionName, status: permissionStatus };
      });
  
      console.log('User ID:', userId);
      console.log('Permission statuses:', permissionStatuses);
    }
  });