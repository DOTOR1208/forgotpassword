# forgotpassword
#Changes to Database Schema (See schema.prisma for details)
The following changes have been made to the database schema. Please refer to the schema.prisma file for a detailed view of the changes.

#Setup Instructions
1.Download the ZIP file
Download the source code as a ZIP file from the repository.

2.Install dependencies
Run the following command to install the necessary packages:

npm install

3.Generate Prisma Client
This step is optional, but it is recommended to generate the Prisma client:

npx prisma generate

4.Update the Database
After making changes to the schema, you can update the database by running:

npm run updatedb
(Optional but necessary if you've made schema changes that need to be reflected in the database.)

5.Run the Application
Start the application with:

npm run start
