# Valorant XMPP Log Experiments

Runs experiments across a directory of XMPP logs from [Valorant XMPP Logger](https://github.com/techchrism/valorant-xmpp-logger)

Currently, the only experiment tests for properties in the decoded presence data that start with "test".
There are four such values:

| Name         | First Seen                        | Observed Values |
|--------------|-----------------------------------|-----------------|
| `tempValueX` | Mar 06 2024 (after release-08.04) | `""`            |
| `tempValueY` | Mar 06 2024 (after release-08.04) | `""`            |
| `tempValueZ` | Mar 27 2024 (after release-08.05) | `false`         |
| `tempValueW` | Mar 27 2024 (after release-08.05) | `false`         |

## Usage
  - Clone the repo and run `npm install`
  - Run `npm run build` to build the project
  - Run `node . <directory>` to run