//SCCS - Assignment 2

const { runSQL, getSingle, getAll, getCapacityFree } = require("./eventsDB");

const addEvent = async (db, event) => {
    //console.log("INPUT DATA: { NAME: ", event.name, " | DATE: ", event.date, " | CAPACITY: ", event.capacity, " }");

    validateEvent(event);
    const result = await runSQL(
        db,
        "INSERT INTO events (name, date, capacity) VALUES (?, ?, ?)",
        [event.name.trim(), event.date, event.capacity]
    );

    return {
        id: result.lastID,
        name: event.name,
        date: event.date,
        capacity: event.capacity
    }
}

const validateEvent = (event) => {
    if(!event || typeof event !== "object"){
        throw new TypeError("must be an object");
    }
    if(typeof event.name !== "string" || event.name.trim() === ""){
        throw new TypeError("name must be a non-empty string");
    }
    if(typeof event.date !== "string" || event.date.trim() === "" || event.date.split("-")[0].length !== 4 || event.date.split("-")[1].length !== 2 || event.date.split("-")[2].length !== 2){
        throw new TypeError("date must be a non-empty string and follow the YYYY-MM-DD format");
    }
    if(!Number.isInteger(event.capacity) || event.capacity <= 0){
        throw new TypeError("capacity must be an int and have a positive value");
    }
}

const getEventReportByName = async (db, name) => {
    //gets the data about the event
    const eventData = await getSingle(
        db,
        `SELECT events.name, COUNT(attendees.id) AS "count", events.capacity FROM events
        JOIN attendees ON events.id = attendees.event_id
        WHERE events.name = ?`,
        [name.trim()]
    );
    //gets the guest list of who is signed up (seperate so it returns an array)
    const amtSignedUp = await getAll(
        db,
        `SELECT attendees.name FROM attendees
        JOIN events ON events.id = attendees.event_id
        WHERE events.name = ?`,
        [name.trim()]
    );

    //this pulls out the names from the getAll statement, otherwise it is: {{name: "___"}, {name: "___"}}
    var signedUpNames = [];
    for(let i = 0; i < amtSignedUp.length; i++){
        signedUpNames = [...signedUpNames, amtSignedUp[i].name]
    }

    //turn it into a JSON object
    const report = JSON.stringify({event: eventData, signedList: [...signedUpNames]});

    //console.log(JSON.parse(report));

    return report;
}

const addAttendee = async (db, attendee) => {
    validateAttendee(attendee);

    if(await getCapacityFree(db, attendee.event_id) === 0){
        throw new Error("Cannot add more");
    }
    else{
        const result = await runSQL(
            db,
            "INSERT INTO attendees (name, email, event_id) VALUES (?, ?, ?)",
            [attendee.name.trim(), attendee.email.trim(), attendee.event_id]
        );

        return {
            id: result.lastID,
            name: attendee.name,
            email: attendee.email,
            event_id: attendee.event_id
        }
    }    
}

const validateAttendee = (attendee) => {
    if(!attendee || typeof attendee !== "object"){
        throw new TypeError("must be an object");
    }
    if(typeof attendee.name !== "string" || attendee.name.trim() === ""){
        throw new TypeError("name must be a non-empty string");
    }
    if(typeof attendee.email !== "string" || attendee.email.trim() === "" || attendee.email.split("@").length !== 2 || attendee.email.split("@")[0].trim().length === 0|| attendee.email.split("@")[1].includes(".") === false){
        throw new TypeError("email must be a non-empty string and fit the format of: ---@---.---");
    }
    if(!Number.isInteger(attendee.event_id) || attendee.event_id <= 0){
        throw new TypeError("event_id must be an int and have a positive value");
    }
}

module.exports = { addEvent, getEventReportByName, addAttendee }