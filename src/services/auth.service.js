import {api} from "@/lib/api";

export async function loginRequest({username, password}) {
    console.log("loginRequest called with:", {username, password});
    const res = await api.post("/auth/login", {username, password});
    console.log("loginRequest response:", res);
    const token =
        typeof res.data === "string"
            ? res.data
            : res?.data?.token || res?.raw?.data?.token || null;
    return {token};
}

export async function verifyTokenRequest() {
    const r = await api.post("/auth/verify");
    // Soporta varias formas: { data: { user } } o { user }
    const user = r.data?.user || r.raw?.data?.user || r.raw?.user || null;
    return {user};
}
