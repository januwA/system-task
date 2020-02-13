const { SystemTask } = require("./dist/system-task.js");

SystemTask.tasks().then(({ tasks, stdout }) => {
  console.log(tasks);
  tasks.forEach(p => {
    console.log(p.pname);
    console.log(p.pid);
    
    p.kill();
    p.killLikes();
    p.start();
    p.reStart();
    p.reStartLikes();
  });
});
