import { exec, ExecException } from "child_process";

const isWindows = process.platform == "win32";
const cmd = isWindows ? "tasklist" : "ps aux";
function _handleCallback(res: any, rej: any) {
  return (error: ExecException | null, stdout: string, stderr: string) => {
    if (error) {
      rej({ error, stdout, stderr });
    } else {
      res({ error, stdout, stderr });
    }
  };
}

export interface TasksResult {
  tasks: Task[];
  stdout: string;
  stderr: string;
  err: ExecException | null;
}

function trim(line: string) {
  return line.trim();
}
function mapLine(line: string) {
  return {
    p: line.trim().split(/\s+/),
    line
  };
}
export class SystemTask {
  static tasks() {
    return new Promise<TasksResult>((res, rej) => {
      exec(cmd, (err, stdout, stderr) => {
        if (err) return rej(err);

        // win 5列: 映像名称 PID 会话名 会话# 内存使用
        // win: ['System', '4', 'Services', '0', '152', 'K']

        // ubuntu 11列: USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND
        // ubuntu: ['ajanuw', '317', '0.0',    '0.0', '17384',  '1952', 'tty1',   'R', '11:09',  '0:00', 'ps',     'aux']
        // console.log(stdout);
        const tasks = stdout
          .split("\n")
          .filter(trim) // 过滤空行
          .map(mapLine)
          .filter((_, i) => (isWindows ? i > 1 : i > 0)) // 跳过头信息
          .map(({ p, line }) => new Task(p, line));
        res({ tasks, stdout, err, stderr });
      });
    });
  }
}

export interface ITask {
  error: ExecException | null;
  stdout: string;
  stderr: string;
}

class Task {
  pname: string;
  pid: string;

  constructor(public readonly p: string[], public readonly line: string) {
    this.pname = isWindows ? p[0] : p[10];
    this.pid = p[1];
  }

  /**
   * 杀死此进程
   */
  kill() {
    return new Promise<ITask>((res, rej) => {
      const command = isWindows
        ? `taskkill /PID ${this.pid} /TF`
        : `kill -s 9 ${this.pid}`;
      exec(command, _handleCallback(res, rej));
    });
  }

  /**
   * 杀死和此进程一样name的所有进程
   */
  killLikes() {
    return new Promise((res, rej) => {
      const command = isWindows
        ? `TASKKILL /F /IM ${this.pname} /T`
        : `pkill -9 ${this.pname}`;
      exec(command, _handleCallback(res, rej));
    });
  }

  /**
   * 运行一个当前进程
   */
  start() {
    return new Promise((res, rej) => {
      exec(`${this.pname.replace(/\.exe/, "")}`, _handleCallback(res, rej));
    });
  }

  /**
   * 重启进程
   */
  async reStart() {
    try {
      await this.kill();
      await this.start();
    } catch (error) {
      throw error;
    }
  }

  /**
   * 重启所有相关的进程
   */
  async reStartLikes() {
    try {
      await this.killLikes();
      await this.start();
    } catch (error) {
      throw error;
    }
  }
}
