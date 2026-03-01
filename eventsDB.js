//SCCS - Assignment 2

//using sqlite3 so it can be done in memory
const sqlite3 = require("sqlite3");

const createDb = () => {
    return new sqlite3.Database(":memory:");
}

const runSQL = (db, sql, params = []) => {
    //returns async promise, resolve is success, reject is fail
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err){
                //something errored out
                return reject(err);
            }

            //nothing errored out
            resolve(this);
        });
    });
}

const getSingle = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        //returns a single line
        db.get(sql, params, (err, result) => {
            if(err){
                //errors out
                return reject(err);
            }

            resolve(result);
        });
    });
}

const getAll = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        //returns everything
        db.all(sql, params, (err, result) => {
            if(err){
                //errors out
                return reject(err);
            }

            resolve(result);
        });
    });
}

const createSchemas = async (db) => {
    await runSQL (
        db,
        `CREATE TABLE events (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            capacity INTEGER NOT NULL
        )`
    );

    await runSQL (
        db,
        `CREATE TABLE attendees (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            event_id INTEGER NOT NULL,

            FOREIGN KEY (event_id) REFERENCES events(id)
        )`
    );
}

const getCapacityFree = async (db, id) => {
    const eventCapacity = await getSingle(
        db, 
        `SELECT capacity FROM events
        WHERE events.id = ?`,
        [id]
    );
    const inAttendance = await getSingle(
        db, 
        `SELECT COUNT(attendees.id) as registered FROM events
        JOIN attendees ON attendees.event_id = events.id
        WHERE events.id = ?`,
        [id]
    );
    
    if((eventCapacity.capacity - inAttendance.registered) === 0){
        return 0;
    }
    return eventCapacity.capacity - inAttendance.registered;
}

const closeDB = (db) => {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if(err){
                return reject(err);
            }

            resolve();
        });
    });
}

module.exports = { createDb, createSchemas, runSQL, getSingle, getAll, getCapacityFree, closeDB };