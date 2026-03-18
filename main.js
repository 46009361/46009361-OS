let timerId;

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
        clearTimeout(timerId); // Stop when hidden
    } else {
        updateClock(); // Restart when visible
    }
});

function updateClock() {
    const now = new Date();
    
    // 1. Update your UI here
    document.querySelector("#os-time").textContent = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    // 2. Calculate ms until the next minute starts
    const msUntilNextMinute = now.getTime() % 6e4;

    // 3. Schedule the next update (with a tiny 10ms buffer to ensure the minute has actually rolled over)
    timerId = setTimeout(updateClock, msUntilNextMinute + 10);
}

// Initial call to start the clock
updateClock();
let programs;
async function load() {
    programs = await (await fetch("programs.json")).json();
    templateLogic(programs);
}

document.querySelector("#start-btn").addEventListener("click", function() {
    document.querySelector("#wlc-scrn").style.display = "none";
    document.querySelector("#main-os").style.display = "flex";
    load();
});

function templateLogic(programs) {
    for (const [unique_name, program] of Object.entries(programs)) {
        const iconTemplate = document.querySelector("#icon");
        const iconEl = iconTemplate.content.firstElementChild.cloneNode(true);
        iconEl.innerHTML = iconEl.innerHTML.replaceAll(/{{(.+?)}}/g, (match, key) => escapeHTML(program[key]));
        iconEl.name = unique_name;
        iconEl.addEventListener("click", openWin);
        document.querySelector("#main-os").appendChild(iconEl);
    }
}

function escapeHTML(str) {
    const escaped = str.replaceAll("&", "&amp;")
    .replaceAll('"', "&#34;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
    return escaped;
}

function openWin(e) {
    const win = document.querySelector("#window").content;
    const name = e.currentTarget.name;
    const article = win.firstElementChild.cloneNode(true);
    article.innerHTML = article.innerHTML.replaceAll(/{{(.+?)}}/g, (match, key) => escapeHTML(programs[name][key]));
    // Use absolute positioning to keep dragging stable on mobile
    article.style.position = "absolute";
    article.style.top = `${Math.floor(Math.random()*100+1)}px`;
    article.style.left = `${Math.floor(Math.random()*100+1)}px`;
    article.style.transform = "none";
    document.querySelector("#main-os").appendChild(article);
    dragElement(article);
}

function dragElement(elmnt) {
    var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
    if (elmnt.querySelector(".toolbar")) {
        // if present, the header is where you move the DIV from:
        const toolbar = elmnt.querySelector(".toolbar");
        toolbar.onmousedown = dragMouseDown;
        toolbar.ontouchstart = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
        elmnt.ontouchstart = dragMouseDown;
    }

    function getClientPos(e) {
        // Support mouse+touch. Touch events have no clientX/clientY directly.
        const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
        if (touch) {
            return { x: touch.clientX, y: touch.clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        const { x, y } = getClientPos(e);
        pos3 = x;
        pos4 = y;
        document.onmouseup = closeDragElement;
        document.ontouchend = closeDragElement;
        document.ontouchcancel = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
        document.ontouchmove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        const { x, y } = getClientPos(e);
        pos1 = pos3 - x;
        pos2 = pos4 - y;
        pos3 = x;
        pos4 = y;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.ontouchend = null;
        document.ontouchcancel = null;
        document.onmousemove = null;
        document.ontouchmove = null;
    }
}