# Verdant

A responsive landing page and mini shop for an indoor-plant store. Hero, feature cards, a product grid with a working cart, a call-to-action banner and a footer, all built with plain HTML, CSS and JavaScript (no framework, no build step).

**[Live demo](https://YOUR-LIVE-LINK-HERE)**

![Verdant](./Screenshot%202026-11-07%20222127.png)

> Portfolio project with demo content: the brand, products and email address are made up.

## Features

- Mobile-first responsive layout (checked at 320px, 375px, tablet and desktop widths)
- Working cart: add plants, change quantities, remove items, see the total
- Cart is saved in `localStorage`; corrupted saved data is ignored instead of breaking the page
- Optional "Order on WhatsApp" button that sends the cart as a ready-written message (set `WHATSAPP_NUMBER` at the top of the cart code in `plants.js`)
- Cart uses the native `<dialog>` element: focus handling, `Esc` to close, click outside to close
- Scroll-reveal animations with `IntersectionObserver`, switched off for visitors who prefer reduced motion
- Accessibility: semantic landmarks, alt text, visible keyboard focus, screen-reader announcements when items are added

## Built with

- HTML5, CSS (custom properties, Grid, Flexbox), vanilla JavaScript
- Fonts: [Fraunces](https://fonts.google.com/specimen/Fraunces) and [DM Sans](https://fonts.google.com/specimen/DM+Sans) from Google Fonts
- Photos: <!-- add the source/license of your images here, e.g. Unsplash -->

## Run it locally

No install needed. Open `plants.html` in your browser, or serve the folder:

```bash
npx serve .
```

## Files

```
plants.html   page structure and content
plants.css    styles (variables, components, sections, media queries)
plants.js     scroll-reveal animation and the cart
images/       product and hero photos
```

## Customizing

- **Products:** each product card has `data-id`, `data-name` and `data-price`; the cart reads them from there.
- **WhatsApp orders:** set `WHATSAPP_NUMBER` in `plants.js` (country code + number, digits only, e.g. `'201001234567'`).
- **Colors and fonts:** the variables at the top of `plants.css`.

## What I learned

- How to build a mobile-first layout and scale it up with min-width media queries
- Why data from localStorage must be validated before it is used
- Why textContent is safer than innerHTML when building the cart list

## Possible improvements

- A real checkout and payment
- More products, with filtering by light and care level
- Arabic (RTL) version of the page
