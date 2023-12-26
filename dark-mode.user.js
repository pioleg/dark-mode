// ==UserScript==
// @name         Dark mode
// @namespace    http://tampermonkey.net/
// @version      1.2.4
// @description  Invert color of the page
// @author       PioLeg
// @match        *://*/*
// @icon         https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.iconsdb.com%2Ficons%2Fdownload%2Fblack%2Fsun-3-128.gif&f=1&nofb=1&ipt=45c4461b37bc7d3ffc99847e3ae5cd80f7c33a39e21fa42ac2becbda6b100d94&ipo=images
// @grant        GM_addStyle
// @run-at       document-start
// @downloadURL  https://github.com/pioleg/dark-mode/raw/master/dark-mode.user.js
// @updateURL    https://github.com/pioleg/dark-mode/raw/master/dark-mode.user.js
// ==/UserScript==



var style;
var css = {
html:`
html {
    filter: invert(100%) hue-rotate(180deg);
}`,
img:`
html img {
    filter: invert(100%) hue-rotate(180deg);
}`,
video:`
video {
    filter: invert(100%) hue-rotate(180deg);
}`,
iframe:`
iframe {
    filter: invert(100%) hue-rotate(180deg);
}`,
wikipedia:`
.mwe-math-element img, span img.mw-file-element {
    filter: none;
}`,
imagus:`
body+div {
    filter: invert(100%) hue-rotate(180deg);
}
body+div * {
    filter: none;
}`
}

// Turn Dark mode on or off
function darkmode(on)
{
    const nodeList = document.querySelectorAll('[style*="background-image"]');
    if(on) {
        if (window.location.hostname.endsWith('wikipedia.org')) {
            style = GM_addStyle(css.html+css.img+css.video+css.iframe+css.wikipedia+css.imagus);
        } else {
           style = GM_addStyle(css.html+css.img+css.video+css.iframe+css.imagus);
        }
        for (let i = 0; i < nodeList.length; i++) {
            nodeList[i].style.filter += "invert(100%) hue-rotate(180deg)";
        }
        console.log(style);
        console.log(nodeList);
    } else {
        style.remove();
        style = null;
        for (let i = 0; i < nodeList.length; i++) {
            nodeList[i].style.filter = nodeList[i].style.filter.replace('invert(100%) hue-rotate(180deg)', '');
        }
    }
}



// Check if dark mode should be enabled
if (localStorage.darkmode) {
    darkmode(1);
}

// Synchronize on tab change
document.addEventListener('visibilitychange', e => {
    if (localStorage.darkmode && !style) {
        darkmode(1);
    }
    if (!localStorage.darkmode && style) {
        darkmode(0);
    }
});

// Toggle when pressing Ctrl+`
document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === '`') {
        if (!localStorage.darkmode) {
            localStorage.darkmode = 1;
            darkmode(1);
        } else {
            delete localStorage.darkmode;
            darkmode(0);
        }
    }
});
