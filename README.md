# Powerbase

Powerbase is the missing bridge to the worlds most trusted relational database.

## Important

### Git Workflow
- DO NOT merge multiple PRs to the remote `main` branch  with minutes time difference.
   - Due to the nature of our deployment in Cloud66 which uses a force pushed commit approach, we should avoid merging multiple PRs all at the same time or else there would be a deployment failure. We should wait for the deployment process on Cloud66 to be finished before triggering another deployment.
- DO NOT push commits to the remote `main` branch consecutively with minutes time difference.
  - The same reason with above since this triggers the deployment also.

### Environment Variables
- When adding new environment variable either on the client or on the server make sure to do the ff:
  - Add it to its corresponding the `.example` file.
  - Notify the team of the change.

### Rails Server
- When creating a **database migration**, make sure `rails db:rollback` works.
- When creating a sequel command triggered in the Powerbase app (e.g. user creates a persistent table on Powerbase), do the ff. updates in the order of:
  1. Update first the Active Record (e.g. creates a PowerbaseTable along with its PowerbaseFields, TableViews, etc.).
  2. Run the sequel command (e.g. create an actual table in the remote database).
  3. If a database error has been encountered, rollback the updates made in no. 1.
  - The reason for this is because that the syncer and listener is checking for changes made from the remote database. This is to avoid duplicate syncing.

## Structure

| Codebase                             |      Description      |
| :----------------------------------- | :-------------------: |
| [powerbase-client](powerbase-client) |     React Client      |
| [powerbase-server](powerbase-server) |   Rails API Server    |


## Running Services
| Comand                     | Port  |     Description    |
| :------------------------- | :---: |:----------------: |
| React-NodeJS Client        | 4000  | The frontend of Powerbase |
| Rails API Server           | 4001  | The API Server that communicates to the frontend |
| Sidekiq                    |  -    | For handling background jobs |
| [Elasticsearch](https://www.elastic.co/) | 9200  | For fast searching for turbo bases and storing magic values for non-turbo bases |
| [Poxa](https://github.com/edgurgel/poxa) | 6001  | For real-time updates |
| Kibana                     | 5601  | UI for Elastic Search (optional) |

## Installation

Clone Powerbase's core repository

```bash
git clone https://github.com/Group-One-Technology/powerbase-core.git
```

### Powerbase Client Setup

See [Powerbase Client README](powerbase-client/README.md)

### Powerbase Server Setup

See [Powerbase Server README](powerbase-server/README.md)

## Contributing

First, thank you for taking the time to contribute to Powerbase! There are many ways you can help out.

### Questions

If you have a question that needs an answer, you can [create an issue](https://docs.github.com/en/github/managing-your-work-on-github/creating-an-issue)

### Issues for bugs or feature requests

If you encounter any bugs, or want to request a new feature, suggest an idea or enhancement, please [create an issue](https://docs.github.com/en/github/managing-your-work-on-github/creating-an-issue) to report it.
