// js/dogs.js
document.addEventListener("DOMContentLoaded", () => {
  const DOG_KEY = "live_dfZfMUpFb5nK9omNDMedSovYPm1A2OZx0ARSdGVmwrj0eu3Y7SRfZlypxzffuO2W";
  const slider = document.getElementById("dogSlider");
  const btns   = document.getElementById("breedButtons");
  const info   = document.getElementById("breedInfo");
  const imgEl  = document.getElementById("breedImage");
  const nameEl = document.getElementById("breedName");
  const descEl = document.getElementById("breedDescription");
  const minEl  = document.getElementById("minLife");
  const maxEl  = document.getElementById("maxLife");
  let randomBreeds = [];

  // Carousel
  fetch("https://dog.ceo/api/breeds/image/random/10")
    .then(r => r.json())
    .then(d => {
      const wrap = document.createElement("div");
      wrap.style.display   = "flex";
      wrap.style.gap       = "1rem";
      wrap.style.overflowX = "auto";
      d.message.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Random Dog";
        img.style.width = "200px";
        wrap.append(img);
      });
      slider.append(wrap);
    });

  // Load 10 random breeds
  fetch("https://api.thedogapi.com/v1/breeds", {
    headers: { "x-api-key": DOG_KEY }
  })
    .then(r => r.json())
    .then(all => {
      randomBreeds = all.sort(() => 0.5 - Math.random()).slice(0, 10);
      randomBreeds.forEach(b => {
        const btn = document.createElement("button");
        btn.textContent = b.name;
        btn.classList.add("breed-btn");
        btn.onclick = () => show(b);
        btns.append(btn);
      });
    });

  function show(b) {
    const nums = (b.life_span.match(/\d+/g) || []);
    imgEl.src          = b.image.url;
    imgEl.alt          = b.name;
    nameEl.textContent = b.name;
    descEl.textContent = b.temperament;
    minEl.textContent  = nums[0] || "N/A";
    maxEl.textContent  = nums[1] || "N/A";
    info.classList.remove("hidden");
  }

  window.startVoiceDogs = () => {
    if (!annyang) return;
    annyang.setLanguage("en-US");
    annyang.debug();
    annyang.addCallback("start", () => console.log("Dogs voice ON"));
    annyang.addCallback("result", phrases => console.log("Heard:", phrases));
    annyang.addCallback("error", e => console.error(e));
    annyang.addCommands({
      "navigate to *page": p => {
        const key = p.toLowerCase().trim();
        const target = key.includes("dog")   ? "dogs"
                     : key.includes("stock") ? "stocks"
                     : key.includes("home")  ? "index"
                     : key;
        window.location.href = `${target}.html`;
      },
      "change color to *c": c => document.body.style.backgroundColor = c,
      "hello": () => alert("Hello!"),
      "load dog breed *n": n => {
        const want = n.toLowerCase().trim();
        const m = randomBreeds.find(b => b.name.toLowerCase().includes(want));
        if (m) show(m);
      }
    });
    annyang.start({ autoRestart: true, continuous: true });
  };

  window.stopVoice = () => {
    if (annyang) annyang.abort();
  };
});
