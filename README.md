# Whisperrr Frontend

React ( TypeScript ) UI for the Whisperrr transcription platform.

## Related repositories

- [whisperrr-backend](https://github.com/) — Spring Boot API (replace with your remote)
- [whisperrr-py-microservice](https://github.com/) — Python transcription service (replace with your remote)

## Prerequisites

- Node.js 18+

## Configuration

Point the app at your API (default assumes `http://localhost:7331/api`):

```bash
./setup-env.sh
```

This writes `.env` with `REACT_APP_API_URL`. Restart `npm start` after changes.

## Run locally

```bash
npm install
npm start
```

Default dev server: http://localhost:3737

## Tests & lint

```bash
npm test
npm run lint
```

## Production build

```bash
npm run build
npx serve -s build -l 3737
```

## License

MIT — see [LICENSE](LICENSE).
