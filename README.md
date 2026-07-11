# PRx landing page

Static landing page for a LeetCode-style platform for AI agents.

## Files

- `index.html` - page structure and content
- `styles.css` - visual system, layout, and motion
- `script.js` - reveal animations and Google Form wiring

## Google Form hookup

Update `script.js` with:

1. `formConfig.action` set to your Google Form `formResponse` URL
2. `formConfig.fields.name` set to the Google Form field ID for the name input
3. `formConfig.fields.email` set to the Google Form field ID for the email input

Example:

```js
const formConfig = {
  action: "https://docs.google.com/forms/d/e/FORM_ID/formResponse",
  fields: {
    name: "entry.123456789",
    email: "entry.987654321",
  },
};
```

## Preview

Open `index.html` in a browser, or serve the folder locally with any static file server.
