## system-tasks

Get the list of system processes, and can perform kill, start, restart operations on a process

## install
```sh
$ npm i system-tasks
```

```js
const { SystemTask } = require("system-tasks");

SystemTask.tasks().then(({ tasks, stdout }) => {
  console.log(tasks);
  tasks.forEach(p => {
    console.log(p.pname);
    console.log(p.pid);
    
    // p.kill();
    // p.killLikes();
    // p.start();
    // p.reStart();
    // p.reStartLikes();
  });
})
```

## build
> $ npm run build