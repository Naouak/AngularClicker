(function(){
    var app = angular.module("store", []);

    app.factory("items", [function(){
        return {
            wood: {
                name: "wood",
                price: 1,
                description: "some woods"
            },
            stone: {
                name: "stone",
                price: 2,
                description: "some stone"
            },
            woodstick: {
                name: "woodstick",
                price: 3,
                description: "You may want to stick with it."
            }
        }
    }]);

    app.factory("inventory", ["$rootScope",function ($rootScope) {
        var items = {};
        var quantity = 0;
        var maxQuantity = 10;

        function updateTotal() {
            quantity = 0;
            for (var i in items) {
                if (items.hasOwnProperty(i)) {
                    quantity += parseInt(items[i].quantity);
                }
            }
        }

        return {
            getItems: function () {
                return items;
            },
            getTotalQuantity: function () {
                return quantity;
            },
            getMaxQuantity: function () {
                return maxQuantity;
            },
            isFull: function(){
                return maxQuantity<=quantity;
            },
            setMaxQuantity: function(max){
                  maxQuantity = max;
            },
            addItem: function (item, newQty) {
                if (items[item.name] === undefined) {
                    items[item.name] = item;
                    items[item.name].quantity = 0;
                }
                if(quantity+newQty > maxQuantity){
                    newQty = maxQuantity-quantity;
                }
                items[item.name].quantity += newQty;
                $rootScope.$broadcast("inventoryUpdate");
                updateTotal();
            },
            consumeItem: function (item, quantity) {
                items[item].quantity -= quantity;
                $rootScope.$broadcast("inventoryUpdate");
            }
        }

    }]);

    app.factory("recipes", [function(){
        return {
            "woodstick": {
                code: "woodstick",
                name: "Awesome woodstick",
                ingredients: {
                    "wood" : 2
                },
                used: 0,
                can: false
            }
        };
    }]);

    app.controller("InventoryController", ["inventory", function(inventory){
        this.inventory = inventory;
    }]);

    app.controller("ScrapController", ["inventory","items", function(inventory, items){
        var randomTable = [
            {name: "wood", lt: 5000},
            {name: "stone",lt: 10000}
        ];
        this.inventory = inventory;
        this.scrap = function(){
            this.random = ~~(Math.random()*10000);

            for(var i = 0; i < randomTable.length; i++){
                if(randomTable[i].lt > this.random){
                    this.item = randomTable[i].name;
                    inventory.addItem(items[randomTable[i].name],1);
                    break;
                }
            }
        }
    }]);

    app.controller("RecipesController", ["inventory","items","recipes","$scope", function(inventory, items, recipes, $scope){
        this.checkRecipes = function(){
            for(var i in recipes){
                if(recipes.hasOwnProperty(i)){
                    this.checkRecipe(recipes[i]);
                }
            }
        };
        this.checkRecipe = function(recipe){
            var hasIngredient = true;
            for(var i in recipe.ingredients){
                if(recipe.ingredients.hasOwnProperty(i)){
                    var ingredient = i;
                    var quantity = recipe.ingredients[i];

                    if(!inventory.getItems()[ingredient] || inventory.getItems()[ingredient].quantity < quantity){
                        hasIngredient = false;
                        break;
                    }
                }
            }
            recipe.can = hasIngredient;
        };
        this.useRecipe = function(recipe){
            if(this.checkRecipe(recipe) && !recipe.can){
                return;
            }

            var ingredients = recipe.ingredients;
            for(var item in ingredients){
                if(ingredients.hasOwnProperty(item)) {
                    var quantity = ingredients[item];
                    inventory.consumeItem(item, quantity);
                }
            }

            inventory.addItem(items[recipe.code], 1);

        };
        this.recipes = recipes;

        $scope.$on("inventoryUpdate", this.checkRecipes.bind(this));
    }])

}());
