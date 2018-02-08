'use strict'

const path = require('path')
const Funnel = require('broccoli-funnel')
const resolveSync = require('resolve').sync // eslint-disable-line

module.exports = {
  name: 'ember-cli-bourbon',

  blueprintsPath() {
    return path.join(__dirname, 'blueprints')
  },

  included(app) {
    this._super.included.apply(this, arguments)

    let target = findTargetHost(this, app)

    try {
      this.bourbonPath = path.dirname(
        resolveSync('bourbon', {
          basedir: target.project.root
        })
      )
    } catch (err) {
      this.writeError(err)
    }
  },

  treeForStyles() {
    return new Funnel(this.bourbonPath, {
      srcDir: 'core',
      destDir: 'app/styles',
      annotation: 'Funnel (bourbon)'
    })
  }
}

function findTargetHost(addon, app) {
  let target = app

  if (typeof addon.import === 'function') {
    target = addon
  } else {
    // If the addon has the _findHost() method (in ember-cli >= 2.7.0), we'll just
    // use that.
    if (typeof addon._findHost === 'function') {
      target = addon._findHost()
    }

    // Otherwise, we'll use this implementation borrowed from the _findHost()
    // method in ember-cli.
    // Keep iterating upward until we don't have a grandparent.
    // Has to do this grandparent check because at some point we hit the project.
    let current = addon
    do {
      target = current.app || app
    } while (current.parent.parent && (current = current.parent))
  }

  return target
}
