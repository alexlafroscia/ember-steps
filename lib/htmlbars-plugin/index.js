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

function EmberSteps() {
  this.syntax = null;
  this.builders = null;
}

function isStepManager(node) {
  return isNodeTypeMatch(node) && node.path.original === 'step-manager';
}

EmberSteps.prototype.constructor = EmberSteps;
EmberSteps.prototype.transform = function(ast) {
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

    // Build a list of child steps
    var childSteps = [];
    walker.children(node, function(childNode) {
      if (isNodeTypeMatch(childNode) && isStepFromYield(childNode, yieldedAs)) {
        childSteps.push(childNode);
      }
    });

    if (!childSteps.length) {
      return;
    }

    // Ensure all child steps have a name
    childSteps.forEach(function(childNode) {
      var name = getHashPair(childNode, 'name');
      if (!name) {
        var namePair = plugin.buildStringPair('name', generateRandomName());
        childNode.hash.pairs.push(namePair);
      }
    });

    // Ensure that the step manager has a `currentStep` value
    if (!currentStep) {
      var firstStepName = getHashPair(childSteps[0], 'name').value.value;
      var currentStepPair = plugin.buildStringPair('currentStep', firstStepName);
      node.hash.pairs.push(currentStepPair);
    }

    // Add the step count to the step manager
    var stepCountPair = plugin.buildStringPair('stepCount', childSteps.length.toString());
    node.hash.pairs.push(stepCountPair);
  });

  return ast;
};

EmberSteps.prototype.buildStringPair = function(key, value) {
  var stringLiteral = this.builders.string(value);
  return this.builders.pair(key, stringLiteral);
};

module.exports = EmberSteps;
