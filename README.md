## system-task

获取系统进程列表，并且可以对某个进程进行kill, start, restart操作

## install
```sh
$ npm i system-task
```

```js
const { SystemTask } = require("system-task");

SystemTask.tasks().then(({ tasks, stdout }) => {
  console.log(tasks);
  tasks.forEach(p => {
    console.log(p.pname);
    console.log(p.pid);
    
    p.kill();
    p.killLikes();
    p.start();
    p.reStart();
    p.reStartLinks();
  });
})
```

## build
> $ npm run build