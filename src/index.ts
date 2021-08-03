import { exec, ExecException } from "child_process";
import { Completer } from "ajanuw-completer";

const isWindows = process.platform == "win32";
const cmd = isWindows ? "tasklist" : "ps aux";

export interface TasksResult {
  tasks: Task[];
  stdout: string;
  stderr: string;
  err: ExecException | null;
}

export interface ExecResult {
  error: ExecException | null;
  stdout: string;
  stderr: string;
}

const trim = (line: string) => line.trim();

function mapLine(line: string) {
  return {
    p: line.trim().split(/\s+/),
    line,
  };
}

function excePromise(command: string): Promise<ExecResult> {
  const completer = new Completer<ExecResult>();
  exec(
    command,
    (error: ExecException | null, stdout: string, stderr: string) => {
      if (error) {
        completer.completeError({ error, stdout, stderr });
      } else {
        completer.complete({ error, stdout, stderr });
      }
    }
  );
  return completer.promise;
}

export class SystemTask {
  static async tasks() {
    let completer = new Completer<TasksResult>();

    exec(cmd, (err, stdout, stderr) => {
      if (err) return completer.completeError(err);

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
      completer.complete({ tasks, stdout, err, stderr });
    });

    return completer.promise;
  }
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
    const command = isWindows
      ? `taskkill /PID ${this.pid} /TF`
      : `kill -s 9 ${this.pid}`;
    return excePromise(command);
  }

  /**
   * 杀死和此进程一样name的所有进程
   */
  killLikes() {
    const command = isWindows
      ? `TASKKILL /F /IM ${this.pname} /T`
      : `pkill -9 ${this.pname}`;
    return excePromise(command);
  }

  /**
   * 运行一个当前进程
   */
  async start(executablePath?: string) {
    if (executablePath) return excePromise(executablePath);

    if (isWindows) {
      executablePath = await this.getExecutablePath();
      if (executablePath) return excePromise(executablePath);
      else return excePromise(this.pname.replace(/\.exe$/i, ""));
    } else {
      return await excePromise(this.pname);
    }
  }

  /**
   * 重启进程
   */
  async reStart() {
    try {
      const executablePath = await this.getExecutablePath();
      await this.kill();
      await this.start(executablePath);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 重启所有相关的进程
   */
  async reStartLikes() {
    try {
      const executablePath = await this.getExecutablePath();
      await this.killLikes();
      await this.start(executablePath);
    } catch (error) {
      throw error;
    }
  }

  async getExecutablePath(): Promise<string | undefined> {
    if (isWindows) {
      const { stdout } = await excePromise(
        `wmic process where "ProcessID=${this.pid}" get ExecutablePath`
      );
      return stdout.trim().split(/\s+/)[1];
    }
  }
}
