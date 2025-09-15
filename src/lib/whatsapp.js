// src/lib/whatsapp.js
// Número de WhatsApp HARD-CODEADO (incluye código de país, sin '+')
const DEFAULT_WA_PHONE = "593987039983";

export const normalizePhone = (raw) => String(raw || "").replace(/\D/g, "");
export const getDefaultWhatsAppPhone = () => normalizePhone(DEFAULT_WA_PHONE);

// Crea la URL más compatible (api.whatsapp.com > wa.me como fallback)
const buildWhatsAppURL = ({ phone, text }) => {
    const p = normalizePhone(phone ?? getDefaultWhatsAppPhone());
    const msg = String(text || "");
    // Ruta recomendada (no pierde el mensaje en Desktop)
    const primary = `https://api.whatsapp.com/send?phone=${p}&text=${encodeURIComponent(msg)}`;
    // Fallback (por si alguien lo prefiere)
    const fallback = `https://wa.me/${p}?text=${encodeURIComponent(msg)}`;
    return { primary, fallback };
};

export const whatsappLink = ({ phone, text }) => buildWhatsAppURL({ phone, text }).primary;

// Arma un mensaje detallado del carrito (con SKU si existe) y total
export const cartToWhatsAppDetailedURL = ({ phone, items = [], extra }) => {
    const p = normalizePhone(phone ?? getDefaultWhatsAppPhone());

    const total = items.reduce(
        (a, b) => a + Number(b.qty || 0) * Number(b.price || 0),
        0
    );

    const lines = items.map((i) => {
        const qty = Number(i.qty || 0);
        const price = Number(i.price || 0);
        const lineTotal = (qty * price).toFixed(2);
        const sku = i.sku ? ` [${i.sku}]` : "";
        return `• ${i.name}${sku} x${qty} = $${lineTotal}`;
    });

    const extras = [];
    if (extra?.payment) extras.push(`Pago: ${extra.payment}`);
    if (extra?.delivery) extras.push(`Envío: ${extra.delivery}`);

    const text =
        `Hola! Quiero confirmar compra:\n` +
        `${lines.join("\n")}\n` +
        `Total: $${total.toFixed(2)}` +
        (extras.length ? `\n${extras.join("\n")}` : "");

    return buildWhatsAppURL({ phone: p, text }).primary;
};
