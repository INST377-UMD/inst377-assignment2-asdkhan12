// js/stocks.js
document.addEventListener("DOMContentLoaded", init);

function init() {
  const POLY_KEY  = "ZsdMeFvaWp3_F10VWI_OO7GlRn2yqCmj";
  const lookupBtn = document.getElementById("lookup");
  const tickerIn  = document.getElementById("ticker");
  const rangeIn   = document.getElementById("range");
  const ctx       = document.getElementById("chart").getContext("2d");
  let chart;

  // Manual lookup
  lookupBtn.addEventListener("click", async () => {
    const sym  = tickerIn.value.trim().toUpperCase();
    const days = Number(rangeIn.value);
    const to   = new Date().toISOString().slice(0,10);
    const from = new Date(Date.now() - days*864e5).toISOString().slice(0,10);

    try {
      const res  = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${sym}/range/1/day/${from}/${to}?apiKey=${POLY_KEY}`
      );
      const data = await res.json();
      if (!data.results) return console.warn("No data for", sym);

      const labels = data.results.map(r => new Date(r.t).toLocaleDateString());
      const values = data.results.map(r => r.c);

      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{ label: "Close", data: values, fill: false, tension: 0.1 }]
        }
      });
    } catch (err) {
      console.error("Lookup error:", err);
    }
  });

  // Load Top 5 Reddit Stocks
  loadReddit();

  async function loadReddit() {
    const targetURL = "https://tradestie.com/api/v1/apps/reddit?date=2022-04-03";
    const proxyURL  = "https://api.allorigins.win/get?url=" + encodeURIComponent(targetURL);

    try {
      const wrapper = await fetch(proxyURL).then(r => r.json());
      const arr     = JSON.parse(wrapper.contents);
      const top5    = arr.slice(0, 5);

      const tbody = document.querySelector("#reddit tbody");
      tbody.innerHTML = "";

      top5.forEach(item => {
        const icon = item.sentiment === "Bullish" ? "🐂" : "🐻";
        const tr   = document.createElement("tr");
        tr.innerHTML = `
          <td>
            <a href="https://finance.yahoo.com/quote/${item.ticker}" target="_blank">
              ${item.ticker}
            </a>
          </td>
          <td>${item.no_of_comments}</td>
          <td>${icon}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error("Failed to load Reddit stocks:", err);
    }
  }

  // Voice
  window.startVoice = () => {
    if (!window.annyang) return console.warn("Voice not available");
    annyang.setLanguage("en-US");
    annyang.debug();
    annyang.addCallback("start",  () => console.log("Voice ON"));
    annyang.addCallback("result", p  => console.log("Heard:", p));
    annyang.addCallback("error",  e  => console.error("Voice error", e));

    annyang.addCommands({
      "navigate to *page": p => {
        const key    = p.toLowerCase().trim();
        const target = key.includes("dog")   ? "dogs"
                     : key.includes("stock") ? "stocks"
                     : key.includes("home")  ? "index"
                     : key;
        window.location.href = `${target}.html`;
      },
      "change color to *c": c => document.body.style.backgroundColor = c,
      "hello":              () => alert("Hello")
    });

    annyang.addCommands({
      "lookup *s":    handleLookup,
      "look up *s":   handleLookup,
      "get *s":       handleLookup,
      "show *s":      handleLookup
    });

    function handleLookup(s) {
      tickerIn.value = s.trim().toUpperCase();
      rangeIn.value  = "30";
      lookupBtn.click();
    }

    annyang.start({ autoRestart: true, continuous: true });
  };

  window.stopVoice = () => {
    if (window.annyang) {
      annyang.abort();
      console.log("Voice OFF");
    }
  };
}
