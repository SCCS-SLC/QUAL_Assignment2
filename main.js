//SCCS - Assignment 2

const { createDb, createSchemas, closeDB} = require("./eventsDB.js");
const { addEvent, getEventReportByName, addAttendee} = require("./eventsRepo.js");

const { program } = require("commander");
const readline = require("readline");

//creates the DB
const db = createDb();
// generates the empty schemas
const schemas = async () => {
    await createSchemas(db);
}
schemas();

/*
    https://github.com/tj/commander.js
    https://www.geeksforgeeks.org/node-js/how-to-build-a-javascript-command-line-interface-cli-with-node-js/
*/

//commands
program
.command("addEvent")
.description("adds an event")
.action(() => {
    interface.question("what is the name of the event? ", (name) => {
        if(name.trim().length > 0){
            interface.question("what is the date of the event [YYYY-MM-DD]? ", (date) => {
                const dateSplit = date.split("-");
                if(dateSplit.length === 3){
                    if(dateSplit[0].length !== 4 || dateSplit[1].length !== 2 || dateSplit[2].length !== 2){
                        console.log("incorrect format");
                        //goes back to normal cmd interface
                        interface.prompt();
                    }
                    else{
                        interface.question("what is the capacity of the event? ", async (capacity) => {
                            if(capacity > 0){
                                await addEvent(db,
                                {
                                    name: name.trim(),
                                    date: date.trim(),
                                    capacity: parseInt(capacity.trim())
                                });
                                //goes back to normal cmd interface
                                interface.prompt();
                            }
                            else{
                                console.log("you must have a non-negative capacity");
                                //goes back to normal cmd interface
                                interface.prompt();
                            }
                        });
                    }
                }
                else{
                    console.log("you must include 3 seperate dashes");
                    //goes back to normal cmd interface
                    interface.prompt();
                }
                
            });
        }
        else{
            console.log("the name must be a non-empty string"); 
            //goes back to normal cmd interface
            interface.prompt();
        }
    });
});
program
.command("addAttendee")
.description("adds an attendee")
.action(() => {
    interface.question("what is this persons name? ", (name) => {
        if(name.trim().length > 0){
            interface.question("what is this persons email? ", (email) => {
                const splitMail = email.split("@");
                if(splitMail.length === 2 && splitMail[0].trim().length > 0 && splitMail[1].trim().length > 0 && splitMail[1].includes(".")){
                    interface.question("what event are they going to? (ID) ", async (event_id) => {
                        if(event_id > 0){
                            await addAttendee(db, 
                            {
                                name: name.trim(),
                                email: email.trim(),
                                event_id: parseInt(event_id.trim())
                            });

                            //goes back to normal cmd interface
                            interface.prompt();
                        }
                        else{
                            console.log("must be a non-negative integer");
                            interface.prompt();
                        }
                    });
                }
                else{
                    console.log("incorrect email format");
                    interface.prompt();
                }
            });
        }
        else{
            console.log("must be a non-empty string");
            interface.prompt();
        }
    });
});
program
.command("printAll")
.description("prints all info for 1 event")
.action(() => {
    interface.question("what is the events name? ", async (name) => {
        const report = await getEventReportByName(db, name);

        console.log(JSON.parse(report));

        //goes back to normal cmd interface
        interface.prompt();
    });
    
})
program
.command("help")
.description("gives info on commands")
.action(() => {
//I don't know why it wants to be formated like this, I just needed to read it not all on 1 line while writing
console.log(`\n--COMMANDS--
addEvent -> adds an event\naddAttendee -> adds an attendee
printAll -> gives the info on a specific event (in JSON format):\n\tEvent name\n\tcount of people attending\n\tmax capacity\n\tlist of people in attendance
help -> help command\nexit -> stops execution\n`);
});
program
.command("exit")
.description("exits the command interface")
.action(() => {
    process.exit(0);
});

// creates the readline interface (keeps taking input from user)
const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "Events-SYS> "
});

//gets the input from the commandline and runs the respective commander command
const input = (inputLine) => {
    //console.log(inputLine);
    const command = inputLine.trim().split(" ")[0];
    //ensure no whitespace or blank commands
    if(command !== ""){
        program.parse([command], { from: "user"})
    }
}

//have the prompt show up on runtime
interface.prompt();
//when the line gets updated, get the comand with the input function
interface.on("line", (inp) => {
    input(inp);
    interface.prompt();
});