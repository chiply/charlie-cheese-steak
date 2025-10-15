THROTTLE = false;

function throttle(func, limit) {
    let lastFunc;
    let lastRan = 0; // Set lastRan to a default value

    return function (...args) {
        const context = this;
        if (!lastRan) {
            // If the function hasn't run yet
            func.apply(context, args);
            lastRan = Date.now(); // Set lastRan to now
        } else {
            clearTimeout(lastFunc); // Clear the timeout if another call comes in
            lastFunc = setTimeout(
                () => {
                    if (Date.now() - lastRan >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now(); // Update lastRan
                    }
                },
                limit - (Date.now() - lastRan),
            );
        }
    };
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const observerCallbackFootnotes = (entries) => {
    console.log("observed");
    entries.forEach((entry) => {
        // ignore if entry is child of #content-clone
        if (entry.target.closest("#content-clone")) {
            return;
        }
        // Check if target is an outline-text div
        id = entry.target.getAttribute("id");

        const fnLink = document
            .querySelector(`#footnotes sup a[href="#${id}"]`)
            .closest("sup")
            .nextElementSibling.querySelector("p");
        const fnLink1 = document.querySelector(
            `#footnotes sup a[href="#${id}"]`,
        );
        if (fnLink) {
            const action = entry.intersectionRatio > 0 ? "add" : "remove";
            fnLink.classList[action]("active");
            fnLink1.classList[action]("active");

            // Scroll active link into view
            if (entry.intersectionRatio > 0) {
                fnLink.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
    });
};

// Followable, scrollable footnotes
window.addEventListener(
    "DOMContentLoaded",
    () => {
        const observer = new IntersectionObserver(
            THROTTLE
                ? throttle(observerCallbackFootnotes, 100)
                : observerCallbackFootnotes,
        );

        // Collect all headings and outline divs
        const headings = [...document.querySelectorAll("sup a.footref")];

        headings.forEach((heading) => observer.observe(heading));
    },
    { passive: true },
);

// Clickable Footnotes
document.addEventListener("DOMContentLoaded", function () {
    const tocLinks = document.querySelectorAll("#footnotes a[href^='#']");

    tocLinks.forEach((link) => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            targetId = this.getAttribute("href").substring(1);
            targetId = CSS.escape(targetId);
            const elements = document.querySelectorAll(`#${targetId}`);
            const targetElement = Array.from(elements).filter(
                (el) => !el.closest("#content-clone"),
            )[0];
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
    });
});
