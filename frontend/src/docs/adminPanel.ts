export const adminPanelContent = `
# Administrator Functions

The Admin Panel provides tools for managing users and system-wide data. This section is only visible and accessible to users with the "Admin" role.

## User Management:

* **View Users**: See a list of all registered users.
* **Create User**: Manually add new user accounts.
* **Edit User**: Modify user details, including their roles, organization, job title, and country. You can also reset their password.
* **Delete User**: Remove user accounts from the system.

### Bulk User Operations:

**Import Users from Excel**: Administrators can upload an Excel file to bulk create or update user accounts. This is useful for onboarding multiple users at once. A sample Excel template is provided within the import dialog.

**Security Note**: All administrative actions are logged and require appropriate permissions.
`;