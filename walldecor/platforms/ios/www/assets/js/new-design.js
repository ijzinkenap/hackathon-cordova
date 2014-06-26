

	/**
	 *  The whole code of frontend applications
	 *  @constructor
	 */
	var FrontEnd = function(){

		this.headerSetLinks([{
			"text" : "Klantenservice",
			"href" : "#klantenservice",
			"title" : "This link goes to the Client Service"
		},{
			"text" : "welcome Jane Doe",
			"href" : "#welcome",
			"title" : "This link goes to your personal profile"
		}
		]);

		//this.tabsToggle();
		//this.initializeBackgrounds();
		//this.initializePhotos();

	};


	/**
	 *  Set hyperlinks in the header of the webpage with text and title
	 *  @param {Array} anchorObjects
	 *
	 */
	FrontEnd.prototype.headerSetLinks = function(anchorObjects){

		var listOfAnchors = goog.dom.query("#header-anchors")[0];

		anchorObjects.forEach(function(anchorObj){

			var item = goog.dom.createElement("li");
			var hyperlink = goog.dom.createElement("a");

			hyperlink.href = anchorObj.href;
			hyperlink.innerHTML = anchorObj.text;
			hyperlink.title = anchorObj.title;

			goog.dom.appendChild(item, hyperlink);
			goog.dom.appendChild(listOfAnchors, item);

		});

	};


	/**
	 *
	 *
	 */
	FrontEnd.prototype.tabsToggle = function(){

		this.tabs = goog.dom.query(".bottom-menu .tabs a");
		this.containers = goog.dom.query(".bottom-menu .containers li");

		var that = this;

		var tabsHandler = new goog.events.EventHandler();

		tabsHandler.listen(that.tabs[0], "click", goog.bind(function(e){
			this.toggleTab(0);
		}, this));

		tabsHandler.listen(that.tabs[1], "click", goog.bind(function(){
			this.toggleTab(1);
		}, this));

		tabsHandler.listen(that.tabs[2], "click", goog.bind(function(){
			this.toggleTab(2);
		}, this));

	};


	/**
	 *
	 *
	 */
	FrontEnd.prototype.toggleTab = function(targetContainerIndex){

		goog.dom.classes.remove(this.tabs[0], "active");
		goog.dom.classes.remove(this.tabs[1], "active");
		goog.dom.classes.remove(this.tabs[2], "active");

		goog.dom.classes.remove(this.containers[0], "active");
		goog.dom.classes.remove(this.containers[1], "active");
		goog.dom.classes.remove(this.containers[2], "active");

		goog.dom.classes.add(this.tabs[targetContainerIndex], "active");
		goog.dom.classes.add(this.containers[targetContainerIndex], "active");

	};


	/**
	 *
	 *
	 */
	FrontEnd.prototype.initializeBackgrounds = function(){

		var listOfBackgrounds = goog.dom.createElement("ul");
		goog.dom.classes.add(listOfBackgrounds, "backgrounds");

		for (var i=0; i<100; i++) {
			var backgroundItem = goog.dom.createElement("li");
			var randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
			backgroundItem.style.backgroundColor = randomColor;
			goog.dom.appendChild(listOfBackgrounds, backgroundItem);
		}

		var backgroundTab = goog.dom.query(".bottom-menu .containers li:nth-child(3)")[0];

		goog.dom.appendChild(backgroundTab, listOfBackgrounds);

	};


	/**
	 *
	 *
	 */
	FrontEnd.prototype.initializePhotos = function(){

		var listOfPhotos = goog.dom.createElement("div");
		goog.dom.classes.add(listOfPhotos, "photos");

		for (var i=0; i<30; i++) {
			var backgroundItem = goog.dom.createElement("img");
			backgroundItem.src = this.returnRandomImageUrl();
			goog.dom.appendChild(listOfPhotos, backgroundItem);
		}

		var photosTab = goog.dom.query(".bottom-menu .containers li:nth-child(2)")[0];
		goog.dom.appendChild(photosTab, listOfPhotos);

	};


	/**
	 *
	 *
	 */
	FrontEnd.prototype.returnRandomImageUrl = function(){

		var images = [
			"http://bit.ly/1e8dGDu",
			"http://bit.ly/1e8dLav",
			"http://bit.ly/1e8dMuT",
			"http://bit.ly/1e8dQuw",
			"http://bit.ly/1e8dOCX",
			"http://bit.ly/1e8e1Gv",
			"http://bit.ly/1e8e5G8",
			"http://bit.ly/1e8e6Kf"
		];

		return images[Math.floor(Math.random()*images.length)];

	};


	new FrontEnd();
