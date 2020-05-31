// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(576, 1024, Phaser.AUTO, 'game_div');
var game_state = {};

// Creates a new 'main' state that will contain the game
game_state.main = function() { };  
game_state.main.prototype = {

    // Function called first to load all the assets
    preload: function() { 
        // Change the background color of the game
        //this.game.stage.backgroundColor = '#71c5cf';

        // Load the sprites
		this.foods = ['rice', 'cake', 'chocolate', 'strawburry', 'cookie', 'pie', 'turkey', 'octopus'];
        this.game.load.spritesheet('sheep', 'assets/puzzle.png', 360, 203, 4);
		for(var i in this.foods)
		{
			this.game.load.image(this.foods[i], 'assets/'+this.foods[i]+'.png');
		}
		this.game.load.audio('miemie', 'assets/miemie.wav');
		//this.game.load.audio('bgm', 'assets/bg.mp3');
		this.game.load.image('bgpic', 'assets/bgpic.png');
    },

    // Fuction called after 'preload' to setup the game 
    create: function() { 
        // Display the sheep on the screen
		this.bgpic = this.add.sprite(0, 0, "bgpic");
		
        this.sheep = this.game.add.sprite(100, 1024 - 100, 'sheep');
		//this.game.physics.arcade.enable(this.sheep);
		this.sheep.body.bounce.y = 0.2;
		this.sheep.body.gravity.y = 300;
		this.sheep.body.collideWorldBounds = true;
		this.sheep.animations.add('jump', [0, 1, 2, 3], 10, false);
		this.sheep.animations.add('eat', [0, 1], 10, false);
        
        // Add gravity to the sheep to make it fall
        this.sheep.body.gravity.y = 800; 

        // Call the 'jump' function when the spacekey is hit
        this.game.input.onDown.add(this.jump, this); 

        // Create food groups
		this.food_mgr = [this.rice, this.cake, this.chocolate, this.strawburry, this.cookie, this.pie, this.turkey, this.octopus];
		for(var i = 0; i < this.foods.length; ++i)
		{
			this.food_mgr[i] = game.add.group();
			this.food_mgr[i].createMultiple(20, this.foods[i]);
		}
		
		//Create sounds
		this.miemie = this.game.add.sound('miemie', 1, false);
		this.bgm = this.game.add.sound('bgm', 1, true);

        // Timer that calls 'add_row_of_food' ever 1.5 seconds
        this.timer = this.game.time.events.loop(1000, this.add_row_of_food, this);           

        // Add a score label on the top left of the screen
        this.score = 0;
        var style = { font: "30px Arial", fill: "#ffffff" };
        this.label_score = this.game.add.text(20, 20, "0000", style);
		
		this.game_finish = false;
		this.bgm.play();
    },
	
	check_overlap: function(child, i){
		this.game.physics.overlap(this.sheep, child, this.add_scores, null, this);
	},
	
	stop_all: function(child){
		child.body.velocity.x = 0;
		child.body.velocity.y = 0;
	},

    // This function is called 60 times per second
    update: function() {
		if(this.game_finish)
			return;
        // If the sheep is out of the world (too high or too low), call the 'restart_game' function
        if (this.sheep.inWorld == false)
            this.reset_sheep(); 

        // If the sheep overlap any food, call 'add_scores'
		for(var i in this.food_mgr)
		{
			this.food_mgr[i].forEachAlive(this.check_overlap, this, true);
		}
    },
	
	reset_sheep: function(){
		this.sheep.reset(100, 245);
	},

    // Make the sheep jump 
    jump: function() {
		if(this.game_finish)
			return;
        // Add a vertical velocity to the sheep
        this.sheep.body.velocity.y = -350;
		this.sheep.animations.play('jump');
    },
	
	// Restart the game
    restart_game: function() {
        // Remove the timer
        this.game.time.events.remove(this.timer);

        // Start the 'main' state, which restarts the game
        this.game.state.start('main');
    },
	
	finish_game: function() {
		this.game_finish = true;
		// Remove the timer
        this.game.time.events.remove(this.timer);
		this.sheep.body.allowGravity  = false; 
		this.sheep.body.velocity.y = 0; 
		for(var i in this.food_mgr)
			this.food_mgr[i].forEachAlive(this.stop_all, this, true);
		var style = { font: "50px Arial", fill: "#ffffff" };
        this.finish_text = this.game.add.text(160, 487, "恭喜通关！", style);  
	},
	
	show_score: function()
	{
		var score_s = (Array(4).join("0") + this.score).slice(-4);
		this.label_score.content = score_s;
	},
	
	get_score: function(key)
	{
		if(key == 'octopus')
			return 20;
		for(var i = 0; i < this.foods.length; ++i)
		{
			if(this.foods[i] == key)
				return i;
		}
		return 0;
	},

    // add the scores
    add_scores: function(object1, object2) {
		var i = this.get_score(object2.key);
		this.score += i;
		this.show_score();
		object2.reset(-1000,-1000);
		this.miemie.play();
		this.sheep.animations.play('eat');
		if(this.score == 601 || this.score >= 1000)
			this.finish_game();
    },

    // Add a food on the screen
    add_one_food: function(i, x, y) {
        // Get the first dead pipe of our group
		var food = this.food_mgr[i].getFirstDead();
        // Set the new position of the food
        food.reset(x, y);

         // Add velocity to the pipe to make it move left
        food.body.velocity.x = -200 * (Math.random() + 0.5);
		food.body.velocity.y = 100 * (Math.random() > 0.7? 1 : -1) * (Math.random() + 0.5);
               
        // Kill the pipe when it's no longer visible 
        food.outOfBoundsKill = true;
    },

    // Add a row of 6 pipes with a hole somewhere in the middle
    add_row_of_food: function() {
        for (var i = 0; i < 17; i++)
			if(Math.random() > (Math.random() * 0.2 + 0.7))
                this.add_one_food(Math.floor(Math.random()*5)+1, 576*(1-0.5*Math.random()), i*60-20);  
    },
};

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);  
game.state.start('main'); 