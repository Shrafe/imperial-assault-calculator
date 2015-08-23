var RollResult_1 = require("RollResult");
var PossibleRolls = (function () {
  function PossibleRolls() {
    this._possibleRolls = {};
    var initRollResult = new RollResult_1.RollResult();
    this._possibleRolls[initRollResult.getHashCode()] = initRollResult;
  }

  PossibleRolls.prototype.applyNewRoll = function (newRoll) {
    var newPossibleRolls = {};
    for (var prKey in this._possibleRolls) {
      for (var _i = 0; _i < newRoll.length; _i++) {
        var rollResult = newRoll[_i];
        var newRollResult = this._possibleRolls[prKey].apply(rollResult);
        var key = newRollResult.getHashCode();
        if (newPossibleRolls[key] === undefined) {
          newPossibleRolls[key] = newRollResult;
        }
        else {
          newPossibleRolls[key].probability += newRollResult.probability;
        }
      }
    }
    this._possibleRolls = newPossibleRolls;
  };
  PossibleRolls.prototype.showProb = function () {
    var total = 0;
    for (var prKey in this._possibleRolls) {
      console.log("%s: %f", prKey, this._possibleRolls[prKey].probability);
      total += this._possibleRolls[prKey].probability;
    }
    console.log("total: %f", total);
  };
  PossibleRolls.prototype.getEffectiveDamage = function (surgeAbilities, fixedAttackAbility, fixedDefenseAbility, needRange) {
    var effectiveDamage = {};
    for (var prKey in this._possibleRolls) {
      var rollResult = this._possibleRolls[prKey];
      if (rollResult.miss) {
        this.updateValue(effectiveDamage, 0, rollResult.probability);
        continue;
      }
      var calcDamageResult = new RollResult_1.RollResult();
      for (var key in rollResult) {
        calcDamageResult[key] = rollResult[key];
      }
      var surgeAbilitiesToUse = [];
      for (var _i = 0; _i < surgeAbilities.length; _i++) {
        var surge = surgeAbilities[_i];
        surgeAbilitiesToUse.push(surge);
      }
      calcDamageResult.surge += fixedAttackAbility.surge;
      calcDamageResult.surge -= fixedDefenseAbility.evade;
      calcDamageResult.surge -= calcDamageResult.evade;
      calcDamageResult.damage += fixedAttackAbility.damage;
      calcDamageResult.range += fixedAttackAbility.accuracy;
      calcDamageResult.block += fixedDefenseAbility.block;
      calcDamageResult.block -= Math.min(fixedAttackAbility.pierce, calcDamageResult.block);
      //console.log("%s: %f", prKey, this._possibleRolls[prKey].probability);
      while ((calcDamageResult.surge > 0) && (surgeAbilitiesToUse.length > 0)) {
        var bestSurgeEffect = undefined;
        for (var _a = 0; _a < surgeAbilitiesToUse.length; _a++) {
          var surge = surgeAbilitiesToUse[_a];
          var surgeEffect = this.calculateSurgeEffect(calcDamageResult, surge, needRange);
          if ((surgeEffect.remainingRange == 0) &&
            ((bestSurgeEffect === undefined) ||
            (surgeEffect.effectiveDamage > bestSurgeEffect.effectiveDamage))) {
            bestSurgeEffect = surgeEffect;
          }
        }
        //if (bestSurgeEffect !== undefined)
        //    console.log("found surge effect that hits: %O => +%d", bestSurgeEffect, bestSurgeEffect.effectiveDamage);
        if (bestSurgeEffect === undefined) {
          //Failed to fund a surge to use...  none must give enough range.
          //Just find the one with the best range.
          for (var _b = 0; _b < surgeAbilitiesToUse.length; _b++) {
            var surge = surgeAbilitiesToUse[_b];
            var surgeEffect = this.calculateSurgeEffect(calcDamageResult, surge, needRange);
            if ((bestSurgeEffect === undefined) ||
              (surgeEffect.remainingRange < bestSurgeEffect.remainingRange)) {
              bestSurgeEffect = surgeEffect;
            }
          }
        }
        if (bestSurgeEffect !== undefined) {
          calcDamageResult.damage += bestSurgeEffect.surge.damage;
          calcDamageResult.block -= Math.min(bestSurgeEffect.surge.pierce, calcDamageResult.block);
          calcDamageResult.range += bestSurgeEffect.surge.accuracy;
          calcDamageResult.surge--;
          surgeAbilitiesToUse = surgeAbilitiesToUse.filter(function (s) {
            return s != bestSurgeEffect.surge;
          });
        }
      }
      if (calcDamageResult.range < needRange) {
        this.updateValue(effectiveDamage, 0, calcDamageResult.probability);
      }
      else {
        this.updateValue(effectiveDamage, Math.max(calcDamageResult.damage - calcDamageResult.block, 0), calcDamageResult.probability);
      }
    }
    return effectiveDamage;
  };

  PossibleRolls.prototype.getConditionProbability = function (surgeAbilities, fixedAttackAbility, fixedDefenseAbility, needRange) {
    var conditionProbability = 0;

    for (var prKey in this._possibleRolls) {
      var currentRoll = this._possibleRolls[prKey];
      if (currentRoll.miss) {
        continue;
      }

      // copy current roll
      var conditionAppliedResult = new RollResult();
      for (var key in currentRoll) {
        conditionAppliedResult[key] = currentRoll[key];
      }

      var surgeAbilitiesToUse = [];
      for (var _i = 0; _i < surgeAbilities.length; _i++) {
        var surge = surgeAbilities[_i];
        surgeAbilitiesToUse.push(surge);
      }

      conditionAppliedResult.surge += fixedAttackAbility.surge;
      conditionAppliedResult.surge -= fixedDefenseAbility.evade;
      conditionAppliedResult.surge -= conditionAppliedResult.evade;
      conditionAppliedResult.damage += fixedAttackAbility.damage;
      conditionAppliedResult.range += fixedAttackAbility.accuracy;
      conditionAppliedResult.block += fixedDefenseAbility.block;
      conditionAppliedResult.block -= Math.min(fixedAttackAbility.pierce, conditionAppliedResult.block);

      // damage is > 1 and we have an unspent surge. success. short circuit.
      if ((conditionAppliedResult.damage > 0) && (conditionAppliedResult.surge > 0)) {
        conditionProbability += conditionAppliedResult.probability;
        continue;
      }
      // while we have unspent surges and surge abilities to use, and we don't yet do enough damage to apply our condition
      while ((conditionAppliedResult.surge > 1) && (surgeAbilitiesToUse.length > 0)) {
        var bestSurgeEffect = undefined;
        for (var _i = 0; _i < surgeAbilities.length; _i++) {
          var surgeEffect = this.calculateSurgeEffect(conditionAppliedResult, surgeAbilities[_i], needRange);
          if ((surgeEffect.remainingRange == 0) &&
            ((bestSurgeEffect === undefined) ||
            (surgeEffect.effectiveDamage > bestSurgeEffect.effectiveDamage))) {
            bestSurgeEffect = surgeEffect;
          }
        }
        if (bestSurgeEffect == undefined) {
          for (var __i = 0; _i < surgeAbilities.length; __i++) {
            var surgeEffect = this.calculateSurgeEffect(conditionAppliedResult, surgeAbilities[__i], needRange);
            if ((bestSurgeEffect === undefined) ||
              (surgeEffect.remainingRange < bestSurgeEffect.remainingRange)) {
              bestSurgeEffect = surgeEffect;
            }
          }
        }
        if (bestSurgeEffect !== undefined) {
          conditionAppliedResult.damage += bestSurgeEffect.surge.damage;
          conditionAppliedResult.block -= Math.min(bestSurgeEffect.surge.pierce, conditionAppliedResult.block);
          conditionAppliedResult.range += bestSurgeEffect.surge.accuracy;
          conditionAppliedResult.surge--;
          surgeAbilitiesToUse = surgeAbilitiesToUse.filter(function (s) {
            return s != bestSurgeEffect.surge;
          });
        }
      }
      if (conditionAppliedResult.range < needRange) {

      } else {
        conditionProbability += conditionAppliedResult.probability;
      }
    }
    return conditionProbability;
  };

  PossibleRolls.prototype.updateValue = function (dict, key, value) {
    if (dict[key] === undefined) {
      dict[key] = 0;
    }
    dict[key] += value;
  };
  PossibleRolls.prototype.calculateSurgeEffect = function (rollResult, surge, needRange) {
    var result = new SurgeResult();
    result.surge = surge;
    result.remainingRange = Math.max(needRange - (rollResult.range + surge.accuracy), 0);
    var effectOfPierce = Math.min(surge.pierce, rollResult.block);
    result.effectiveDamage = effectOfPierce + surge.damage;
    return result;
  };
  return PossibleRolls;
})();
exports.PossibleRolls = PossibleRolls;
var SurgeResult = (function () {
  function SurgeResult() {
  }

  return SurgeResult;
})();
exports.SurgeResult = SurgeResult;
//# sourceMappingURL=PossibleRolls.js.map
