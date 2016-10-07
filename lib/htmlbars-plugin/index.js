'use strict';

var debug = require('../utils/debug')('htmlbars-plugin');
var generateRandomName = require('../utils/generate-random-name');

function isNodeTypeMatch(node) {
  return node.type === 'BlockStatement' || node.type === 'MustacheStatement';
}

function isStepFromYield(node, yieldParam) {
  var nameParts = node.path.parts;
  return nameParts[0] === yieldParam && nameParts[1] === 'step';
}

function getHashPair(node, name) {
  return node.hash.pairs.find(function(param) {
    return param.key === name;
  });
}

function EmberWizard() {
  this.syntax = null;
  this.builders = null;
}

function isStepManager(node) {
  return isNodeTypeMatch(node) && node.path.original === 'step-manager';
}

EmberWizard.prototype.constructor = EmberWizard;
EmberWizard.prototype.transform = function(ast) {
  debug('Starting HTMLBars transform');

  if (!this.builders) {
    this.builders = this.syntax.builders;
  }

  var walker = new this.syntax.Walker();
  var plugin = this;

  walker.visit(ast, function(node) {
    if (!isStepManager(node)) {
      return;
    }

    var program = node.program;
    var currentStep = getHashPair(node, 'currentStep');

    var yieldedAs = program.blockParams && program.blockParams.length && program.blockParams[0];
    if (!yieldedAs) {
      return;
    }

    program.body.forEach(function(childNode) {
      if (isNodeTypeMatch(childNode) && isStepFromYield(childNode, yieldedAs)) {
        var name = getHashPair(childNode, 'name');
        if (!name) {
          var namePair = plugin.buildStringPair('name', generateRandomName());
          childNode.hash.pairs.push(namePair);
        }
      }
    });

    if (!currentStep) {
      var firstStep = program.body.find(function(childNode) {
        return isNodeTypeMatch(childNode) && isStepFromYield(childNode, yieldedAs)
      })
      var firstStepName = getHashPair(firstStep, 'name').value.value;
      var currentStepPair = plugin.buildStringPair('currentStep', firstStepName);
      node.hash.pairs.push(currentStepPair);
    }
  });

  return ast;
};

EmberWizard.prototype.buildStringPair = function(key, value) {
  var stringLiteral = this.builders.string(value);
  return this.builders.pair(key, stringLiteral);
};

module.exports = EmberWizard;
