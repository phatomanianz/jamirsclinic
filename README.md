# General Clinic Management System

This system manages patient records including case history, documents, prescriptions, appointments, and payments. It has inventory that tracks the stocks of medicines and has also sales reporting. Patient can be logged in to view his/her records and book appointments.

Built in React JS, Material UI, and Laravel.

Demo: https://clinicare.site

## Features

-   Manage Patient
-   Documents
-   Case History
-   Manage Doctor
-   Appointment
-   Prescription
-   POS (Point of Sale)
-   Sales and Profit Report
-   Inventory
-   Manage Settings

### Screenshots

![Screenshot](./screenshot/dashboard.png)

### Prerequisites

-   Node.JS, to install JavaScript dependency, you can download it here: https://nodejs.org/en/download
    
-   Composer, to install PHP dependency, you can download it here: https://getcomposer.org/download

-   PHP >= 7.2.5, MySQL/MariaDB, to easily install PHP, MySQL, and Apache you can download the latest XAMPP version here: https://www.apachefriends.org/download.html
    

### Installing
Create .env file in root directory and copy the content of .env.example that is located in root directory and paste it in newly created .env file. You can change the database configuration by changing these default value:  
DB_CONNECTION=mysql  
DB_HOST=127.0.0.1  
DB_PORT=3306  
DB_DATABASE=laravel  
DB_USERNAME=root  
DB_PASSWORD=  

Run XAMMP as administrator and start the Apache and MySQL

Go to PhpMyAdmin ang create a database of the system, in this example I will use the default database name that is 'laravel'

Open CMD and go to root directory of the project and run the following commands:

Type `composer install` to install the PHP Dependency

Type `npm install && npm run dev` to install the JavaScript Dependency

Type `php artisan key:generate` to set the application key needed for security

Type `php artisan storage:link` to make symlink of storage folder into the public folder, it is used to make the storage publicly available in the users

Type `php artisan migrate`, it will create the database tables of the project.

Type `php artisan db:seed` to populate the default admin user.

Type `php artisan passport:client --personal` to install the key needed for authentication

Type `php artisan serve --host=localhost --port=8000` to run the project. After you run this command you can access the site in http://localhost:8000

Default admin credentials to log in:  
Email: admin@gmail.com  
Password: mutedfaith



