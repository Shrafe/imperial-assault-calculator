import {RollResult} from "RollResult";
import {AttackProperty} from "AttackProperty";
import {DefenseProperty} from "DefenseProperty";

export class PossibleRolls {
    private _possibleRolls: { [key: string]: RollResult } = {};

    constructor() {
        let initRollResult = new RollResult();
        this._possibleRolls[initRollResult.getHashCode()] = initRollResult;
    }

    applyNewRoll(newRoll: RollResult[]) {
        let newPossibleRolls: { [key: string]: RollResult } = {};
        for (let prKey in this._possibleRolls) {
            for (let rollResult of newRoll) {
                let newRollResult = this._possibleRolls[prKey].apply(rollResult);
                let key = newRollResult.getHashCode();
                if (newPossibleRolls[key] === undefined) {
                    newPossibleRolls[key] = newRollResult;
                } else {
                    newPossibleRolls[key].probability += newRollResult.probability;
                }
            }
        }

        this._possibleRolls = newPossibleRolls;
    }

    showProb() {
        let total = 0;
        for (let prKey in this._possibleRolls) {
            console.log("%s: %f", prKey, this._possibleRolls[prKey].probability);
            total += this._possibleRolls[prKey].probability;
        }

        console.log("total: %f", total);
    }

    getEffectiveDamage(surgeAbilities: AttackProperty[], fixedAttackAbility: AttackProperty, fixedDefenseAbility: DefenseProperty, needRange: number): { [damage: number]: number } {
        let effectiveDamage: { [damage: number]: number } = {};

        for (let prKey in this._possibleRolls) {
            let rollResult = this._possibleRolls[prKey];
            if (rollResult.miss) {
                this.updateValue(effectiveDamage, 0, rollResult.probability);
                continue;
            }

            let calcDamageResult = new RollResult();
            for (let key in rollResult) {
                calcDamageResult[key] = rollResult[key];
            }

            let surgeAbilitiesToUse: AttackProperty[] = [];
            for (let surge of surgeAbilities) {
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
                var bestSurgeEffect: SurgeResult = undefined;

                for (let surge of surgeAbilitiesToUse) {
                    let surgeEffect = this.calculateSurgeEffect(calcDamageResult, surge, needRange);
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
                    for (let surge of surgeAbilitiesToUse) {
                        let surgeEffect = this.calculateSurgeEffect(calcDamageResult, surge, needRange);
                        if ((bestSurgeEffect === undefined) ||
                            (surgeEffect.remainingRange < bestSurgeEffect.remainingRange)) {
                            bestSurgeEffect = surgeEffect;
                        }
                    }

                    //if (bestSurgeEffect !== undefined)
                    //    console.log("found surge effect for improved range: %O => remaining %d", bestSurgeEffect, bestSurgeEffect.remainingRange);
                }



                if (bestSurgeEffect !== undefined) {
                    calcDamageResult.damage += bestSurgeEffect.surge.damage;
                    calcDamageResult.block -= Math.min(bestSurgeEffect.surge.pierce, calcDamageResult.block);
                    calcDamageResult.range += bestSurgeEffect.surge.accuracy

                    calcDamageResult.surge--;
                    surgeAbilitiesToUse = surgeAbilitiesToUse.filter(s => s != bestSurgeEffect.surge);
                }
            }

            if (calcDamageResult.range < needRange) {
                this.updateValue(effectiveDamage, 0, calcDamageResult.probability);
            } else {
                this.updateValue(effectiveDamage, Math.max(calcDamageResult.damage - calcDamageResult.block, 0), calcDamageResult.probability);
            }
        }

        return effectiveDamage;
    }


    getConditionProbability(surgeAbilities: AttackProperty[], fixedAttackAbility: AttackProperty, fixedDefenseAbility: DefenseProperty, needRange: number): number {
	let conditionProbability: number = 0;

	for (let prKey in this._possibleRolls){
	    let currentRoll = this._possibleRolls[prKey];
	    if (rollResult.miss){
		continue;
	    }
	    
	    // copy current roll
	    let conditionAppliedResult = new RollResult();
	    for (let key in currentRoll){
		conditionAppliedResult[key] = currentRoll[key];
	    }

	    let surgeAbilitiesToUse: AttackProperty[] = [];
	    for (let surge of surgeAbilities) {
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
	    if ((conditionAppliedResult.damage > 0) && (conditionAppliedResult.surge > 0)){	
		conditionProbability += conditionAppliedResult.probability;
		continue;
	    }
	    // while we have unspent surges and surge abilities to use, and we don't yet do enough damage to apply our condition
	    while ((conditionAppliedResult.surge > 1) && (surgeAbilitiesToUse.length > 0)){
		var penetrateDefense: SurgeResult = undefined;	
		
		for (let surge of surgeAbilitiesToUse){
		    let surgeEffect = this.calculateSurgeEffect(conditionAppliedResult, surge, needRange);
		    if ((surgeEffect.remainingRange == 0) && 
			((bestSurgeEffect === undefined) || 
			(surgeEffect.effectiveDamage > bestSurgeEffect.effectiveDamage))){
			    bestSurgeEffect = surgeEffect;
		    }
		}
		if (bestSurgeEffect == undefined) {
                    for (let surge of surgeAbilitiesToUse) {
                        let surgeEffect = this.calculateSurgeEffect(conditionAppliedResult, surge, needRange);
                        if ((bestSurgeEffect === undefined) ||
                            (surgeEffect.remainingRange < bestSurgeEffect.remainingRange)) {
                            bestSurgeEffect = surgeEffect;
                        }
                    }
		}
                if (bestSurgeEffect !== undefined) {
                    conditionAppliedResult.damage += bestSurgeEffect.surge.damage;
                    conditionAppliedResult.block -= Math.min(bestSurgeEffect.surge.pierce, conditionAppliedResult.block);
                    conditionAppliedResult.range += bestSurgeEffect.surge.accuracy
                    conditionAppliedResult.surge--;
                    surgeAbilitiesToUse = surgeAbilitiesToUse.filter(s => s != bestSurgeEffect.surge);
                }
	    }
            if (conditionAppliedResult.range < needRange){
		continue;
	    } else {
		conditionProbability += conditionAppliedResult.probability;
	    }
	}
	return conditionProbability;
    }

    private updateConditionProbability(dictionary: { [key: boolean]: number }, key: boolean, probability: number) {
	if (dictionary[key] === undefined){
	    dictionary[key] = 0;
        } 
	dictionary[key] += probability;
    }

    private updateValue(dict: { [key: number]: number }, key: number, value: number) {
        if (dict[key] === undefined) {
            dict[key] = 0;
        }
        dict[key] += value;
    }

    private calculateSurgeEffect(rollResult: RollResult, surge: AttackProperty, needRange: number): SurgeResult {
        let result = new SurgeResult();
        result.surge = surge;

        result.remainingRange = Math.max(needRange - (rollResult.range + surge.accuracy), 0);
        let effectOfPierce = Math.min(surge.pierce, rollResult.block);
        result.effectiveDamage = effectOfPierce + surge.damage;

        return result;
    }
}

export class SurgeResult {
    effectiveDamage: number;
    remainingRange: number;
    surge: AttackProperty;
}
