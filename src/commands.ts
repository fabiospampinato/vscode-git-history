
/* IMPORT */

import {Buffer} from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import vscode from 'vscode';
import {alert, openInDiffEditor, openInEditor} from 'vscode-extras';
import Git from './git';
import {getFileData, getFileTemp, truncate} from './utils';

/* MAIN */

const openFileAtCommit = async (): Promise<void> => {

  const data = await getFileData ();

  if ( !data ) return;

  const filePath = await getFileTemp ( data.filePath, data.content, data.commit );

  openInEditor ( filePath );

};

const openFileAtCommitToSide = async (): Promise<void> => {

  const data = await getFileData ();

  if ( !data ) return;

  const filePath = await getFileTemp ( data.filePath, data.content, data.commit );
  const viewColumn = vscode.ViewColumn.Beside;

  openInEditor ( filePath, { viewColumn } );

};

const diffFileAtCommit = async (): Promise<void> => {

  const data = await getFileData ();

  if ( !data ) return;

  const prevContent = data.prevCommit ? await Git.getContentAtCommit ( data.gitPath, data.filePath, data.prevCommit.hash ) : Buffer.alloc ( 0 );

  if ( !prevContent ) return alert.error ( `Failed to read file content at commit ${data.prevCommit?.hash}` );

  const prevFilePath = await getFileTemp ( data.filePath, prevContent, data.prevCommit );
  const nextFilePath = await getFileTemp ( data.filePath, data.content, data.commit );
  const title = `${path.basename ( data.filePath )} - ${truncate ( data.commit.message, 60 )}`;

  openInDiffEditor ( prevFilePath, nextFilePath, title );

};

const diffFileAtCommitAgainstCurrent = async (): Promise<void> => {

  const data = await getFileData ();

  if ( !data ) return;

  const prevFilePath = await getFileTemp ( data.filePath, data.content, data.commit );
  const nextContent = await Git.getContentAtHead ( data.gitPath, data.filePath );
  const nextFilePath = await getFileTemp ( data.filePath, nextContent );
  const title = `${path.basename ( data.filePath )} - ${truncate ( data.commit.message, 60 )}`;

  openInDiffEditor ( prevFilePath, nextFilePath, title );

};

const restoreFileAtCommit = async (): Promise<void> => {

  const data = await getFileData ();

  if ( !data ) return;

  await fs.promises.writeFile ( data.filePath, data.content );

};

/* EXPORT */

export {openFileAtCommit, openFileAtCommitToSide, diffFileAtCommit, diffFileAtCommitAgainstCurrent, restoreFileAtCommit};
