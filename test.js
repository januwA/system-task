const { SystemTask } = require("./dist/index.js");

SystemTask.tasks().then(({ tasks, stdout }) => {
  tasks.forEach(async (p) => {
    if (p.pname.includes("QQ.exe")) {
      try {
        await p.reStartLikes();
        console.log("done");
      } catch (error) {
        console.error(error);
      }
    }
    // p.kill();
    // p.killLikes();
    // p.start();
    // p.reStart();
    // p.reStartLikes();
  });
});
