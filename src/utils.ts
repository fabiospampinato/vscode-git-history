
/* IMPORT */

import * as _ from 'lodash';
import * as absolute from 'absolute';
import * as findUp from 'find-up';
import * as fs from 'fs';
import * as moment from 'moment';
import * as path from 'path';
import * as pify from 'pify';
import * as simpleGit from 'simple-git';
import * as temp from 'temp';
import * as vscode from 'vscode';
import * as Commands from './commands';
import Config from './config';

/* UTILS */

const Utils = {

  initCommands ( context: vscode.ExtensionContext ) {

    const {commands} = vscode.extensions.getExtension ( 'fabiospampinato.vscode-git-history' ).packageJSON.contributes;

    commands.forEach ( ({ command, title }) => {

      const commandName = _.last ( command.split ( '.' ) ) as string,
            handler = Commands[commandName],
            disposable = vscode.commands.registerCommand ( command, () => handler () );

      context.subscriptions.push ( disposable );

    });

    return Commands;

  },

  editor: {

    open ( content, language, column? ) { //TODO: Set a custom title

      vscode.workspace.openTextDocument ({ language }).then ( ( textDocument: vscode.TextDocument ) => {

        vscode.window.showTextDocument ( textDocument, column ).then ( ( textEditor: vscode.TextEditor ) => {

          textEditor.edit ( edit => {

            const pos = new vscode.Position ( 0, 0 );

            edit.insert ( pos, content );

            textEditor.document.save ();

          });

        });

      });

    }

  },

  folder: {

    getRootPath ( basePath? ) {

      const {workspaceFolders} = vscode.workspace;

      if ( !workspaceFolders ) return;

      const firstRootPath = workspaceFolders[0].uri.fsPath;

      if ( !basePath || !absolute ( basePath ) ) return firstRootPath;

      const rootPaths = workspaceFolders.map ( folder => folder.uri.fsPath ),
            sortedRootPaths = _.sortBy ( rootPaths, [path => path.length] ).reverse (); // In order to get the closest root

      return sortedRootPaths.find ( rootPath => basePath.startsWith ( rootPath ) );

    },

    async getWrapperPathOf ( rootPath, cwdPath, findPath ) {

      const foundPath = await findUp ( findPath, { cwd: cwdPath } );

      if ( foundPath ) {

        const wrapperPath = path.dirname ( foundPath );

        if ( wrapperPath.startsWith ( rootPath ) ) {

          return wrapperPath;

        }

      }

    }

  },

  commit: {

    parse: {

      author ( commit ) {

        return commit.author_name;

      },

      date ( commit ) {

        const config = Config.get ();

        return moment ( new Date ( commit.date ) ).format ( config.details.date.format );

      },

      hash ( commit ) {

        const config = Config.get ();

        return commit.hash.slice ( 0, config.details.hash.length );

      },

      message ( commit ) {

        return commit.message;

      }

    }

  },

  repo: {

    getGit ( repopath ) {

      return pify ( _.bindAll ( simpleGit ( repopath ), ['log', 'show'] ) );

    },

    async getPath () {

      const {activeTextEditor} = vscode.window,
            editorPath = activeTextEditor && activeTextEditor.document.uri.fsPath,
            rootPath = Utils.folder.getRootPath ( editorPath );

      if ( !rootPath ) return false;

      return await Utils.folder.getWrapperPathOf ( rootPath, editorPath || rootPath, '.git' );

    },

    async getCommits ( git, filepath? ) {

      try {

        const log = await git.log ({ file: filepath });

        return log.all;

      } catch ( e ) {

        return [];

      }

    },

    async getContentByCommit ( git, commit, filepath ) {

      try {

        return await git.show ( `${commit.hash}:${filepath}` );

      } catch ( e ) {

        return false;

      }

    }

  },

  temp: {

    getOptions ( filepath ) {

      return {
        prefix: 'vscode-git-history',
        suffix: path.extname ( filepath )
      };

    },

    async makeFile ( options, content? ) {

      const info = await pify ( temp.open )( options );

      if ( content ) await pify ( fs.write )( info.fd, content );

      await pify ( fs.close )( info.fd );

      return info.path;

    }

  },

  ui: {

    makeItems ( commits ) {

      const config = Config.get ();

      return commits.map ( commit => {

        const label = Utils.commit.parse.message ( commit ),
              author = config.details.author.enabled && Utils.commit.parse.author ( commit ),
              date = config.details.date.enabled && Utils.commit.parse.date ( commit ),
              hash = config.details.hash.enabled && Utils.commit.parse.hash ( commit ),
              detail = _.compact ([ author, date, hash ]).join ( ' - ' );

        return { commit, label, detail };

      });

    }

  }

};

/* EXPORT */

export default Utils;
