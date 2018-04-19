
/* IMPORT */

import * as moment from 'moment';
import * as vscode from 'vscode';
import Utils from './utils';

/* COMMANDS */

function diff ( leftPath, rightPath, commit? ) {

  const leftUri = vscode.Uri.file ( leftPath ),
        rightUri = vscode.Uri.file ( rightPath ),
        date = commit && Utils.commit.parse.date ( commit ),
        hash = commit && Utils.commit.parse.hash ( commit ),
        message = commit && Utils.commit.parse.message ( commit ),
        title = commit ? [message, date, hash].join ( ' - ' ) : 'File Diff';

  return vscode.commands.executeCommand ( 'vscode.diff', leftUri, rightUri, title );

}

async function _getFileData () {

  const {activeTextEditor} = vscode.window;

  if ( !activeTextEditor ) return vscode.window.showErrorMessage ( 'You have to open a file first' );

  const filepath = activeTextEditor.document.uri.fsPath,
        repopath = await Utils.repo.getPath ();

  if ( !repopath ) return vscode.window.showErrorMessage ( 'This file doesn\'t belong to a git repository' );

  const relfilepath = filepath.substring ( repopath.length + 1 ),
        git = Utils.repo.getGit ( repopath ),
        commits = await Utils.repo.getCommits ( git, filepath );

  if ( !commits.length ) return vscode.window.showErrorMessage ( 'No commits involving this file found' );

  const items = Utils.ui.makeItems ( commits ),
        item = await vscode.window.showQuickPick ( items, { placeHolder: 'Select a commit...' } ) as any;

  if ( !item ) return;

  const commitIndex = commits.indexOf ( item.commit ),
        prevCommit = ( commitIndex >= ( commits.length - 1 ) ) ? undefined : commits[commitIndex + 1],
        nextCommit = ( commitIndex <= 0 ) ? undefined : commits[commitIndex - 1];

  const content = await Utils.repo.getContentByCommit ( git, item.commit, relfilepath );

  if ( content === false ) return vscode.window.showErrorMessage ( 'Couldn\'t get this commit\'s content, please report the error' );

  return { editor: activeTextEditor, repopath, filepath, relfilepath, git, commits, prevCommit, commit: item.commit, nextCommit, content };

}

async function openFileAtCommit ( side? ) {

  const data = await _getFileData () as any;

  if ( !data ) return;

  const column = side ? vscode.ViewColumn.Three : undefined;

  Utils.editor.open ( data.content, data.editor.document.languageId, column );

}

function openFileAtCommitToSide () {

  return openFileAtCommit ( true );

}

async function diffFileAtCommit () {

  const data = await _getFileData () as any;

  if ( !data ) return;

  const tempOptions = Utils.temp.getOptions ( data.filepath ),
        prevContent = data.prevCommit ? await Utils.repo.getContentByCommit ( data.git, data.prevCommit, data.relfilepath ) : '',
        prevPath = await Utils.temp.makeFile ( tempOptions, prevContent ),
        targetPath = await Utils.temp.makeFile ( tempOptions, data.content );

  diff ( prevPath, targetPath, data.commit );

}

async function diffFileAtCommitAgainstCurrent () {

  const data = await _getFileData () as any;

  if ( !data ) return;

  const tempOptions = Utils.temp.getOptions ( data.filepath ),
        tempPath = await Utils.temp.makeFile ( tempOptions, data.content );

  diff ( data.filepath, tempPath, data.commit );

}

/* EXPORT */

export {diff, openFileAtCommit, openFileAtCommitToSide, diffFileAtCommit, diffFileAtCommitAgainstCurrent};
