'use strict';

const debug = require('../utils/debug')('htmlbars-plugin');
const generateRandomName = require('../utils/generate-random-name');

function isNodeTypeMatch(node) {
  return node.type === 'BlockStatement' || node.type === 'MustacheStatement';
}

function isStepFromYield(node, yieldParam) {
  const nameParts = node.path.parts;
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

  const walker = new this.syntax.Walker();
  const plugin = this;

  walker.visit(ast, function(node) {
    if (!isStepManager(node)) {
      return;
    }

    const { program } = node;
    const currentStep = getHashPair(node, 'currentStep');

    const yieldedAs =
      program.blockParams &&
      program.blockParams.length &&
      program.blockParams[0];
    if (!yieldedAs) {
      return;
    }

    // Build a list of child steps
    const childSteps = [];
    walker.children(node, function(childNode) {
      if (isNodeTypeMatch(childNode) && isStepFromYield(childNode, yieldedAs)) {
        childSteps.push(childNode);
      }
    });

    if (!childSteps.length) {
      return;
    }

    // Ensure all child steps have a name
    childSteps.forEach(function(childNode, index) {
      const name = getHashPair(childNode, 'name');
      if (!name) {
        const namePair = plugin.buildStringPair('name', generateRandomName());
        childNode.hash.pairs.push(namePair);
      }

      const indexPair = plugin.buildNumberPair('index', index);
      childNode.hash.pairs.push(indexPair);
    });

    // Ensure that the step manager has a `currentStep` value
    if (!currentStep) {
      const firstStepName = getHashPair(childSteps[0], 'name').value.value;
      const currentStepPair = plugin.buildStringPair(
        'currentStep',
        firstStepName
      );
      node.hash.pairs.push(currentStepPair);
    }
  });

  return ast;
};

EmberSteps.prototype.buildStringPair = function(key, value) {
  const string = this.builders.string(value);
  return this.builders.pair(key, string);
};

EmberSteps.prototype.buildNumberPair = function(key, value) {
  const number = this.builders.number(value);
  return this.builders.pair(key, number);
};

EmberSteps.prototype.buildBooleanPair = function(key, value) {
  const boolean = this.builders.boolean(value);
  return this.builders.pair(key, boolean);
};

module.exports = EmberSteps;
