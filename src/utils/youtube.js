export function toYouTubeEmbed(url = "") {
    if (!url) return null;
    try {
        const u = new URL(url);
        const host = u.hostname.replace(/^www\./, "");
        const path = u.pathname;
        const q = u.searchParams;

        // obtener id
        let id = null;
        if (host === "youtu.be") id = path.slice(1);
        else if (path.startsWith("/watch")) id = q.get("v");
        else if (path.startsWith("/embed/")) id = path.split("/")[2];
        else if (path.startsWith("/shorts/")) id = path.split("/")[2];

        if (!id) return url; // no es YouTube o no se pudo parsear: devuelvo tal cual

        // opcionales
        const start = q.get("t") || q.get("start");
        const list = q.get("list");

        const sp = new URLSearchParams();
        sp.set("modestbranding", "1");
        sp.set("rel", "0");
        if (start) sp.set("start", String(start).replace(/s$/i, ""));
        if (list) sp.set("list", list);

        return `https://www.youtube-nocookie.com/embed/${id}?${sp.toString()}`;
    } catch {
        return url;
    }
}
