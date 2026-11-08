# Homelab — by D'Vaughn House

> Run AI on your own hardware. Real builds, real benchmarks, no cloud bill.

Canonical: https://homelab.dvaughnhouse.com/
Last updated: 2026-11-05

Run AI on *your own* hardware. Real builds, real benchmarks, no cloud bill.

By D'Vaughn House · Cincinnati, Ohio

> This page shows snippets — sign in to read a full post. Full posts are not included in any markdown version of this site.

## Latest builds

- [Never Leave a Page Blank: The 164-Byte Stub That Looked Like an Outage](https://homelab.dvaughnhouse.com/posts/never-leave-a-page-blank.html) — The Workshop's front page looked broken. The sign-in behind it was fine. The page itself was the defect — and fixing the file wasn't enough, because a second server was still serving the old one.
- [I Put My Own Blog Behind a Sign-In Gate (and Kept the Front Door Open)](https://homelab.dvaughnhouse.com/posts/blog-behind-sign-in-gate.html) — The posts moved behind a sign-in. The front page stayed public, with a banner that says plainly what it shows and what it doesn't.
- [I Deleted Google Fonts From Five Sites in One Afternoon](https://homelab.dvaughnhouse.com/posts/deleted-google-fonts-from-five-sites.html) — An audit found the same small leak on five of my apps. The fix was free, boring, and satisfying: download the fonts, serve them myself, and stop phoning a stranger's server on every page load.
- [Moving a Live Worker Between Machines Without Dropping the Queue](https://homelab.dvaughnhouse.com/posts/moving-a-live-worker-between-machines.html) — One queue, one worker, one move — and the watchers came along too.
- [My AI Server Was Up and Nobody Could Reach It](https://homelab.dvaughnhouse.com/posts/ai-server-was-up-nobody-could-reach-it.html) — The models were running, the machine was on, and every other machine in the house got nothing. The fault was never the models. It was where the server was listening, and then where the remote-access name was pointing.
- [Why Gmail Rejects Mail From Your Homelab (and the Relay That Fixed Mine)](https://homelab.dvaughnhouse.com/posts/why-gmail-rejects-homelab-mail.html) — One evening, one failed invite, and the lesson that a home connection is not a mail server — no matter how correct your setup is.
- [The Tunnel Had Two Ends: Hunting a Ghost That Only 404'd Half the Time](https://homelab.dvaughnhouse.com/posts/the-tunnel-had-two-ends.html) — I fixed this exact bug once. It came back anyway — because stopping a service is not the same as killing it.
- [Docker on the iMac: what's running and why](https://homelab.dvaughnhouse.com/posts/docker-on-the-imac-whats-running-and-why.html) — One old desktop, now the always-on box for the whole operation — here's everything actually running on it in Docker, and what's still missing from the picture.
- [Cloudflare Tunnel: exposing homelab services with no port forwarding](https://homelab.dvaughnhouse.com/posts/cloudflare-tunnel-no-port-forwarding.html) — How I put my homelab on the public internet — real domains, real HTTPS — without opening a single port on my router.
- [What broke when I networked my Mac Studio and iMac together](https://homelab.dvaughnhouse.com/posts/networking-mac-studio-and-imac.html) — Two machines, one network, five days of breakage — and a link that finally holds.
- [Serving local AI models over my home network](https://homelab.dvaughnhouse.com/posts/mac-studio-model-serving.html) — A Mac Studio M2 Ultra with 64GB of unified memory, serving open-source models to every machine in the house through an OpenAI-compatible API.
- [Turning a 2017 iMac into a 24/7 homelab server](https://homelab.dvaughnhouse.com/posts/imac-homelab-server.html) — One aging all-in-one, Arch Linux, and a reverse proxy — the always-on box that runs the whole operation.
- [My local AI stack, and why I run my own infrastructure](https://homelab.dvaughnhouse.com/posts/local-ai-stack.html) — Ollama, Open WebUI, Stable Diffusion — the tools on the shelf, and the real reason the cloud doesn't get my work.
- [The Omarchy install died halfway — blame the SD card, not the hardware](https://homelab.dvaughnhouse.com/posts/omarchy-install-sd-card.html) — An install that failed at 5.8GB with bad package reads — and the real culprit was the install medium, not the RAM.
- ["Can you trun the tilting off" — making Hyprland float like a Mac](https://homelab.dvaughnhouse.com/posts/hyprland-float-like-mac.html) — One Lua line in Omarchy's config that kills tiling and makes every window float, centered, macOS-style.
- [I installed the wrong WiFi driver, then "broke" Ethernet by unplugging it](https://homelab.dvaughnhouse.com/posts/wifi-driver-unplugged-ethernet.html) — The BCM43602 needs brcmfmac, not broadcom-wl. And the Ethernet that vanished? Unplugged by hand.
- [No sound on a 2017 iMac running Linux is a known quirk, not a dead machine](https://homelab.dvaughnhouse.com/posts/imac-sound-cs8409.html) — The Cirrus Logic CS8409 codec isn't driven by stock drivers — diagnose first, then reach for the community fix.
- [Linux has no apps folder — getting Antigravity into the launcher](https://homelab.dvaughnhouse.com/posts/antigravity-launcher-desktop-entry.html) — A hand-extracted tarball creates no .desktop entry. The fix: ~/Apps, a .desktop file, and a Walker restart.
- [wrangler kept disappearing after VM restarts](https://homelab.dvaughnhouse.com/posts/wrangler-disappearing-vm-restart.html) — System-wide npm globals get wiped on VM replacement. Install to ~/workspace/.npm-global and keep it on PATH.
- [The iMac webcam works on Linux](https://homelab.dvaughnhouse.com/posts/imac-webcam-facetimehd.html) — The FaceTime HD camera just needed its firmware — one package, and /dev/video* came alive.

## The Homelab Dispatch

One email a week: the newest builds, one benchmark, one config worth copying. No spam, no fluff. Your address is only used for this newsletter; unsubscribe anytime.

## Related

- [The Dispatch](https://blog.dvaughnhouse.com)
- [Reynard's — the Den](https://den.dvaughnhouse.com)

