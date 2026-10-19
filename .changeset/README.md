# Changesets

Every change to `@soleapp/ui` that a consumer can see (a new part, a new prop, a fix, a changed token value)
needs a changeset: run `npm run changeset`, pick the bump and write one plain sentence. The release workflow
turns the pending changesets into a version pull request and, once an npm token exists, publishes.

`@sole/docs` and `@sole/tokens` are private and never released, so they are ignored.
