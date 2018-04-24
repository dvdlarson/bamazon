# bamazon
CLI application U of A Bootcamp

Fairly awful and somewhat boring video walkthrough can be found <a href="https://youtu.be/K8lR7pcK-Ig">here</a>.

Node Modules Used:
<ul>
  <li>mySQL</li>
  <li>cli-table</li>
  <li>inquirer</li>
  <li>moment</li>
  <li>dotenv</li>
</ul>

This is a Command-Line Interface application for week 12 homework from the U of A Web Development Bootcamp.

The project was to make a customer application where someone could run the app, view products available to purchase, and then make a purchase. Doing so would deplete the inventory and give the customer a confirmation message with a grand total for their order.

The application interfaces with a mySQL database that warehouses the data for the application.
Tables:
<ul>
  <li>Customers</li>
  <li>Products</li>
  <li>Departments</li>
  <li>Sales</li>
  <li>Users</li>
</ul>

The second part of the application requires additional applications for 'Manager' and 'Supervisor' functions. I combined these into one 'Admin' app called bamazonAdmin.js.  When users log in here, their username/password is validated against the user table and they are presented with the appropriate action menu based on their user role.

I did include a new third user role option of 'Admin'. Admins can Add/Delete Users, view all Users, and some additional unfinished functionality. Supervisors and Admins have access to all menu functions for their access level and below.




