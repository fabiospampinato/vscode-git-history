
/* IMPORT */

import * as fs from 'fs';
import * as moment from 'moment';
import * as path from 'path';
import * as temp from 'temp';
import * as vscode from 'vscode';
import Utils from './utils';

/* COMMANDS */

function diff ( leftPath, rightPath, commit? ) {

  const leftUri = vscode.Uri.file ( leftPath ),
        rightUri = vscode.Uri.file ( rightPath ),
        date = commit && Utils.commit.parse.date ( commit ),
        hash = commit && Utils.commit.parse.hash ( commit ),
        title = commit ? [date, hash].join ( ' - ' ) : 'Diff History';

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

  const content = await Utils.repo.getContentByCommit ( git, item.commit, relfilepath );

  if ( content === false ) return vscode.window.showErrorMessage ( 'Couldn\'t get this commit\'s content, please report the error' );

  return { editor: activeTextEditor, repopath, filepath, relfilepath, git, commits, commit: item.commit, content };

}

async function fileHistory ( side? ) {

  const data = await _getFileData () as any;

  if ( !data ) return;

  const column = side ? vscode.ViewColumn.Three : undefined;

  Utils.editor.open ( data.content, data.editor.document.languageId, column );

}

function fileHistoryToSide () {

  return fileHistory ( true );

}

async function fileDiff () {

  const data = await _getFileData () as any;

  if ( !data ) return;

  const tempOptions = {
    prefix: 'vscode-git-history',
    suffix: path.extname ( data.filepath )
  };

  temp.open ( tempOptions, ( err, info ) => {
    if ( err ) return vscode.window.showErrorMessage ( err.message );
    fs.write ( info.fd, data.content );
    fs.close ( info.fd, err => {
      if ( err ) return vscode.window.showErrorMessage ( err.message );
      diff ( data.filepath, info.path, data.commit );
    })
  });

}

/* EXPORT */

export {diff, fileHistory, fileHistoryToSide, fileDiff};
