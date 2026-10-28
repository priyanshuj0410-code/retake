"""The memory guard every FLUX script calls before it loads the painter (24 GB Mac; mac-memory-limit).

28 Oct 2026: the dailies' sample paint was started while the Mac already held 13.5 GB of other programs' memory in the
compressor and 5.3 GB in swap (a browser, Zoom and the Claude app, six days after a restart). Loading the painter's
16 GB on top of that ran the Mac out of memory within a minute. Free memory read 80%, so a free-memory check alone
passes in exactly this state; what counts is how much other memory is already squeezed or on disk.

ready() refuses to load (exit 4, saying why) while another FLUX job runs, or while compressed memory and swap together
pass SQUEEZED_GB. watch() runs beside the painter from before it loads and stops the job at once (exit 3, resumable)
if swap grows by SWAP_GROWTH_GB, the compressor by COMPRESSED_GROWTH_GB, or free memory stays under 5%.
"""
import os, re, subprocess, sys, threading, time

SQUEEZED_GB = 6.0
SWAP_GROWTH_GB = 1.0
COMPRESSED_GROWTH_GB = 4.0
GB = 2 ** 30


def compressed_gb():
    out = subprocess.run(['vm_stat'], capture_output=True, text=True).stdout
    page = int(re.search(r'page size of (\d+)', out).group(1))
    return int(re.search(r'Pages stored in compressor:\s+(\d+)', out).group(1)) * page / GB


def swap_gb():
    m = re.search(r'used = ([\d.]+)M', subprocess.run(['sysctl', '-n', 'vm.swapusage'], capture_output=True, text=True).stdout)
    return float(m.group(1)) / 1024 if m else 0.0


def free_pct():
    try:
        out = subprocess.run(['memory_pressure'], capture_output=True, text=True, timeout=20).stdout
        return int(re.search(r'free percentage: (\d+)%', out).group(1))
    except Exception:
        return 100


def other_flux():
    """Any other process that names FLUX and holds over 1 GB, or any process over 6 GB, that is not this one or its parents."""
    rows = {}
    for ln in subprocess.run(['ps', '-axo', 'pid=,ppid=,rss=,command='], capture_output=True, text=True).stdout.splitlines():
        f = ln.split(None, 3)
        if len(f) == 4:
            rows[int(f[0])] = (int(f[1]), int(f[2]), f[3])
    mine, pid = set(), os.getpid()
    while pid in rows and pid not in mine:
        mine.add(pid)
        pid = rows[pid][0]
    return [f'{p} {cmd[:90]}' for p, (_, rss, cmd) in rows.items()
            if p not in mine and not cmd.startswith(('ps ', 'grep ')) and 'heavyq' not in cmd
            and ((re.search(r'mflux|klein|flux', cmd, re.I) and rss > 2 ** 20) or rss > 6 * 2 ** 20)]


def biggest(n=5):
    """The programs holding the most memory, for the refusal message."""
    rows = []
    for ln in subprocess.run(['ps', '-axo', 'rss=,comm='], capture_output=True, text=True).stdout.splitlines():
        rss, _, comm = ln.strip().partition(' ')
        m = re.search(r'/Applications/([^/]+)\.app', comm)
        rows.append((m.group(1) if m else os.path.basename(comm), int(rss)))
    total = {}
    for name, rss in rows:
        total[name] = total.get(name, 0) + rss
    return ', '.join(f'{k} {v / 2 ** 20:.1f} GB' for k, v in sorted(total.items(), key=lambda x: -x[1])[:n])


def ready():
    others, sq = other_flux(), compressed_gb() + swap_gb()
    why = ('another FLUX job is running: ' + '; '.join(others) if others else
           f'{sq:.1f} GB of other memory is already compressed or in swap (limit {SQUEEZED_GB:.0f} GB). Close the largest '
           f'programs, or restart the Mac, then run it again. Largest now: {biggest()}' if sq > SQUEEZED_GB else '')
    if why:
        print('not painting: ' + why, file=sys.stderr, flush=True)
        sys.exit(4)


def watch():
    """Starts the watcher thread; call it before the painter loads."""
    s0, c0 = swap_gb(), compressed_gb()

    def run():
        low = 0
        while True:
            time.sleep(5)
            s, c = swap_gb() - s0, compressed_gb() - c0
            low = low + 1 if free_pct() < 5 else 0
            why = (f'swap grew {s:.1f} GB' if s > SWAP_GROWTH_GB else f'compressed memory grew {c:.1f} GB' if c > COMPRESSED_GROWTH_GB
                   else 'free memory under 5% for 10 seconds' if low >= 2 else '; '.join(other_flux()))
            if why:
                print('stopping: ' + why, flush=True)
                os._exit(3)
    threading.Thread(target=run, daemon=True).start()


if __name__ == '__main__':
    print(f'compressed {compressed_gb():.1f} GB, swap {swap_gb():.1f} GB, free {free_pct()}%, other FLUX: {other_flux() or "none"}')
    print('largest:', biggest())
    ready(); print('ready to paint')
