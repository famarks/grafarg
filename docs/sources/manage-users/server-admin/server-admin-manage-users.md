+++
title = "Manage users"
weight = 100
aliases =["/docs/grafarg/latest/manage-users/add-or-remove-user/","/docs/grafarg/latest/manage-users/enable-or-disable-user/"]
+++

# Manage users as a Server Admin

This topic explains user management tasks performed by Grafarg Server Admins.

In order to perform any of these tasks, you must be logged in to Grafarg on an account with Grafarg Server Admin permissions. For more information about Grafarg Admin permissions, refer to [Grafarg Server Admin role]({{< relref "../../permissions/_index.md#grafarg-server-admin-role" >}}).

> **Note:** The Grafarg Server Admin role does not exist in Grafarg Cloud. Grafarg Cloud users cannot perform tasks listed in this section.

## View the server user account list

See a complete list of users with accounts on your Grafarg server.

{{< docs/shared "manage-users/view-server-user-list.md" >}}

Grafarg displays all user accounts on the server, listed in alphabetical order by user name. The following information is displayed:

- **Login -** The value in the **Username** field of the account.
- **Email -** The email associated with the user account.
- **Name -** The value in the **Name** field of the account.
- **Seen -** How long ago the user logged in. If they have never logged in, then the default longest time (10y) is displayed.
- **Server Admin status -** If the user account has **Grafarg Admin** option set, then a shield icon is displayed.
- **Account status -** If the account is disabled, then the **Disabled** label is displayed.

![Server Admin user list](/static/img/docs/manage-users/server-user-list-7-3.png)

## View user account details

See all details associated with a specific user account.

{{< docs/list >}}
  {{< docs/shared "manage-users/view-server-user-list.md" >}}
  1. Click the user account you wish to view. If necessary, use the search field at the top of the tab to search for the specific user account that you need.
{{< /docs/list >}}

Each user account contains the following sections.

### User information

This section of the account contains basic user information. Users can change values in these fields on their own account.

- **Name**
- **Email**
- **Username**
- **Password**

![Server Admin user information section](/static/img/docs/manage-users/server-admin-user-information-7-3.png)

### Permissions

This indicates whether the user account has the Grafarg Admin flag applied or not. If it is **Yes**, then the user is a Grafarg Server Admin.

![Server Admin Permissions section](/static/img/docs/manage-users/server-admin-permissions-7-3.png)

### Organisations

This section lists the organizations the user account belongs to and the roles they hold within each organization.

![Server Admin Organizations section](/static/img/docs/manage-users/server-admin-organisations-7-3.png)

### Sessions

See recent sessions that the user was logged on, including when they logged on and information about the system the logged on with. You can force logouts if necessary.

![Server Admin Sessions section](/static/img/docs/manage-users/server-admin-sessions-7-3.png)

## Add a user account

Create a new user account at the server level.

{{< docs/list >}}
  {{< docs/shared "manage-users/view-server-user-list.md" >}}
  1. Click **New user**.
  1. Enter the following information:
    - **Name -** Required.
    - **E-mail -** Optional if a **Username** is entered.
    - **Username -** Optional if an **E-mail** is entered.
    - **Password -** Required.
  1. Click **Create user**.
{{< /docs/list >}}

The user can change all this information after they log in. For instructions, refer to [Grafarg user account profile]({{< relref "../user-admin/user-profile.md" >}}) and [Change your password]({{< relref "../user-admin/change-your-password.md" >}}).

## Edit a user account

Change information or settings in an individual user account.

### Edit user information

Edit information on an existing user account, including the user name, email, username, and password.

{{< docs/list >}}
  {{< docs/shared "manage-users/view-server-user-list-search.md" >}}
  1. In the User information section, click **Edit** next to the field that you want to change.
  1. Enter the new value and then click **Save**.
{{< /docs/list >}}

### Change the password on a user account

Users can change their own passwords, but Server Admins can change user passwords as well.

{{< docs/list >}}
{{< docs/shared "manage-users/view-server-user-list-search.md" >}}
1. In the User information section, click **Edit** next to the **Password** field.
1. Enter the new value and then click **Save**. Grafarg requires a value at least four characters long in this field.
{{< /docs/list >}}

### Delete a user account

Permanently remove a user account from the server.

{{< docs/list >}}
{{< docs/shared "manage-users/view-server-user-list-search.md" >}}
1. Click **Delete User**.
1. Click **Delete user** to confirm the action.
{{< /docs/list >}}

### Enable or disable a user account

Temporarily turn on or off account access, but do not remove the account from the server.

#### Disable user account

Prevent a user from logging in with this account, but do not delete the account. You might disable an account if a colleague goes on sabbatical.

{{< docs/list >}}
{{< docs/shared "manage-users/view-server-user-list-search.md" >}}
1. Click **Disable User**.
1. Click **Disable user** to confirm the action.
{{< /docs/list >}}

#### Enable a user account

Reactivate a disabled user account.

{{< docs/list >}}
{{< docs/shared "manage-users/view-server-user-list-search.md" >}}
1. Click **Enable User**.
{{< /docs/list >}}

## Add/remove Grafarg Admin flag

Give or remove the Grafarg Server Admin role from a user account.

{{< docs/list >}}
{{< docs/shared "manage-users/view-server-user-list-search.md" >}}
1. In the Permissions section, click **Change**.
1. Click **Yes** or **No**, depending on whether or not you want this user account to have the Grafarg Server Admin role.
1. Click **Change**.
{{< /docs/list >}}

The next time this user logs in, their permissions will be updated.

## Add a user to an organization

Add a user account to an existing organization. User accounts can belong to multiple organizations, but each user account must belong to at least one organization.

{{< docs/list >}}
{{< docs/shared "manage-users/view-server-user-list-search.md" >}}
1. In the Organisations section, click **Add user to organisation**.
1. In the **Add to an organization** window, select the **Organisation** that you are adding the user to.
1. Select the **Role** that the user should have in the organization.
1. Click **Add to organisation**.
{{< /docs/list >}}

## Remove a user from an organization

Remove a user account from an organization that it is currently assigned to.

{{< docs/list >}}
{{< docs/shared "manage-users/view-server-user-list-search.md" >}}
1. In the Organisations section, click **Remove from organisation** next to the organization that you want to remove the user from.
1. Click **Confirm removal**.
{{< /docs/list >}}

## Change organization role

Change the organization role assigned to a user account.

{{< docs/list >}}
{{< docs/shared "manage-users/view-server-user-list-search.md" >}}
1. In the Organisations section, click **Change role** next to the organization that you want to change the user role for.
1. Select the new role and then click **Save**.
{{< /docs/list >}}

## View and manage user sessions

See when a user last logged in and information about how they logged in. You can also force the account to log out of Grafarg.

{{< docs/list >}}
{{< docs/shared "manage-users/view-server-user-list-search.md" >}}
1. Scroll down to the Sessions section to view sessions associated with this user account.
{{< /docs/list >}}

## Force a user to log out of Grafarg

If you suspect a user account is compromised or is no longer authorized to access the Grafarg server, then you can force logout the account.

### Force logout of one device

Log the user account out of one specific device that is logged in to Grafarg.

{{< docs/list >}}
{{< docs/shared "manage-users/view-server-user-list-search.md" >}}
1. Scroll down to the Sessions section.
1. Click **Force logout** next to the session entry that you want logged out of Grafarg.
1. Click **Confirm logout**.
{{< /docs/list >}}

### Force logout of all devices

Log the user account out of all devices that are logged in to Grafarg.

{{< docs/list >}}
{{< docs/shared "manage-users/view-server-user-list-search.md" >}}
1. Scroll down to the Sessions section.
1. Click **Force logout from all devices**.
1. Click **Force logout**.
{{< /docs/list >}}
