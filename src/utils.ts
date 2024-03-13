
/* IMPORT */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vscode from 'vscode';
import {alert, getActiveBinaryFilePath, getActiveTextualFilePath, getConfig, getGitRootPath, prompt} from 'vscode-extras';
import zeptoid from 'zeptoid';
import Git from './git';
import type {Commit, FileData, Options} from './types';

/* MAIN */

const formatDate = ( date: Date ): string => {

  const year = date.getFullYear ();
  const month = `${date.getMonth () + 1}`.padStart ( 2, '0' );
  const day = `${date.getDate ()}`.padStart ( 2, '0' );
  const hours = `${date.getHours ()}`.padStart ( 2, '0' );
  const minutes = `${date.getMinutes ()}`.padStart ( 2, '0' );

  return `${year}-${month}-${day} ${hours}:${minutes}`;

};

const getFileData = async (): Promise<FileData | undefined> => {

  const binaryFilePath = getActiveBinaryFilePath ();
  const textualFilePath = getActiveTextualFilePath ();
  const filePath = textualFilePath || binaryFilePath;
  const isBinary = !textualFilePath && !!binaryFilePath;
  const isTextual = !isBinary;
  const language = isTextual ? vscode.window.activeTextEditor?.document.languageId : undefined;

  if ( !filePath ) return alert.error ( 'You have to open a file first' );

  const gitPath = getGitRootPath ();

  if ( !gitPath ) return alert.error ( 'This file does not belong to a git repository' );

  const commits = await Git.getCommits ( gitPath, filePath );

  if ( !commits.length ) return alert.error ( 'No commits involving this file found' );

  const items = getFileItems ( commits );
  const item = await prompt.select ( 'Select a commit...', items );

  if ( !item ) return;

  const commitIndex = commits.indexOf ( item.commit );
  const prevCommit = commits[commitIndex + 1];
  const nextCommit = commits[commitIndex - 1];
  const content = await Git.getContentAtCommit ( gitPath, filePath, item.commit.hash );

  if ( !content ) return alert.error ( 'Could not get this commit\'s content, please report the error' );

  return { filePath, gitPath, isBinary, isTextual, language, commits, prevCommit, commit: item.commit, nextCommit, content };

};

const getFileItems = ( commits: Commit[] ): { commit: Commit, label: string, detail: string }[] => {

  const options = getOptions ();

  return commits.map ( commit => {

    const label = commit.message;
    const author = options.details.author.enabled && commit.author_name;
    const date = options.details.date.enabled && formatDate ( new Date ( commit.date ) );
    const hash = options.details.hash.enabled && commit.hash.slice ( 0, options.details.hash.length );
    const detail = [author, date, hash].filter ( isString ).join ( ' - ' );

    return { commit, label, detail };

  });

};

const getFileTemp = async ( filePath: string, fileContent: Buffer, commit?: Commit ): Promise<string> => {

  const {name, ext} = path.parse ( filePath );
  const tempFileName = `${name}@${commit?.hash.slice ( 0, 7 ) || 'null'}${ext}`;
  const tempFolderPath = path.join ( os.tmpdir (), zeptoid () );
  const tempFilePath = path.join ( tempFolderPath, tempFileName );

  await fs.promises.mkdir ( tempFolderPath, { recursive: true } );
  await fs.promises.writeFile ( tempFilePath, fileContent );

  return tempFilePath;

};

const getOptions = (): Options => {

  const config = getConfig ( 'gitHistory' );
  const authorEnabled = isBoolean ( config?.details?.author?.enabled ) ? config.details.author.enabled : true;
  const dateEnabled = isBoolean ( config?.details?.date?.enabled ) ? config.details.date.enabled : true;
  const hashEnabled = isBoolean ( config?.details?.hash?.enabled ) ? config.details.hash.enabled : false;
  const hashLength = isNumber ( config?.details?.hash?.length ) ? config.details.hash.length : 7;

  return { details: { author: { enabled: authorEnabled }, date: { enabled: dateEnabled }, hash: { enabled: hashEnabled, length: hashLength } } };

};

const isBoolean = ( value: unknown ): value is boolean => {

  return typeof value === 'boolean';

};

const isNumber = ( value: unknown ): value is number => {

  return typeof value === 'number';

};

const isString = ( value: unknown ): value is string => {

  return typeof value === 'string';

};

const truncate = ( str: string, length: number ): string => {

  if ( str.length <= length ) {

    return str;

  } else {

    return `${str.slice ( 0, length - 1 )}…`;

  }

};

/* EXPORT */

export {formatDate, getFileData, getFileItems, getFileTemp, getOptions, isBoolean, isNumber, isString, truncate};
