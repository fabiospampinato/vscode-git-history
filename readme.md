# Git File History

<p align="center">
  <img src="https://raw.githubusercontent.com/fabiospampinato/vscode-git-history/master/resources/logo.png" width="128" alt="Logo">
</p>

View or diff against previous versions of the current file.

There are at least a couple of other extensions that provide these functionalities, but they are so bloated with features I don't need that I couldn't even make them work.

## Install

Follow the instructions in the [Marketplace](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-git-history), or run the following in the command palette:

```shell
ext install fabiospampinato.vscode-git-history
```

## Usage

It adds 5 commands to the command palette:

```js
'Git: Open File at Commit' // Open the current file at particular commit in time
'Git: Open File at Commit to the Side' // Open the current file, to the side, at particular commit in time
'Git: Diff File at Commit' // View the changes made to the current file in a particular commit in time
'Git: Diff File at Commit against Current' // View the changes made to the current file between now and a particular commit in time
'Git: Restore File at Commit' // Restore the content of the current file at particular commit in time
```

## Settings

```js
{
  "gitHistory.details.author.enabled": true, // Show the name of the commit's author
  "gitHistory.details.date.enabled": true, // Show the date of the commit
  "gitHistory.details.hash.enabled": false, // Show the hash of the commit
  "gitHistory.details.hash.length": 7 // Show only this number of characters from the end of the hash
}
```

## Hints

- **Diff against opened files**: sometimes diffing against a previous version of a file is not what you want, try [Diff](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-diff) for diffing against any arbitrary open file you have.

## License

MIT © Fabio Spampinato
