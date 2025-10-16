isMobile = window.matchMedia("(min-width: 1000px)").matches;

if (isMobile) {
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

    const observerCallbackMinimap = (entries) => {
        entries.forEach((entry) => {
            // if entry is a child of #minimap ignore it
            if (entry.target.closest("#outline-container-tldr")) {
                return;
            }
            // if entry is a child of #minimap ignore it
            if (entry.target.closest("#minimap-container")) {
                return;
            }
            let id = "";
            // Check if target is an outline-text div
            id = entry.target.getAttribute("id");

            id = CSS.escape(id);
            const elementLink = document.querySelector(`#${id}`);
            if (elementLink) {
                if (entry.intersectionRatio > 0) {
                    elementLink.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }
        });
    };

    // minimap
    function minimap_update(called) {
        // Parameters
        const minimapWidth = document.body.clientWidth * 0.1;
        const scale =
            minimapWidth / document.querySelector("#content").scrollWidth;

        // Setup the minimap
        const minimap = document.getElementById("minimap");
        let minimapContent = document.createElement("div");
        minimapContent.id = "minimap-content";
        minimap.appendChild(minimapContent);

        // Clone body content (shallow, not perfect for all apps)
        function cloneBodyContent() {
            const clone = document.querySelector(`#content`).cloneNode(true);
            // change id of the clone node to content-clone
            clone.id = "content-clone";
            // Remove the table of contents from the clone
            const toc = clone.querySelector("#table-of-contents");
            if (toc) toc.remove();
            // Remove the footnotes from the clone
            const fn = clone.querySelector("#footnotes");
            if (fn) fn.remove();
            // Remove the copilot summary from the clone
            const tldr = clone.querySelector("#text-tldr");
            if (tldr) tldr.remove();
            // set the margins of the clone to 0
            clone.style.margin = "0";
            // Remove the minimap itself from the clone
            const mmc = clone.querySelector("#minimap-container");
            if (mmc) mmc.remove();
            minimapContent.innerHTML = "";
            minimapContent.appendChild(clone);
            minimapContent.style.transform = `scale(${scale})`;
            minimapContent.style.width = document.body.scrollWidth + "px";
            minimapContent.style.height = document.body.scrollHeight + "px";
        }

        // Viewport rectangle
        const viewport = document.getElementById("minimap-viewport");

        function updateViewport() {
            const bodyScale =
                (document.body.clientWidth * 0.1) / document.body.scrollWidth;
            const scrollTop = window.scrollY;
            const scrollLeft = window.scrollX;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            viewport.style.top = scrollTop * bodyScale + "px";
            viewport.style.left = scrollLeft * bodyScale + "px";
            viewport.style.width = viewportWidth * bodyScale + "px";
            viewport.style.height = viewportHeight * bodyScale + "px";
        }
        window.addEventListener("scroll", updateViewport);

        // Style fired up on window resize (and periodically for dynamic content)
        function updateContentScale() {
            const realScale =
                (document.body.clientWidth * 0.1) / document.body.scrollWidth;
            minimapContent.style.transform = `scale(${realScale})`;
            minimapContent.style.width = document.body.scrollWidth + "px";
            minimapContent.style.height = document.body.scrollHeight + "px";
            updateViewport();
        }

        addEventListener("resize", updateContentScale);

        cloneBodyContent();
        updateContentScale();

        // Clicking on minimap scrolls page
        minimap.addEventListener("click", function (e) {
            const minimapWidth = document.body.clientWidth * 0.1; // 20% of body width
            const scale = minimapWidth / document.body.clientWidth;

            const minimap = document.getElementById("minimap");
            const rect = minimap.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const scrollX = x / scale;
            const scrollY = y / scale;

            window.scrollTo({
                top: scrollY - window.innerHeight / 2,
                left: scrollX - window.innerWidth / 2,
                behavior: "smooth",
                block: "nearest",
            });
        });

        //// Make unobtrusive
        //minimapContainer = document.getElementById("minimap-container");
    }

    document.addEventListener("DOMContentLoaded", function () {
        // Example: access and manipulate an HTML element
        minimap_update(false);
    });

    // includes window resizing as well as text scale increase and
    // decrease
    window.addEventListener("resize", function () {
        // Example: access and manipulate an HTML element
        console.log("resize event detected");
        minimap_update(true);
    });

    // autoscroll minimap TODO fix this as I think the get attribute by id
    // is ambigious and just happens to return the correct one
    window.addEventListener(
        "DOMContentLoaded",
        () => {
            const observer = new IntersectionObserver(
                THROTTLE
                    ? throttle(observerCallbackMinimap, 100)
                    : observerCallbackMinimap,
            );

            // Collect all headings and outline divs
            const headings = [
                //...document.querySelectorAll("h2[id], h3[id], h4[id], h5[id], h6[id]"),
                ...document.querySelectorAll(
                    "div.outline-text-2, div.outline-text-3, div.outline-text-4, div.outline-text-5, div.outline-text-6",
                ),
            ];

            headings.forEach((heading) => observer.observe(heading));
        },
        { passive: true },
    );
}
