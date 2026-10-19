// Node cannot load the components' stylesheets; the checks render markup only, so a .css
// import resolves to an empty module.
import { registerHooks } from 'node:module'
registerHooks({
  load(url, context, next) {
    if (url.endsWith('.css')) return { format: 'module', source: '', shortCircuit: true }
    return next(url, context)
  },
})
