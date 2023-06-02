import {verifyToken} from "./middleware.js";
import express from "express";
import fs from "fs";
import sqlite3 from "sqlite3";

const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database("./test.db", sqlite3Verbose.OPEN_READWRITE, (err)=>{
    if (err){
        return console.error(err.message);
    }
})

const app = express();
const port = 8080;

app.get('/bootstrapDB', (req, res, next) => {
    const file = fs.readFileSync("addresses.json")
    const jsonContent = JSON.parse(file)

    db.serialize(() => {
        db.run("DROP TABLE IF EXISTS addresses", (err) => {
            if (err){
                next(err.message)
                return;
            }})
        .run("DROP TABLE IF EXISTS tags", (err) => {
            if (err){
                next(err.message)
                return;
            }})
        .run( `CREATE TABLE addresses(
                guid STRING PRIMARY KEY,
                isActive BOOLEAN,
                address STRING,
                latitude DECIMAL,
                longitude DECIMAL
            )`, (err) => {
            if (err){
                next(err.message)
                return;
            }})
        .run(`CREATE TABLE tags(
            _id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            guid STRING,
            tag STRING,
            FOREIGN KEY(guid) REFERENCES addresses(guid)
            )`, function (err) {
            if (err) {
                next(err.message)
                return;
            }
        })
        db.serialize(function() {
            const sql = 'INSERT INTO addresses(guid, isActive, address, latitude, longitude) VALUES (?,?,?,?,?)';

            db.run("begin transaction");
                
            for (var i = 0; i < jsonContent.length; i++) {
                const item = jsonContent[i]
                const insertItem = [item.guid, item.isActive, item.address, item.latitude, item.longitude]
                db.run(sql, insertItem);
            }

            db.run("commit", (err) => {
                if (res.headersSent === false){
                    console.log("DB created")
                    res.send('data have been added');
                }
            });
        })
    })
});

function queryCities(req, res){
    const allowedKeys = ["guid", "isActive", "address", "latitude", "longitude"] // , "tag"

    const queryKeys = Object.keys(req.query)
    const whereCondList = []
    for (let i = 0; i < queryKeys.length; i++) {
        const key = queryKeys[i];

        if (allowedKeys.indexOf(key) === -1){
            continue
        }

        const value = req.query[key]
        // missing sanitation here...
        if (key === "isActive"){
            if (value === "true"){
                whereCondList.push(key + " = " + 1)
            } else if (key === "isActive" && value === "false"){
                whereCondList.push(key + " = " + 0)
            } 
        } else if (key === "address" || key === "guid"){
            whereCondList.push(key + " = '" + value + "'")
        } else if (key === "latitude" || key === "longitude"){
            whereCondList.push(key + " = " + value)
        }
    }

    let sql = "select * from addresses"
    if (whereCondList.length > 0){
        sql = sql + " WHERE " + whereCondList.join(" AND ")
    }

    console.log(sql)
    db.all(sql, [], (err, rows) => {
        const cities = []
        
        rows.forEach((row) => {
            cities.push(row);
        });
        const jsonContent = {cities: cities}
 
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(jsonContent));
    })
}

app.get('/cities-by-tag-public', (req, res) => {
    queryCities(req, res)
})

app.get('/cities-by-tag', verifyToken, (req, res) => {
    queryCities(req, res)
});

app.listen(port, () => console.log(`My App listening on port ${port}!`))