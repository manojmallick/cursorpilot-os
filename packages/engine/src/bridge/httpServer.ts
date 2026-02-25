import { createServer, IncomingMessage, ServerResponse } from 'http';
import { dispatch, getEvidence, resetDemo } from '../actions/actionRouter.js';
import { rotateMode } from '../actions/modes.js';
import type { Mode } from '@cursorpilot/shared';
import { ALL_MODES } from '@cursorpilot/shared';

const BRIDGE_TOKEN = process.env.BRIDGE_TOKEN ?? 'dev-only-token';
const BRIDGE_PORT = parseInt(process.env.BRIDGE_PORT ?? '8787', 10);

function parseBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}

function json(res: ServerResponse, status: number, data: unknown): void {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-CursorPilot-Token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    res.end(JSON.stringify(data));
}

function checkAuth(req: IncomingMessage, res: ServerResponse): boolean {
    const token = req.headers['x-cursorpilot-token'];
    if (token !== BRIDGE_TOKEN) {
        json(res, 401, { error: 'Unauthorized: invalid or missing X-CursorPilot-Token' });
        return false;
    }
    return true;
}

let repoPath = process.env.DEMO_REPO_PATH ?? './demo-repo';

export function setBridgeRepoPath(path: string): void {
    repoPath = path;
}

const server = createServer(async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        json(res, 204, null);
        return;
    }

    const url = req.url ?? '';

    try {
        // GET /api/evidence — no auth required for read
        if (req.method === 'GET' && url === '/api/evidence') {
            const evidence = getEvidence();
            json(res, 200, evidence);
            return;
        }

        // All POST endpoints require auth
        if (!checkAuth(req, res)) return;

        if (req.method === 'POST' && url === '/api/mode') {
            const body = JSON.parse(await parseBody(req));
            const mode = body.mode as Mode;
            if (!ALL_MODES.includes(mode)) {
                json(res, 400, { error: 'Invalid mode. Must be one of: ' + ALL_MODES.join(', ') });
                return;
            }
            const evidence = await dispatch({ type: 'rotate', delta: ALL_MODES.indexOf(mode) }, repoPath);
            json(res, 200, evidence);
            return;
        }

        if (req.method === 'POST' && url === '/api/fix') {
            const evidence = await dispatch({ type: 'press', buttonId: 'A' }, repoPath);
            json(res, 200, evidence);
            return;
        }

        if (req.method === 'POST' && url === '/api/explain') {
            const evidence = await dispatch({ type: 'press', buttonId: 'B' }, repoPath);
            json(res, 200, evidence);
            return;
        }

        if (req.method === 'POST' && url === '/api/reset') {
            const evidence = await resetDemo(repoPath);
            json(res, 200, evidence);
            return;
        }

        json(res, 404, { error: 'Not found' });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        json(res, 500, { error: message });
    }
});

export function startBridgeServer(): Promise<void> {
    return new Promise((resolve) => {
        server.listen(BRIDGE_PORT, '127.0.0.1', () => {
            console.log('CursorPilot Bridge running at http://127.0.0.1:' + BRIDGE_PORT);
            resolve();
        });
    });
}

export function stopBridgeServer(): Promise<void> {
    return new Promise((resolve) => {
        server.close(() => resolve());
    });
}
