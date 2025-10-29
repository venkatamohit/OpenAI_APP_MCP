# Skyward Rewards Travel App

This folder contains a sample OpenAI App inspired by the **Pizzazz** example from the
[openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples/tree/main) repository.
It showcases a premium travel booking experience where customers can compare cash and
points pricing for curated flight tickets.

## Structure

```
travel-app/
├── app/           # Front-end React UI powered by Vite
└── mcp/           # Python-only MCP server exposing flight offers
```

## Getting started

### UI

```
cd app
npm install
npm run dev
```

The UI is implemented with React, TypeScript and Material UI components. It renders a
responsive catalog of flight offers, each displaying cash and points fares side-by-side.

### MCP server

```
cd mcp
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python travel_mcp.py
```

The MCP server exposes tools to list available flights and fetch detailed pricing for
specific itineraries.
