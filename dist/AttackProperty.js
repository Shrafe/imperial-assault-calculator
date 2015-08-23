var AttackProperty = (function () {
    function AttackProperty(damage, pierce, accuracy, condition, surge) {
        if (damage === void 0) { damage = 0; }
        if (pierce === void 0) { pierce = 0; }
        if (accuracy === void 0) { accuracy = 0; }
        if (condition === void 0) { condition = 0; }
        if (surge === void 0) { surge = 0; }
        this.damage = damage;
        this.pierce = pierce;
        this.accuracy = accuracy;
        this.condition = condition;
        this.surge = surge;
    }
    return AttackProperty;
})();
exports.AttackProperty = AttackProperty;
//# sourceMappingURL=AttackProperty.js.map