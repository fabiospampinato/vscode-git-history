
/* IMPORT */

import vscode from 'vscode';
import * as Commands from './commands';

/* MAIN */

//TODO: Improve handling of setting, using them for editor titles etc.

const activate = (): void => {

  vscode.commands.registerCommand ( 'gitHistory.openFileAtCommit', Commands.openFileAtCommit );
  vscode.commands.registerCommand ( 'gitHistory.openFileAtCommitToSide', Commands.openFileAtCommitToSide );
  vscode.commands.registerCommand ( 'gitHistory.diffFileAtCommit', Commands.diffFileAtCommit );
  vscode.commands.registerCommand ( 'gitHistory.diffFileAtCommitAgainstCurrent', Commands.diffFileAtCommitAgainstCurrent );
  vscode.commands.registerCommand ( 'gitHistory.restoreFileAtCommit', Commands.restoreFileAtCommit );

};

/* EXPORT */

export {activate};
