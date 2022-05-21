window.scroll(() => {
    document.querySelector("#TableOfContents a").classList.remove("current");
    
})

function currentAnchor() {
    const Y = window.scrollY;
    let curAnchor;

    [...document.querySelectorAll("#TableOfContents a")].map((el) => {
        el.getAttribute("href")
    })
}