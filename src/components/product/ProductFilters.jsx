const ProductFilters = ({q, setQ, cat, setCat, categories}) => {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
                value={q}
                onChange={e=>setQ(e.target.value)}
                placeholder="Buscar producto…"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex flex-wrap gap-2">
                <button onClick={()=>setCat(null)} className={`rounded-full border px-3 py-1 text-sm ${cat===null?'bg-foreground text-background':''}`}>Todas</button>
                {categories.map(c=>(
                    <button key={c.id} onClick={()=>setCat(c.id)}
                            className={`rounded-full border px-3 py-1 text-sm ${cat===c.id?'bg-foreground text-background':''}`}>
                        {c.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProductFilters;