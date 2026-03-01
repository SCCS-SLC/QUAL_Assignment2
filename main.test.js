//SCCS - ASSIGNMENT2

const test = require("node:test");
const assert = require("node:assert/strict");

const { createDb, createSchemas, closeDB } = require("./eventsDB");
const { addEvent, getEventReportByName, addAttendee } = require("./eventsRepo");

test.describe("Attendee Validation", () => {
    test.beforeEach(async () => {
        db = createDb();
        await createSchemas(db);

        await addEvent(
            db,
            {
                name: "Moparfest",
                date: "2026-08-15",
                capacity: 4
            }
        );
        await addEvent(
            db,
            {
                name: "Importfest",
                date: "2026-07-18",
                capacity: 2
            }
        );
        await addEvent(
            db,
            {
                name: "Evo",
                date: "2026-05-16",
                capacity: 2
            }
        );
    });
    test.afterEach(async () => {
        await closeDB(db);
    });

    test("valid attendees", async () => {
        assert.deepStrictEqual(await addAttendee(
            db,
            {
                name: "SCCS",
                email: "sawyer.smith@student.sl.on.ca",
                event_id: 3
            }
        ),
        {
            id: 1,
            name: "SCCS",
            email: "sawyer.smith@student.sl.on.ca",
            event_id: 3
        });
        assert.deepStrictEqual(await addAttendee(
            db,
            {
                name: "EDAS",
                email: "ethansmith@example.ca",
                event_id: 1
            }
        ),
        {
            id: 2,
            name: "EDAS",
            email: "ethansmith@example.ca",
            event_id: 1
        });
        assert.deepStrictEqual(await addAttendee(
            db,
            {
                name: "MESS",
                email: "MESS@example.ca",
                event_id: 2
            }
        ),
        {
            id: 3,
            name: "MESS",
            email: "MESS@example.ca",
            event_id: 2
        });
    });

    test("capacity limits", async () => {
        //filling up capacity
        await addAttendee(db,
            {
                name: "SCCS",
                email: "sawyer.smith@student.sl.on.ca",
                event_id: 3
            }
        );
        await addAttendee(db,
            {
                name: "EDAS",
                email: "ethansmith@example.ca",
                event_id: 3
            }
        );

        await assert.rejects(addAttendee(db,
            {
                name: "MESS",
                email: "MESS@example.ca",
                event_id: 3
            }
        ), {name: "Error"});

        await assert.rejects(addAttendee(db,
            {
                name: "Joe",
                email: "Joe@example.ca",
                event_id: 3
            }
        ), {name: "Error"});
    });

    test("duplicate attendees", async () => {
        await addAttendee(db,
            {
                name: "SCCS",
                email: "sawyer.smith@student.sl.on.ca",
                event_id: 3
            }
        );

        await assert.rejects(addAttendee(db,
            {
                name: "SCCS",
                email: "sawyer.smith@student.sl.on.ca",
                event_id: 3
            }
        ), {code: "SQLITE_CONSTRAINT"});
    });

    test("improper data", async () => {
        await assert.rejects(addAttendee(db,
            {
                name: "",
                email: "sawyer.smith@student.sl.on.ca",
                event_id: 3
            }
        ), {name: "TypeError"});
        await assert.rejects(addAttendee(db,
            {
                name: "SCCS",
                email: "",
                event_id: 3
            }
        ), {name: "TypeError"});
        await assert.rejects(addAttendee(db,
            {
                name: "SCCS",
                email: "sawyer.smith@student.sl.on.ca",
                event_id: "3"
            }
        ), {name: "TypeError"});

        //specifically email stuff
        await assert.rejects(addAttendee(db,
            {
                name: "SCCS",
                //no @
                email: "sawyer.smithstudent.sl.on.ca",
                event_id: 3
            }
        ), {name: "TypeError"});
        await assert.rejects(addAttendee(db,
            {
                name: "SCCS",
                //no .
                email: "sawyer.smith@student(dot)ca",
                event_id: 3
            }
        ), {name: "TypeError"});
        await assert.rejects(addAttendee(db,
            {
                name: "SCCS",
                //nothing before @
                email: "@student.ca",
                event_id: 3
            }
        ), {name: "TypeError"});
        await assert.rejects(addAttendee(db,
            {
                name: "SCCS",
                //nothing after @
                email: "sawyer.smith@",
                event_id: 3
            }
        ), {name: "TypeError"});
    });
});

test.describe("Event Validation", () => {
    test.beforeEach(async () => {
        db = createDb();
        await createSchemas(db);
    });
    test.afterEach(async () => {
        await closeDB(db);
    });

    test("valid events", async () => {
        assert.deepStrictEqual(await addEvent(
            db,
            {
                name: "Moparfest",
                date: "2026-08-15",
                capacity: 4
            }
        ), 
        {
            id: 1,
            name: "Moparfest",
            date: "2026-08-15",
            capacity: 4
        });
        assert.deepStrictEqual(await addEvent(
            db,
            {
                name: "Importfest",
                date: "2026-07-18",
                capacity: 2
            }
        ), 
        {
            id: 2,
            name: "Importfest",
            date: "2026-07-18",
            capacity: 2
        });
        assert.deepStrictEqual(await addEvent(
            db,
            {
                name: "Evo",
                date: "2026-05-16",
                capacity: 2
            }
        ), 
        {
            id: 3,
            name: "Evo",
            date: "2026-05-16",
            capacity: 2
        });
    });

    test("invalid data", async () => {
        await assert.rejects(addEvent(
            db, 
            {
                //no name
                name: "",
                date: "2026-05-16",
                capacity: 2
            }
        ), {name: "TypeError"});

        await assert.rejects(addEvent(
            db, 
            {
                //no date
                name: "Evo",
                date: "",
                capacity: 2
            }
        ), {name: "TypeError"});

        await assert.rejects(addEvent(
            db, 
            {
                //string as capacity
                name: "Evo",
                date: "2026-05-16",
                capacity: "2"
            }
        ), {name: "TypeError"});


        //Date stuff
        await assert.rejects(addEvent(
            db, 
            {
                name: "Evo",
                //not full year
                date: "20-05-16",
                capacity: 2
            }
        ), {name: "TypeError"});
        await assert.rejects(addEvent(
            db, 
            {
                name: "Evo",
                //no year
                date: "-05-16",
                capacity: 2
            }
        ), {name: "TypeError"});
        await assert.rejects(addEvent(
            db, 
            {
                name: "Evo",
                //not full month
                date: "2026-5-16",
                capacity: 2
            }
        ), {name: "TypeError"});
        await assert.rejects(addEvent(
            db, 
            {
                name: "Evo",
                //no month
                date: "2026-5-16",
                capacity: 2
            }
        ), {name: "TypeError"});
         await assert.rejects(addEvent(
            db, 
            {
                name: "Evo",
                //not full day
                date: "2026-5-6",
                capacity: 2
            }
        ), {name: "TypeError"});
        await assert.rejects(addEvent(
            db, 
            {
                name: "Evo",
                //no day
                date: "2026-05-",
                capacity: 2
            }
        ), {name: "TypeError"});
    });
});

test.describe("Report validation", () => {
    test.beforeEach(async () => {
        db = createDb();
        await createSchemas(db);

        await addEvent(
            db,
            {
                name: "Moparfest",
                date: "2026-08-15",
                capacity: 4
            }
        );
        await addEvent(
            db,
            {
                name: "Importfest",
                date: "2026-07-18",
                capacity: 2
            }
        );
        await addEvent(
            db,
            {
                name: "Evo",
                date: "2026-05-16",
                capacity: 2
            }
        );

        await addAttendee(
            db,
            {
                name: "SCCS",
                email: "sawyer.smith@student.sl.on.ca",
                event_id: 3
            }
        );
        await addAttendee(
            db,
            {
                name: "EDAS",
                email: "ethansmith@example.ca",
                event_id: 1
            }
        );
        await addAttendee(
            db,
            {
                name: "MESS",
                email: "MESS@example.ca",
                event_id: 1
            }
        );
        await addAttendee(
            db,
            {
                name: "Jane",
                email: "Jane@example.ca",
                event_id: 2
            }
        );
        await addAttendee(
            db,
            {
                name: "John",
                email: "John@example.ca",
                event_id: 2
            }
        );
    });
    test.afterEach(async () => {
        await closeDB(db);
    });

    test("valid reports", async () => {
        assert.deepStrictEqual(JSON.parse(await getEventReportByName(
            db, "Moparfest"
        )),
        {
            event: {
                name: "Moparfest",
                count: 2,
                capacity: 4
            },
            signedList: ["EDAS", "MESS"]
        });

        assert.deepStrictEqual(JSON.parse(await getEventReportByName(
            db, "Evo"
        )),
        {
            event: {
                name: "Evo",
                count: 1,
                capacity: 2
            },
            signedList: ["SCCS"]
        });

        assert.deepStrictEqual(JSON.parse(await getEventReportByName(
            db, "Importfest"
        )),
        {
            event: {
                name: "Importfest",
                count: 2,
                capacity: 2
            },
            signedList: ["Jane", "John"]
        });
    });
});