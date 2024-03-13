
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';
import {exec} from 'vscode-extras';
import type {Commit} from './types';

/* MAIN */

const Git = {

  /* API */

  exec: async ( cwd: string, args: string[] ): Promise<Buffer> => {

    const result = await exec ( 'git', args, { cwd } );

    return result.stdout;

  },

  getCommits: async ( cwd: string, filePath: string ): Promise<Commit[]> => {

    const log = await Git.exec ( cwd, ['log', '-n', `${100_000}`, `--pretty=format:%aE^^^^%aN^^^^%aD^^^^%H^^^^%s`, '--', filePath] );
    const rows = log.toString ().split ( /\r\n?|\n/g ).filter ( Boolean ).map ( row => row.split ( '^^^^' ) );
    const commits = rows.map ( ([ author_email, author_name, date, hash, message ]) => ({ author_email, author_name, date, hash, message }) );

    return commits;

  },

  getContentAtCommit: async ( cwd: string, filePath: string, commit: string ): Promise<Buffer | undefined> => {

    try {

      const relPath = path.relative ( cwd, filePath ).replace( /\\+/g, '/' );

      return await Git.exec ( cwd, ['show', `${commit}:${relPath}`] );

    } catch ( error ) {

      console.error ( error );

      return;

    }

  },

  getContentAtHead: async ( cwd: string, filePath: string ): Promise<Buffer> => {

    return fs.promises.readFile ( filePath );

  }

};

/* EXPORT */

export default Git;
