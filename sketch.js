let finalBtnBounds = null;
let finalBtnPressed = false;
let isSubmitting = false;
let textarea;
let lastPressAt = 0;
let progressAnim = 0;
let canvas;
let state = "intro"; // can be "intro", "survey", "thanks", "final"

const questions = [
  { text: "What is your Gmail account?", type: "text", optional: false},
  { text: "What's your gender?", type: "choice", optionBox: { wRatio: 0.9, hRatio: 0.1, textScale: 0.6, spacingRatio: 0.07 }, options: [{label:"Female"},{label:"Male"},{ label:"Others"}] },
  { text: "How old are you?", type: "choice", optionBox: { wRatio: 0.9, hRatio: 0.1, textScale: 0.6, spacingRatio: 0.07 }, options: [{label:"18-25"},{label:"26-30"},{label: "30-35"}] },
  { text: "What version of love resonates with you the most?", type: "choice", optionBox: { wRatio: 0.9, hRatio: 0.1, textScale: 0.6, spacingRatio: 0.07 }, options: [{label:"Love is peace"}, {label:"Love is growth"},{label:"Love is sacrifice"}] },
  { text: "Are relationships necessarily about building a world together or simply living in each others worlds?:", type: "choice", optionBox: { wRatio: 1, hRatio: 0.08, textScale: 0.35, spacingRatio: 0.02 }, options: [{label:"Living in each other's world"},{label: "Building a world together"},{label:"About 70% building a world together 30% living in each others world"},{label:"50% building a world together 50% living in each others world"},{label:"About 70%  living in each others world 30% building a world together "}] },
  { text: "How do you express love, and when do you feel most connected with another person?", type:"text", optional:false},
  { text: "Is ambition without results still consider ambition?", type: "choice", optionBox: { wRatio: 0.7, hRatio: 0.1, textScale: 0.6, spacingRatio: 0.07 }, options: [{label:"Yes"}, {label:"No"}] },
  { text: "Can your partner have friends of the opposite gender?", type: "choice", optionBox: { wRatio: 0.9, hRatio: 0.09, textScale: 0.4, spacingRatio: 0.03 }, options: [{label:"Yes- I would trust them"}, {label:"No- I don't trust other people(the friends)"},{label:"I'm in the middle,so I would surrended to uncertainity "},{label:"Yes,but with strict boundries"}] },
  { text: "Which would hurt the most?", type: "choice", optionBox: { wRatio: 0.9, hRatio: 0.18, textScale: 0.5, spacingRatio: 0.07 }, options: [ {label:"A partner that cheats on you"},{label:" Being with a partner that doesn't love you for who you are"}] },
  { text: "What are the top three qualities you find most attractive in a partner?", type:"text", optional:false},
  { text: "What shapes your understanding of love the most?", type: "choice", optionBox: { wRatio: 0.7, hRatio: 0.08, textScale: 0.5, spacingRatio: 0.05 }, options: [ {label:"Movies and TV shows"},{label:"Books,literature and psychology"},{label:"Personal experiences"},{label:"Other people's experiences"}] },
  { text: "You seem like a really interesting person and we would love to read your insights/thoughts/ advice on love and your take on the opposite gender", type: "text", optional: true}
];

const answers = [];
let optionBoxes = [];

let selected = -1; // Which option did the user pick (-1 = none)
let submitEnabled = false;
let input;
let currentQ = 0;
let customFont1, customFont2;
let btnx, btny, btnw, btnh, btnr, btnlabel;
let baseSize, optW, gap, btnH, pad, optH;
let layout = {};
let submitY, submitX, submitr;
let spriteSheet,spriteSheet1,spriteSheet2;
let totalCols = 8; // columns
let totalRows = 7; // rows
let currentFrame = 0;
let frameWidth, frameHeight;
let boxW, boxH, baseGap, txtSize;
let totalColsClap = 6, totalRowsClap = 4;
let frameClap = 0, frameWidthClap, frameHeightClap;
let totalColsCute = 8, totalRowsCute = 4;
let frameCute = 0, frameWidthCute, frameHeightCute;

function preload() {
  // keep your font and sprite names
  customFont1 = loadFont("Quicksand-SemiBold.ttf");
  customFont2 = loadFont("Quicksand-Medium.ttf");
  spriteSheet = loadImage("wavee.png");
  spriteSheet1 = loadImage("clapp.png");
  spriteSheet2 = loadImage("cutee.png");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  rectMode(CORNER);
  textFont(customFont1);

  // sprite frame dims (avoid errors if sprite missing)
  if (spriteSheet) {
    frameWidth = spriteSheet.width / totalCols;
    frameHeight = spriteSheet.height / totalRows;
  }
  if (spriteSheet1) {
    frameWidthClap = spriteSheet1.width / totalColsClap;
    frameHeightClap = spriteSheet1.height / totalRowsClap;}
  if (spriteSheet2) {
    frameWidthCute = spriteSheet2.width / totalColsCute;
      frameHeightCute = spriteSheet2.height / totalRowsCute;}else {
    frameWidth = 64;
    frameHeight = 64;
  }

  recalcLayout();

  // create DOM elements
  textarea = createElement('textarea');
  styleTextarea();
  positionTextarea();
  textarea.hide();

  input = createInput();
  styleInput();
  input.hide();

  // prevent DOM elements from letting clicks bubble to canvas
  if (input.elt) {
    ["mousedown","touchstart","click"].forEach(ev => input.elt.addEventListener(ev, e => e.stopPropagation()));
  }
  if (textarea.elt) {
    ["mousedown","touchstart","click"].forEach(ev => textarea.elt.addEventListener(ev, e => e.stopPropagation()));
  }

  // prevent default scrolling on canvas for touch
  canvas.elt.addEventListener("touchstart", (e) => {
    if (e.target === canvas.elt) e.preventDefault();
  }, { passive: false });

  frameRate(25);
  btnlabel = "Start";
  calcResponsiveSizes();
  computeLayout();
   window.addEventListener("resize", () => {
    resizeCanvas(windowWidth, windowHeight);
    calcResponsiveSizes();
    computeLayout();
    recalcLayout();
    positionTextarea();
    if (state === "survey" && currentQ === 0) {
      input.position(width/2 - (windowWidth*0.7)/2, height*0.35);
    }
  });
}

function draw() {
  background("#FFFFFF");

  if (state === "intro") {
    drawIntro();
  } else if (state === "survey") {
    drawSurvey();
  } else if (state === "thanks") {
    drawThanks();
     if (spriteSheet1) aniclapp();
  } else if (state === "final") {
    drawFinal();
     if (spriteSheet2) anicute();
  }
  if (spriteSheet && state === "intro") {
    aniwave();
  }
}

/* ---------- UI & Drawing ---------- */

function drawIntro() {
  calcResponsiveSizes();
  // center intro text and start button
  textFont(customFont1);
  textSize(baseSize * 0.9);
  fill("#4285F4");
  textAlign(CENTER, CENTER);
  text("Hi! let's explore your insights on love", width / 2, height *0.6);

  // draw start button
  drawDuolingoButton(btnx, btny, btnw, btnh, btnr, btnlabel);
}

function aniwave(){
  let col = currentFrame % totalCols;
  let row = floor(currentFrame / totalCols);
  
  // Scale sprite to fit nicely (responsive)
  let scaleFactor = min(width / frameWidth, height / frameHeight) * 0.5; 
  let displayW = frameWidth * scaleFactor;
  let displayH = frameHeight * scaleFactor;
  
  // Draw frame in center
  image(
    spriteSheet,
    width / 2 - displayW / 2, height / 2 - displayH / 2-60, // center position
    displayW, displayH,                                  // draw size (scaled)
    col * frameWidth, row * frameHeight,                 // source x,y
    frameWidth, frameHeight                              // source w,h
  );
  
  // Move to next frame
  currentFrame = (currentFrame + 1) % (totalCols * totalRows);
}

function aniclapp(){
  let col = frameClap % totalColsClap;
  let row = floor(frameClap / totalColsClap);
  let scaleFactor = min(width / frameWidthClap, height / frameHeightClap) * 0.5;
  let displayW = frameWidthClap * scaleFactor;
  let displayH = frameHeightClap * scaleFactor;

  image(
    spriteSheet1,
    width / 2 - displayW / 2, height / 2 - displayH / 2 - 60,
    displayW, displayH,
    col * frameWidthClap, row * frameHeightClap,
    frameWidthClap, frameHeightClap
  );

  frameClap = (frameClap + 1) % (totalColsClap * totalRowsClap);
  frameRate(20);
}

function anicute(){
  let col = frameCute % totalColsCute;
  let row = floor(frameCute / totalColsCute);
  let scaleFactor = min(width / frameWidthCute, height / frameHeightCute) * 0.5;
  let displayW = frameWidthCute * scaleFactor;
  let displayH = frameHeightCute * scaleFactor;

  image(
    spriteSheet2,
    width / 2 - displayW / 2, height / 2 - displayH / 2 - 60,
    displayW, displayH,
    col * frameWidthCute, row * frameHeightCute,
    frameWidthCute, frameHeightCute
  );

  frameCute = (frameCute + 1) % (totalColsCute * totalRowsCute);
}

function drawDuolingoButton(x, y, w, h, r, label) {
  rectMode(CORNER);
  noStroke();
  fill("#2B70c9");
  rect(x, y + 4, w, h, r);
  fill("#1DA3E8");
  rect(x, y, w, h, r);
  fill(255);
  textSize(baseSize * 0.66);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
}

/* ---------- Text wrapping helpers ---------- */

function drawWrappedText(txt, x, y, maxWidth, ts, align = CENTER) {
  textSize(ts);
  textAlign(align, TOP);
  

  let words = txt.split(" ");
  let line = "";
  let lines = [];

  for (let word of words) {
    const test = (line === "" ? word : line + " " + word);
    if (textWidth(test) < maxWidth) {
      line = test;
    } else {
      if (line !== "") lines.push(line);
      line = word;
    }
  }
  if (line !== "") lines.push(line);

  let lineHeight = ts * 1.4;
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], x, y + i * lineHeight);
  }

  return lines.length * lineHeight; // height used
}

function drawQuestionText(qtext, x, y, maxWidth) {
  fill(30);
  let ts = baseSize * 0.8;
  textFont(customFont1);

  while (textWidth(qtext) > maxWidth && ts > 14) {
    ts -= 2;
    textSize(ts);
  }

  drawWrappedText(qtext, x, y, maxWidth, ts, CENTER);
}

/* ---------- Options rendering ---------- */

function drawOptions(q) {
  optionBoxes = [];
  let startY = height * 0.35;

  // compute sizes from question optionBox ratios
  let optionW = q.optionBox?.wRatio ? width * q.optionBox.wRatio : width * 0.7;
  let optionH = q.optionBox?.hRatio ? height * q.optionBox.hRatio : height * 0.08;
  let optionTextSize = q.optionBox?.textScale ? baseSize * q.optionBox.textScale : baseSize * 0.6;
  let spacing = q.optionBox?.spacingRatio ? height * q.optionBox.spacingRatio : height * 0.03;

  for (let i = 0; i < q.options.length; i++) {
    let x = width / 2 - optionW / 2;
    let y = startY + i * (optionH + spacing);

    optionBoxes.push({ x, y, w: optionW, h: optionH });
    drawOptionBox(x, y, optionW, optionH, q.options[i].label, i, optionTextSize);
  }
}

function drawOptionBox(x, y, w, h, txt, index, ts) {
  // shadow
  noStroke();
  fill(selected === index ? "#9ED3F2" : "#E5E7EB");
  rect(x, y + 3, w, h, 8);

  // main
  fill(selected === index ? "#E1F3FD" : "#ffffff");
  rect(x, y, w, h, 8);

  // border
  strokeWeight(2);
  stroke(selected === index ? "#9ED3F2" : "#E5E7EB");
  noFill();
  rect(x, y, w, h, 8);

  // text (center block vertically)
  noStroke();
  fill(selected === index ? "#4FADE2" : "#111111");
  textFont(customFont1);

  // measure wrapped block height and vertically center
  let maxW = w * 0.9;
  let dummyY = 0;
  let linesH = measureWrappedHeight(txt, maxW, ts);
  let topY = y + (h - linesH) / 2;
  drawWrappedText(txt, x + w / 2, topY, maxW, ts, CENTER);
}

function measureWrappedHeight(txt, maxWidth, ts) {
  textSize(ts);
  let words = txt.split(" ");
  let line = "";
  let lines = [];
  for (let word of words) {
    const test = (line === "" ? word : line + " " + word);
    if (textWidth(test) < maxWidth) {
      line = test;
    } else {
      if (line !== "") lines.push(line);
      line = word;
    }
  }
  if (line !== "") lines.push(line);
  return lines.length * ts * 1.4;
}

/* ---------- Survey flow ---------- */

function drawSurvey() {
  if (currentQ < questions.length) {
    let q = questions[currentQ];
    computeLayout();

    drawProgressBar();
    drawQuestion(q);

    if (q.type === "choice") {
      drawOptions(q);
      submitEnabled = (selected !== -1);
    } else if (q.type === "text") {
      if (currentQ === 0) {
        submitEnabled = q.optional || input.value().trim().length > 0;
      } else {
        submitEnabled = q.optional || textarea.value().trim().length > 0;
      }
    } else {
      submitEnabled = false;
    }

    drawSubmitButton();
  } else {
    state = "thanks";
  }
}

function drawQuestion(q) {
  drawQuestionText(q.text, width / 2, height * 0.15, width * 0.8);

  if (state === "survey" && q.type === "text") {
    let placeholderText = q.optional ? "Write your mind or heart ✨ (Optional)" : "Please type your answer...";

    if (currentQ === 0) {
      // Gmail input field
      input.show();
      input.position(width/2 - (windowWidth*0.7)/2, height*0.35);
      input.size(windowWidth * 0.7, 40);
      input.attribute("placeholder", "Enter Gmail or type 'skip'");
      input.attribute("type", "email");
      textarea.hide();
    } else {
      textarea.show();
      styleTextarea();
      positionTextarea();
      textarea.attribute("placeholder", placeholderText);
      input.hide();
    }
  } else {
    // hide text fields for non-text questions
    input.hide();
    textarea.hide();
  }
}

function drawSubmitButton() {
  submitX = width / 2 - (btnw * 2.5) / 2;
  submitY = height * 0.85;
  submitr = btnr - 6;

  if (submitEnabled) {
    drawDuolingoButton(submitX, submitY, btnw * 2.5, btnh, submitr, "Submit");
  } else {
    rectMode(CORNER);
    fill("#E1E1E1");
    noStroke();
    rect(submitX, submitY, btnw * 2.5, btnh, submitr);
    fill("#4B4B4B");
    textSize(baseSize * 0.66);
    textAlign(CENTER, CENTER);
    text("Submit", submitX + (btnw * 2.5) / 2, submitY + btnh / 2);
  }
 
}

/* ---------- Progress bar ---------- */

function drawProgressBar() {
  let total = questions.length;
  let barX = width / 2;
  let barY = max(height * 0.05, 40);
  let barWidth = width * 0.7;
  let barHeight = Math.max(14, Math.floor(baseSize * 0.8));
  let targetProgress = (currentQ + 1) / total;
  progressAnim = lerp(progressAnim, targetProgress, 0.12);

  rectMode(CENTER);
  noStroke();
  fill("#E1E1E1");
  rect(barX, barY, barWidth, barHeight, barHeight / 2);

  let filledWidth = barWidth * progressAnim;
  fill("#1DA3E8");
  rectMode(CORNER);
  rect(barX - barWidth / 2, barY - barHeight / 2, filledWidth, barHeight, barHeight / 2);

  if (filledWidth > 0) {
    let highlightHeight = barHeight * 0.3;
    let highlightY = barY - barHeight / 2 + 7;
    fill("#66C8E5");
    rect(barX - barWidth / 2 + 20, highlightY, max(0, filledWidth - 30), highlightHeight, highlightHeight / 2);
  }
}

/* ---------- Layout helpers ---------- */

function computeLayout() {
  const s = Math.min(windowWidth, windowHeight);
  baseSize2 = constrain(Math.floor(s / 28), 14, 24);
  gap = Math.max(10, Math.floor(s / 60));
  pad = Math.max(16, Math.floor(s / 40));
  btnH = Math.max(52, Math.floor(s / 12));

  optH = height * 0.08; // define first
  optW = Math.max(140, Math.floor(optH * 2.7));
  layout = { baseSize2, optW, gap, btnH, optH };
}

function calcResponsiveSizes() {
  let unit = Math.min(windowWidth, windowHeight);
  baseSize = unit * 0.06;
  btnw = unit * 0.35;
  btnh = unit * 0.12;
  btnx = width / 2 - btnw / 2;
  if (window.matchMedia("(max-width: 600px)").matches) {
    btny = height - btnh - unit * 0.1; 
  } else {
    btny = height - btnh - unit * 0.05; 
  }
  btnr = unit * 0.05;
}

function recalcLayout() {
  boxW = width * 0.8;
  boxH = height * 0.08;
  baseGap = height * 0.03;
  txtSize = height * 0.025;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calcResponsiveSizes();
  computeLayout();
  recalcLayout();
  positionTextarea();

  // special case: Gmail input box on Q0
  if (state === "survey" && currentQ === 0) {
    input.position(width/2 - (windowWidth * 0.7) / 2, height * 0.35);
  }
}


/* ---------- Input & textarea styling ---------- */

function positionTextarea() {
  let w = windowWidth * 0.7;
  let h = windowHeight * 0.25;
  let x = (windowWidth - w) / 2;
  let y = windowHeight * 0.3;
  textarea.size(w, h);
  textarea.position(x, y);
}

function styleTextarea() {
  textarea.style("background-color", "#F9FAFB");
  textarea.style("color", "#111827");
  textarea.style("border", "2px solid #1DA3E8");
  textarea.style("border-radius", "12px");
  textarea.style("padding", "10px");
  textarea.style("font-size", "16px");
  textarea.style("font-family", "Quicksand, sans-serif");
  textarea.style("resize", "none");
  textarea.style("outline", "none");
  textarea.style("box-shadow", "0px 2px 6px rgba(0,0,0,0.1)");
  textarea.style("position", "absolute");
}

function styleInput() {
  input.style("background-color", "#ffffff");
  input.style("color", "#1E1E1E");
  input.style("border", "none");
  input.style("font-size", "18px");
  input.style("border-radius", "10px");
  input.style("padding", "8px");
  input.style("outline", "none");
  input.style("outline-color", "#D7D7D7");
  input.style("outline-style", "solid");
  input.style("outline-width", "3px");
  input.style("font-family", "Quicksand, sans serif");
  input.style("position", "absolute");
}

/* ---------- Interaction ---------- */

function mousePressed() {
  handlePress(mouseX, mouseY);
}

function touchStarted() {
  let tx = mouseX;
  let ty = mouseY;
  
  // if real touches exist, use them
  if (touches.length > 0) {
    tx = touches[0].x;
    ty = touches[0].y;
  } handlePress(tx, ty);
  return false; // prevent scroll
}


function handlePress(px, py) {
  if (!px || !py) return;

  if (state === "intro" && isInsideButton(btnx, btny, btnw, btnh, px, py)) {
    state = "survey";
    return;
  }

  if (state === "survey") {
    for (let i = 0; i < optionBoxes.length; i++) {
      let box = optionBoxes[i];
      if (px > box.x && px < box.x + box.w && py > box.y && py < box.y + box.h) {
        selected = i;
        return;
      }
    }
    if (submitEnabled && isInsideButton(submitX, submitY, btnw * 2.5, btnh, px, py)) {
      submitCurrentQuestion();
      return;
    }
  }

  if (state === "thanks" && finalBtnBounds) {
    if (isInsideButton(finalBtnBounds.x, finalBtnBounds.y, finalBtnBounds.w, finalBtnBounds.h, px, py)) {
      finalBtnPressed = true; // Pressed down
      return;
    }
  }
  if (state === "final") {
  if (isInsideButton(btnx, btny, btnw, btnh,px, py)) {
    handleShare();
  }
}
}

function handleShare() {
  const shareData = {
    title: "Blue will listen",
    text: "I just shared my thoughts with Blue 💙. Join and help us reach 1k responses!",
    url: "https://rannks.github.io/Love-survey/" // <-- replace with your hosted site
  };

  if (navigator.share) {
    // ✅ Use native share on mobile
    navigator.share(shareData)
      .then(() => console.log("Shared successfully"))
      .catch(err => console.error("Share failed:", err));
  } else {
    // ❌ Fallback for desktop
    navigator.clipboard.writeText(shareData.url).then(() => {
      alert("Link copied! Share it with your friends ✨");
    });
  }
}


// Reset press on release
function mouseReleased() {
  if (finalBtnPressed && state === "thanks") {
    state = "final";
    finalBtnPressed = false;
  }
}

function touchEnded() {
  if (finalBtnPressed && state === "thanks") {
    state = "final";
    finalBtnPressed = false;
  }
}


function isInsideButton(x, y, w, h, px, py) {
  return px > x && px < x + w && py > y && py < y + h;
}


function drawThanks() {
  background("#FFFFFF");
  textAlign(CENTER, CENTER);
  textSize(baseSize * 0.8);
  fill("#4285F4");
  text("Great job! We appreciate your thoughts", width/2, height*0.6);
   finalBtnBounds = drawFinalButton(btnx, btny, btnw, btnh, "Final step");
  
}

function drawFinal() {
  background("#FFFFFF");
  textAlign(CENTER, CENTER);
  textSize(baseSize * 0.9);
  fill("#4285F4");
  text("Help us reach 1k responses", width/2, height*0.6);
    rectMode(CORNER);
  noStroke();
  fill("#379201");
  rect(btnx, btny + 4, btnw, btnh, btnr);
  fill("#58CC02");
  rect(btnx, btny, btnw, btnh, btnr);
  fill(255);
  textSize(baseSize * 0.7);
  textAlign(CENTER, CENTER);
  text("Share", btnx + btnw / 2, btny + btnh / 2);
}


/* ---------- Interaction fixes ---------- */

function submitCurrentQuestion() {
  let q = questions[currentQ];

  if (q.type === "choice") {
    if (selected >= 0 && q.options[selected]) {
      // store the label string (easier for Airtable & display)
      answers[currentQ] = q.options[selected].label;
    } else {
      answers[currentQ] = "";
    }
    selected = -1;
  } else if (q.type === "text") {
    if (currentQ === 0) {
      answers[currentQ] = input.value().trim();
      input.value("");
    } else {
      answers[currentQ] = textarea.value().trim();
      textarea.value("");
    }
  }

  // Go to next question
  currentQ++;
  if (currentQ >= questions.length) {
    // survey finished
    input.hide();
    textarea.hide();
    state = "thanks";
    submitSurvey();   // <-- send all answers at once
  } else {
    input.hide();
    textarea.hide();
  }
}

/* ---------- Survey -> backend ---------- */

async function submitSurvey() {
  // Prevent accidental double-submits (rapid taps etc.)
  if (isSubmitting) return;
  isSubmitting = true;

  // Map each answer index to the EXACT Airtable field name.
  // Edit the right-hand strings to match your Airtable headers 1:1.
  const FIELD_MAP = {
    0: "Gmail",
    1: "Gender",
    2: "Age",
    3: "Version of love",                 // <-- make sure this matches Airtable
    4: "Relationships",                   // or "Relationships (worlds)" if that's your header
    5: "Expressions",
    6: "Ambition",
    7: "OppositeGender",                  // if Airtable has "Opposite gender", use that exact text
    8: "Hurt the most",
    9: "Three qualities",
    10: "Shape of understanding",
    11: "Optional note"
  };

  // Build the record using the mapping above
  const record = {};
  for (let i = 0; i <= 11; i++) {
    const fieldName = FIELD_MAP[i];
    if (fieldName) record[fieldName] = answers[i] || "";
  }

  console.log("Submitting record to Airtable:", record);

  try {
    const res = await fetch("https://red-union-89f5.aishasalawu7.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });

    if (!res.ok) {
      console.error("Worker responded with non-OK:", res.status, await res.text());
      alert("There was an error submitting your response. Please try again.");
    } else {
      const data = await res.json().catch(() => ({}));
      console.log("Saved via worker:", data);
    }
  } catch (err) {
    console.error("Error sending to worker/Airtable:", err);
    alert("Failed to send data. Check console for details.");
  } finally {
    isSubmitting = false; // allow future submits only after this finishes
  }
}

function drawFinalButton(x, y, w, h, label) {
  let radius = 20;

  // Press effect: move shadow & button slightly
  let offsetY = finalBtnPressed ? 2 : 4;
  let btnY = finalBtnPressed ? y + 2 : y;

  // Shadow
  noStroke();
  fill(0, 50);
  rect(x, btnY + offsetY, w, h, radius);

  // Base
  fill('#FACB49');
  rect(x, btnY, w, h, radius);

  // Clip stripes
  push();
  drawingContext.save();
  rect(x, btnY, w, h, radius);
  drawingContext.clip();

  translate(x, btnY);
  fill('#F8D64E');
  noStroke();
  let stripeWidth = 80;
  let slant = 70;
  for (let i = -w; i < w * 2; i += stripeWidth * 2) {
    quad(i, 0,
         i + stripeWidth, 0,
         i + stripeWidth - slant, h,
         i - slant, h);
  }
  drawingContext.restore();
  pop();

  // Text
  fill('#5B3622');
  textAlign(CENTER, CENTER);
  textSize(20);
  textStyle(BOLD);
  text(label, x + w / 2, btnY + h / 2);

  return { x, y: btnY, w, h };
}

