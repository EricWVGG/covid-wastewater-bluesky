# 💩 covid-wastewater-bluesky 😷

A Bluesky bot that posts state-by-state [COVID-19 wastewater data](https://www.cdc.gov/nwss/rv/COVID19-currentlevels.html) from the US Center for Disease Control.

[@covid-wastewater@bsky.social](https://bsky.app/profile/COVID-wastewater.bsky.social) posts every Friday (shortly after the CDC posts fresh data) and again every Monday.

## FAQ

### What about other nations?

I’d love to spin up versions of this for the rest of the world, but I don’t have time to hunt down the data. If you can point me to data feeds in common formats — JSON, CSV, XML, whatever — please open an issue here.

### Why is tracking poop water useful?

Detection of the virus in wastewater is a reliable indicator of surges of the virus within communities. And it’s based on actual samples of data instead of surveys and gathered “anecdata.” [Learn more here.](https://health.ucdavis.edu/news/headlines/tracking-covid-19-in-2024-wastewater-data-is-key-early-warning-sign-for-surges/2024/08)

### Emoji?

Due to Bluesky character limits, this bot truncates levels as per this key:

- 🔥: Very High
- 🔴: High
- 🟠: Moderate
- 🟡: Low
- 🟢: Minimal
- ❔: No Data

### The CDC site admits that certain states return limited coverage, shouldn’t that factor into…

No. This service is simply a relay, and does no data interpretation beyond the emoji index. If you desire better data, I urge you to write your state legislators.

### Why are replies disabled?

Replies would clutter the feeds of followers. You are of course free to “quote” any post and begin a discussion in your own feed.

## Contact

Message [@covid-wastewater@bsky.social](https://bsky.app/profile/covid-wastewater.bsky.social) or [open an issue here](https://github.com/EricWVGG/covid-wastewater-bluesky/issues) with any other questions.

## Credits

This bot was written by [Eric Jacobsen](https://wvgg.co) [@eric\_@wvgg.co](https://bsky.app/profile/wvgg.co).

This project was inspired and informed by [Waldo Jaquith](https://waldo.jaquith.org/)’s [COVID wastewater levels feed on Mastodon](https://mastodon.social/@covid_wastewater). Thanks, Waldo!
