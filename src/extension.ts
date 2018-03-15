
/* IMPORT */

import * as temp from 'temp';
import * as vscode from 'vscode';
import Utils from './utils';

/* ACTIVATE */

function activate ( ctx: vscode.ExtensionContext ) {

  temp.track ();

  return Utils.initCommands ( ctx );

}

async function deactivate () {

  temp.cleanupSync ();

}

/* EXPORT */

export {activate, deactivate};
