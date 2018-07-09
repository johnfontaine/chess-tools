"use strict;"
const EventEmitter = require('events');


const jq = new JobQueue();
async function createJob(n) {
    let promise = new Promise((resolve, reject)=>{
        setTimeout(()=>{ 
            resolve("finsihed " + n);
        }, 500)
    });
    let result = await jq.queue_promise(promise);
}
function main() {
    for (let x = 0; x < 20; x++) {
        createJob(x);
    }    
}
main();

jq.on("error", (error)=>{
    console.log("Error ", error)
});
