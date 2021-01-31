/*
Copyright 2020 fannst

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as Colors from 'https://deno.land/std/fmt/colors.ts';

const encoder: TextEncoder = new TextEncoder();
const decoder: TextDecoder = new TextDecoder();

export enum LoggerLevel {
    Trace, Info, Warn, Error, Fatal
}

/**
 * Gets the color function for the specified level
 * @param l the level
 */
export const logger_level_color = (l: LoggerLevel): Function => {
    switch (l)
    {
        case LoggerLevel.Trace: return Colors.green;
        case LoggerLevel.Info: return Colors.brightBlue;
        case LoggerLevel.Warn: return Colors.yellow;
        case LoggerLevel.Error: return Colors.red;
        case LoggerLevel.Fatal: return Colors.brightRed;
        default: return Colors.white;
    }
}

export class Logger {
    public static minimum: LoggerLevel = LoggerLevel.Trace;

    private _level: LoggerLevel;
    private _prefix: string;
    private _ostream?: Deno.Writer;

    /**
     * Creates new logger instance
     * @param level the level for the logger
     * @param prefix the prefix for the logger
     * @param ostream override the output stream
     */
    public constructor(level: LoggerLevel = LoggerLevel.Info, prefix: string = 'None', ostream?: Deno.Writer) {
        this._level = level;
        this._prefix = prefix;
        this._ostream = ostream;
    }

    /*********************************
     * Getters / Setters
     *********************************/

    public get prefix() {
        return this._prefix;
    }

    public get level() {
        return this._level;
    }

    public set level(l: LoggerLevel) {
        this._level = l;
    }

    /*********************************
     * Log Methods
     *********************************/

    /**
     * Logs with trace level
     * @param m the message
     */
    public trace = async (m: string): Promise<void> => {
        await this.log(m, LoggerLevel.Trace);
    };

    /**
     * Logs with info level
     * @param m the message
     */
    public info = async (m: string): Promise<void> => {
        await this.log(m, LoggerLevel.Info);
    };

    /**
     * Logs with warn level
     * @param m the message
     */
    public warn = async (m: string): Promise<void> => {
        await this.log(m, LoggerLevel.Warn);
    };

    /**
     * Logs with error level
     * @param m the message
     */
    public error = async (m: string): Promise<void> => {
        await this.log(m, LoggerLevel.Error);
    };

    /**
     * Logs with fatal level
     * @param m the message
     */
    public fatal = async (m: string): Promise<void> => {
        await this.log(m, LoggerLevel.Fatal);
    };

    /**
     * Logs an message to the console
     * @param m the message
     * @param l the level override
     */
    public log = async (m: string, l?: LoggerLevel): Promise<void> => {
        if (!l) {
            l = this._level;
        }

        // Checks if the level specified is bigger than the minimum, if so
        //  proceed
        if (Logger.minimum > l) {
            return;
        }

        // Gets the writer for the logger, this will be stdout / stderr by default, but
        //  if specified, it can also be written to disk
        let writer: Deno.Writer;

        if (this._ostream) {
            writer = this._ostream;
        } if (l === LoggerLevel.Fatal || l === LoggerLevel.Error) {
            writer = Deno.stderr;
        } else {
            writer = Deno.stdout;
        }

        await writer.write(encoder.encode(`${new Date().toUTCString()} : (${logger_level_color(l)(`${LoggerLevel[l]}@${this.prefix}`)}) » ${m}\n`));
    };
}
