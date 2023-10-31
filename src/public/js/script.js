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
          populateUsers(users);

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
  function populateUsers(users){
    
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user.cn;
      li.addEventListener('click', () => handleUserSelection(user));
      userList.appendChild(li);
    });
  }
  
  // Handle user selection
  function handleUserSelection(user) {
    // Clear previous selections
    const selectedUser = userList.querySelector('.selected');
    if (selectedUser) {
      selectedUser.classList.remove('selected');
    }
  
    // Highlight selected user
    event.target.classList.add('selected');
  
    // Display user information
    userInfo.textContent = `User DN: ${user.dn}\nUser CN: ${user.cn}`;
  
    // Fetch permissions for the selected user using API request or other means
    /*const permissions = [
      { id: 1, name: 'Permission 1', status: 'Pending' },
      { id: 2, name: 'Permission 2', status: 'Pending' },
      { id: 3, name: 'Permission 3', status: 'Pending' },
      // ...
    ];*/

    const permissions = user.groups;

  
    // Clear previous permissions
    while (permissionsList.firstChild) {
      permissionsList.removeChild(permissionsList.firstChild);
    }
    
    // TODO: Change permissions to be a json object
    // TODO: Get permission details from database as a separate AJAX request
    permissions.forEach(permission => {
      const li = document.createElement('li');
      li.className = 'permission';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `permissionStatus-${permission.id}`;
      input.value = 'approved';
      input.addEventListener('click', () => {
        handleChangePermissionStatus(permission, input.value);
      });
      li.appendChild(input);
      const permissionLabel = document.createElement('label');
      //permissionLabel.textContent = permission.name;
      permissionLabel.textContent = permission;
      li.appendChild(permissionLabel);
      const approvedLabel = document.createElement('label');
      approvedLabel.className = 'status-label approved';
      approvedLabel.textContent = 'Approve';
      //approvedLabel.setAttribute('for', `permissionStatus-${permission.id}`);
      approvedLabel.setAttribute('for', `permissionStatus-${permission}`);
      li.appendChild(approvedLabel);

      const rejectedLabel = document.createElement('label');
      rejectedLabel.className = 'status-label rejected';
      rejectedLabel.textContent = 'Reject';
      //rejectedLabel.setAttribute('for', `permissionStatus-${permission.id}`);
      approvedLabel.setAttribute('for', `permissionStatus-${permission}`);
      li.appendChild(rejectedLabel);

      const viewDetailsLabel = document.createElement('label');
      viewDetailsLabel.className = 'status-label view-details';
      viewDetailsLabel.textContent = 'View Details';
      viewDetailsLabel.setAttribute('for', `permissionStatus-${permission.id}`);
      viewDetailsLabel.addEventListener('click', () => handlePermissionSelection(permission));
      li.appendChild(viewDetailsLabel);
      
      permissionsList.appendChild(li);
    });
  }
  
  // Handle permission status change
  function handleChangePermissionStatus(permission, status) {
    permission.status = status;
  }

  // Handle permission selection
  function handlePermissionSelection(permission) {
    // Display additional information about the selected permission
    permissionInfo.style.display = 'block';
    permissionInfo.textContent = `Permission ID: ${permission.id}\nPermission Name: ${permission.name}`;
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