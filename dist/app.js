require('bootstrap');
require('bootstrap/css/bootstrap.css!');
var RollResult_1 = require("RollResult");
var PossibleRolls_1 = require("PossibleRolls");
var AttackProperty_1 = require("AttackProperty");
require("Chart.js");
require('jquery');
var fastclick_1 = require('fastclick');
require('bootstrap');
var App = (function () {
  function App() {
    this._dice = {
      red: [
        new RollResult_1.RollResult(1, 0, 0, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(2, 0, 0, 0, 0, false, 2 / 6),
        new RollResult_1.RollResult(2, 1, 0, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(3, 0, 0, 0, 0, false, 2 / 6)
      ],
      blue: [
        new RollResult_1.RollResult(1, 0, 2, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(0, 1, 2, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(2, 0, 3, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(1, 1, 3, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(2, 0, 4, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(1, 0, 5, 0, 0, false, 1 / 6)
      ],
      green: [
        new RollResult_1.RollResult(0, 1, 1, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(1, 1, 1, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(2, 0, 1, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(2, 0, 2, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(1, 1, 2, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(2, 0, 3, 0, 0, false, 1 / 6)
      ],
      yellow: [
        new RollResult_1.RollResult(0, 1, 0, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(1, 2, 0, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(1, 1, 1, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(2, 0, 1, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(0, 1, 2, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(1, 0, 2, 0, 0, false, 1 / 6)
      ],
      black: [
        new RollResult_1.RollResult(0, 0, 0, 1, 0, false, 2 / 6),
        new RollResult_1.RollResult(0, 0, 0, 2, 0, false, 2 / 6),
        new RollResult_1.RollResult(0, 0, 0, 3, 0, false, 1 / 6),
        new RollResult_1.RollResult(0, 0, 0, 0, 1, false, 1 / 6)
      ],
      white: [
        new RollResult_1.RollResult(0, 0, 0, 0, 0, false, 1 / 6),
        new RollResult_1.RollResult(0, 0, 0, 1, 0, false, 1 / 6),
        new RollResult_1.RollResult(0, 0, 0, 0, 1, false, 1 / 6),
        new RollResult_1.RollResult(0, 0, 0, 1, 1, false, 2 / 6),
        new RollResult_1.RollResult(0, 0, 0, 0, 0, true, 1 / 6)
      ]
    };
    this._currentColor = 0;
    this._colors = [
      [220, 0, 0, "white"],
      [0, 220, 0, "white"],
      [0, 0, 220, "white"],
      [220, 220, 0, "black"],
      [0, 220, 220, "black"],
      [220, 0, 220, "white"]
    ];
    this.diceCount = new Dice();
    this.resetAttackDice();
    this.resetDefenseDice();
    this.surgeAbilities = [];
    this.attack_type = "melee";
    this.range = 0;
    this.resetChart();
  }

  App.prototype.attached = function () {
    fastclick_1.attach(document.body);
    $('[data-toggle="tooltip"]').tooltip({delay: {show: 500}});
  };
  App.prototype.selectAttackType = function (type) {
    this.attack_type = type;
    if (type == "melee") {
      this.range = 0;
    }
    else if (type == "range") {
      this.range++;
    }
  };
  App.prototype.addAttackProperty = function (surge, type) {
    surge[type]++;
  };
  App.prototype.addDie = function (type) {
    this.diceCount[type]++;
  };
  App.prototype.addDefenseProperty = function (type) {
    this.fixedDefenseAbility[type]++;
  };
  App.prototype.addNewSurge = function () {
    this.surgeAbilities.push(new AttackProperty_1.AttackProperty());
  };
  App.prototype.removeSurge = function (surge) {
    this.surgeAbilities = this.surgeAbilities.filter(function (p) {
      return p != surge;
    });
  };
  App.prototype.resetAttackDice = function () {
    this.diceCount.red = 0;
    this.diceCount.blue = 0;
    this.diceCount.green = 0;
    this.diceCount.yellow = 0;
    this.fixedAttackAbility = {
      damage: 0,
      pierce: 0,
      accuracy: 0,
      surge: 0
    };
  };
  App.prototype.resetDefenseDice = function () {
    this.diceCount.black = 0;
    this.diceCount.white = 0;
    this.fixedDefenseAbility = {
      block: 0,
      evade: 0
    };
  };
  App.prototype.resetChart = function () {
    this._chartMaxDamage = 0;
    this._currentColor = 0;
    this._datasets = [];
    this.legend = [];
    if (this._chart !== undefined) {
      this._chart.destroy();
    }
  };
  App.prototype.getColor = function (alpha) {
    var i = this._currentColor % this._colors.length;
    var color = this._colors[i];
    var r = color[0];
    var g = color[1];
    var b = color[2];
    return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
  };
  App.prototype.getTextColor = function () {
    var i = this._currentColor % this._colors.length;
    var color = this._colors[i];
    return color[3];
  };
  App.prototype.calculateResult = function () {
    var possibleRolls = new PossibleRolls_1.PossibleRolls();
    for (var dieColor in this.diceCount) {
      for (var i = 0; i < this.diceCount[dieColor]; i++) {
        possibleRolls.applyNewRoll(this._dice[dieColor]);
      }
    }
    //possibleRolls.showProb();
    var damageResults = possibleRolls.getEffectiveDamage(this.surgeAbilities, this.fixedAttackAbility, this.fixedDefenseAbility, this.range);
    //var conditionResults = possibleRolls.getConditionProbability(this.surgeAbilities, this.fixedAttackAbility, this.fixedDefenseAbility, this.range);
    //alert(conditionResults);
    //console.log(damageResults);
    var minValue = 1;
    var maxValue = this._chartMaxDamage;
    for (var v in damageResults) {
      maxValue = Math.max(maxValue, v);
    }
    this._chartMaxDamage = maxValue;
    var labels = [];
    var data = [];
    var cumulativeProb = 0;
    for (var i = maxValue; i >= minValue; i--) {
      cumulativeProb += (damageResults[i] === undefined) ? 0 : damageResults[i];
      data.unshift(Math.round(cumulativeProb * 100));
      labels.unshift(i);
    }
    this._datasets.push({
      label: "Cumulative Damage Probablity",
      fillColor: this.getColor(0.2),
      strokeColor: this.getColor(1),
      pointColor: this.getColor(1),
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: this.getColor(1),
      data: data
    });
    for (var _i = 0, _a = this._datasets; _i < _a.length; _i++) {
      var ds = _a[_i];
      while (ds.data.length < maxValue) {
        ds.data.push(0);
      }
    }
    if (this.legend.length < 12) {
      this.legend.push({
        value: this._datasets.length,
        color: this.getColor(1),
        textColor: this.getTextColor()
      });
    }
    this._currentColor++;
    if (this._chart !== undefined) {
      this._chart.destroy();
    }
    var ctx = $("#damageChart").get(0).getContext("2d");
    this._chart = new Chart(ctx).Line({
      labels: labels,
      datasets: this._datasets
    });
  };
  return App;
})();
exports.App = App;
var Dice = (function () {
  function Dice() {
  }

  return Dice;
})();
exports.Dice = Dice;
var LegendInfo = (function () {
  function LegendInfo() {
  }

  return LegendInfo;
})();
exports.LegendInfo = LegendInfo;
//# sourceMappingURL=app.js.map
