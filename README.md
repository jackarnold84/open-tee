# OpenTee

Golf tee time alert manager

https://jackarnold84.github.io/open-tee/

## Develop

### UI
- requirements
  - Node.js and npm
  - Gatsby CLI
- develop locally
  - `npm start`
- build locally
  - `npm build`
- serve on local network
  - `npm run serve`
- deploy to GitHub Pages
  - `npm run deploy`
  - see [gatsby-config.js](gatsby-config.js) for options

### Service
Located in [service/](service/) directory
- requirements
  - Go (Golang)
  - AWS CLI + AWS-SAM CLI
- use [Makefile](service/Makefile) to build, test, and deploy to AWS
