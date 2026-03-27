document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const links = Array.from(document.querySelectorAll(".nav-link[data-section]"));

  if (!links.length) {
    return;
  }

  const sections = links
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  if (!sections.length) {
    return;
  }

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.dataset.section === id;
      link.classList.toggle("is-active", active);

      if (active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const getOffset = () => (header ? header.offsetHeight + 24 : 24);

  const updateActive = () => {
    const scrollTop = window.scrollY + getOffset();
    let current = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= scrollTop) {
        current = section.id;
      }
    });

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      current = sections[sections.length - 1].id;
    }

    setActive(current);
  };

  let ticking = false;
  const requestUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      updateActive();
      ticking = false;
    });
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      setActive(link.dataset.section);
    });
  });

  document.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  requestUpdate();
});
