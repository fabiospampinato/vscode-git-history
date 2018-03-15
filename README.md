# VSC Git File History

<p align="center">
	<img src="https://raw.githubusercontent.com/fabiospampinato/vscode-git-history/master/resources/logo-128x128.png" alt="Logo">
</p>

View or diff against previous versions of the current file.

There are at least a couple of other extensions that provide these functionalities, but they are so bloated with features I don't need that I couldn't even make them work.

## Install

Run the following in the command palette:

```shell
ext install vscode-git-history
```

## Usage

It adds 3 commands to the command palette:

```js
'Git: File History' // View a previous version of the current file
'Git: File History to the Side' // View a previous version of the current file, opening it to the side
'Git: File Diff' // Diff against a previous version of the current file
```

## Settings

```js
{
  "gitHistory.details.author.enabled": true, // Show the name of the commit's author
  "gitHistory.details.date.enabled": true, // Show the date of the commit
  "gitHistory.details.date.format": "YYYY-MM-DD HH:mm", // Format used for displaying the date
  "gitHistory.details.hash.enabled": false, // Show the hash of the commit
  "gitHistory.details.hash.length": 7 // Show only this number of characters from the end of the hash
}
```

Dates are formatted using [moment](https://momentjs.com/docs/#/displaying/format/).

## Demo

### Open a previous version to the side

![History](resources/demo/history.gif)

### Diff against a previous version

![History](resources/demo/diff.gif)

## Hints:

- **Diff against opened files**: sometimes diffing against a previous version of a file is not enough, try [Diff](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-diff) for diffing against any arbitrary open file you have.

## License

MIT © Fabio Spampinato
