to get it running:
    - create a test.db file for the sqlite in the root next to app.js
    - npm install
    - node app.js

    after the server has started go to the http://127.0.0.1:8080/bootstrapDB to get the initial data in the DB.

my comments:
    I tried giving this a go with nodejs + express and sqlite, and it was the first time using it as a backend for me.
    
    There was alot of learning for me therefore i feel i didnt get as far as i wanted, there is alot of details missing.
    I did not get to the modeling of the tags tabel and joining of this table to allow tags to be queried.

    but i learned alot :)

    The main endpint
    http://127.0.0.1:8080/cities-by-tag should be working with some simple queries.

    I have made a cities-by-tag-public endpoint for developement and debuging.
    http://127.0.0.1:8080/cities-by-tag-public?guid=77dba370-cb99-481e-b73c-b6827e5c99f6 (does a lookup by guid)
    http://127.0.0.1:8080/cities-by-tag-public?isActive=true (does a lookup by isActive)
    http://127.0.0.1:8080/cities-by-tag-public (gives all cities in the database)


