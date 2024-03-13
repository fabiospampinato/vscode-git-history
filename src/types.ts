
/* MAIN */

type Commit = {
  author_email: string,
  author_name: string,
  date: string,
  hash: string,
  message: string
};

type FileData = {
  filePath: string,
  gitPath: string,
  isBinary: boolean,
  isTextual: boolean,
  language?: string,
  commits: Commit[]
  prevCommit: Commit | undefined,
  commit: Commit,
  nextCommit: Commit | undefined,
  content: Buffer
};

type Options = {
  details: {
    author: {
      enabled: boolean
    },
    date: {
      enabled: boolean
    },
    hash: {
      enabled: boolean,
      length: number
    }
  }
};

/* EXPORT */

export type {Commit, FileData, Options};
