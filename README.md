# Tacit

Automatically fill in forms with dummy data while doing development on
local/staging environments (tailored to a Shopify development flow for now).

Essentially tacit runs a set of pre-defined actions with DOM APIs on every frame
of a page. The primary use case is to allow users to complete a typical Shopify
development checkout flow easily (using the default Stripe testing card
details). Technically, this would apply to auto-filling any online web form that
might have repetitive data used while developing.

### Goals

- Practice JavaScript with some extra sauce
- Practice implementing observers and a JSX-esque `createElement` function (no
  cool JSX syntax though)
- Practice creating a browser extension with more modern tooling
- Suffer less when testing the Shopify checkout flow

> Available on Firefox
> [here](https://addons.mozilla.org/en-US/firefox/addon/tacit/).
