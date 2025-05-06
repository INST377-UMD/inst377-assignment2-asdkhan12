// js/home.js
// Star Wars quote 
async function loadQuote() {
    try {
      const res = await fetch("https://swquotesapi.digitaljedi.dk/api/SWQuote/");
      const data = await res.json();
      // API returns 
      document.getElementById("quote").textContent  = `"${data.starWarsQuote}"`;
      document.getElementById("author").textContent = `— ${data.character}`;
    } catch (e) {
      console.error("Star Wars quote fetch failed:", e);
      document.getElementById("quote").textContent = "May the Force be with you.";
      document.getElementById("author").textContent = "";
    }
  }
  
  function voiceOn() {
    if (!annyang) return;
    annyang.setLanguage("en-US");
    annyang.debug();
  
    annyang.addCommands({
      "hello":             () => alert("Hello World!"),
      "change color to *c": c => document.body.style.backgroundColor = c,
      "navigate to *p":    p => window.location.href = `${p.toLowerCase()}.html`
    });
  
    annyang.start({ autoRestart: false });
  }
  
  function voiceOff() {
    if (annyang) annyang.abort();
  }
  
  // Star Wars quote on page load
  document.addEventListener("DOMContentLoaded", loadQuote);
  