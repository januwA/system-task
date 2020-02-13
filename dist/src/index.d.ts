/// <reference types="node" />
import { ExecException } from "child_process";
export interface TasksResult {
    tasks: Task[];
    stdout: string;
    stderr: string;
    err: ExecException | null;
}
export declare class SystemTask {
    static tasks(): Promise<TasksResult>;
}
export interface ITask {
    error: ExecException | null;
    stdout: string;
    stderr: string;
}
declare class Task {
    readonly p: string[];
    readonly line: string;
    pname: string;
    pid: string;
    constructor(p: string[], line: string);
    /**
     * 杀死此进程
     */
    kill(): Promise<ITask>;
    /**
     * 杀死和此进程一样name的所有进程
     */
    killLikes(): Promise<unknown>;
    /**
     * 运行一个当前进程
     */
    start(): Promise<unknown>;
    /**
     * 重启进程
     */
    reStart(): Promise<void>;
    /**
     * 重启所有相关的进程
     */
    reStartLikes(): Promise<void>;
}
export {};
