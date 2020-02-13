## system-tasks

获取系统进程列表，并且可以对某个进程进行kill, start, restart操作

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
    
    p.kill();
    p.killLikes();
    p.start();
    p.reStart();
    p.reStartLikes();
  });
})
```

## build
> $ npm run build