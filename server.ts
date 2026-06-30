import express from "express";
import path from "path";
import { Readable } from "stream";

const app = express();
const PORT = 3000;

app.use(express.json());

// Proxy endpoint to handle external API requests and bypass CORS
app.post("/api/proxy", async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }
        
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "application/json"
            }
        });
        
        if (!response.ok) {
            const errText = await response.text();
            console.error("Upstream server error:", response.status, errText);
            return res.status(response.status).json({ error: `Upstream error ${response.status}` });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error: any) {
        console.error("Proxy Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/stream", async (req, res) => {
    const streamUrl = req.query.url as string;
    if (!streamUrl) return res.status(400).send("No URL");
    
    try {
        const response = await fetch(streamUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });
        
        if (!response.ok) {
            return res.status(response.status).send(`Upstream error ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type") || "";
        
        if (streamUrl.includes(".m3u8") || contentType.includes("mpegurl")) {
            let text = await response.text();
            const baseUrl = streamUrl.substring(0, streamUrl.lastIndexOf('/') + 1);
            
            // Rewrite paths in m3u8 to go through proxy
            text = text.split('\n').map(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('#EXT-X-KEY')) {
                    return line.replace(/URI="([^"]+)"/, (match, p1) => {
                        let absoluteUrl = p1.startsWith('http') ? p1 : baseUrl + p1;
                        return `URI="/api/stream?url=${encodeURIComponent(absoluteUrl)}"`;
                    });
                }
                if (trimmedLine && !trimmedLine.startsWith('#')) {
                    let absoluteUrl = trimmedLine.startsWith('http') ? trimmedLine : baseUrl + trimmedLine;
                    return `/api/stream?url=${encodeURIComponent(absoluteUrl)}`;
                }
                return line;
            }).join('\n');
            
            res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
            // Allow CORS for the player
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res.send(text);
        }
        
        // Pass essential headers
        response.headers.forEach((value, key) => {
            if (['content-type', 'content-length', 'accept-ranges', 'content-range'].includes(key.toLowerCase())) {
                res.setHeader(key, value);
            }
        });
        res.setHeader("Access-Control-Allow-Origin", "*");
        
        if (response.body) {
            // @ts-ignore
            Readable.fromWeb(response.body).pipe(res);
        } else {
            res.end();
        }
    } catch (e: any) {
        console.error("Stream fetch error", e);
        res.status(500).send(e.message);
    }
});

app.use(express.static(process.cwd()));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
