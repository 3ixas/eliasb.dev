import json,sys
for d in sys.argv[1:]:
    p=json.load(open(d+'/probe.json'))
    paints={x['name']:round(x['t']) for x in p['paints']}
    print(f"== {p.get("motion")} {p["width"]}px {p['profile']} font-display:{p['display']}  FP {paints.get('first-paint')} FCP {paints.get('first-contentful-paint')}")
    for f in p['fontReqs']: print(f"   font {f['url'][:16]} {f['bytes']}B  {f['startMs']}->{f['endMs']}ms")
    for e in p['fontEvents']: print(f"   fonts loadingdone t={round(e['t'])}: {sorted(set(e['faces']))}")
    nz=[s for s in p['shifts'] if s['value']>0]
    fcls=sum(s['value'] for s in p['shifts'] if any(abs(s['t']-t)<150 for t in [e['t'] for e in p['fontEvents']]));print(f"   font-window CLS {fcls:.4f}; total CLS {sum(s['value'] for s in p['shifts'] if not s['hadRecentInput']):.4f}; nonzero shifts:")
    ft=[e['t'] for e in p['fontEvents']]
    for s in nz:
      if any(abs(s['t']-t)<150 for t in ft): print(f"     t={round(s['t'])} v={s['value']:.4f} " + "; ".join(f"{x['node']} {[round(v) for v in x['prev']]}->{[round(v) for v in x['curr']]}" for x in s['sources']))
    # element changes
    for k in ['name','headline','support','workHeading']:
        prev=None; out=[]
        for s in p['samples']:
            e=s['els'].get(k)
            if not e: continue
            sig=(e['w'],e['h'],e['x'],e['y'],e['opacity'],e['fontLoaded'])
            if sig!=prev and (prev is None or sig[:4]!=prev[:4] or sig[5]!=prev[5] or abs(float(sig[4])-float(prev[4]))>0.3 or sig[4] in('0','1')): out.append(f"t{round(s['t'])}:{e['w']}x{e['h']}@{e['x']},{e['y']} op{e['opacity']} f{e['fontLoaded']}")
            prev=sig
        print(f"   {k}: first sample t={round(p['samples'][0]['t'])}; " + " | ".join(out[:8]))
