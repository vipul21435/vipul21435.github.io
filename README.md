# vipul21435.github.io

Source for https://vipul21435.github.io, my portfolio.

Plain HTML, CSS and a little vanilla JavaScript. No build step, no framework, no dependencies beyond Google Fonts and Three.js from cdnjs. GitHub Pages serves the repository root from `main`.

## Layout

```
index.html                 home page: about, experience, squad lead, projects, skills, contact
profile.jpg                profile photo
assets/style.css           shared styles for every page
assets/site.js             shared behaviour; each feature runs only where its elements exist
projects/*.html            one detail page per project
projects/img/              screenshots used on the detail pages
```

## How a visitor moves through a project

1. A card in the Projects section on the home page.
2. The project's detail page: what it does, how it works stage by stage, the engineering decisions, tests and CI, and how to run it.
3. The GitHub repository, linked at the end of each detail page. Work done for clients has no public repository, so those pages end with a way to get in touch.

## Contact form

The form posts to [FormSubmit](https://formsubmit.co), which forwards each message to vipul21435@iiitd.ac.in with the sender's address as reply-to. If FormSubmit refuses a message or the network fails, the page offers the same message as ready-to-send Gmail, Outlook and mail-app links, so a visitor can always reach me.

## Accessibility

Skip link, visible keyboard focus, semantic landmarks and headings, text that scales with the browser, and every animation (typing, particles, the 3D scene, tilt and parallax) stops when the visitor's system asks for reduced motion.
