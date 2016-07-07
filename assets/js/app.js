(function() {
	// initialize applictaion
	var app = angular.module("SC Player", []);
	app.factory("sharedStateService", function () {
		return {
			addTrack : null
        };
	});

	var CLIENT_ID = '56ee4d4d76716d4f4059509d8fcd9b7c';
	var iframeElement = document.querySelector('iframe');
	SC.initialize({
		client_id: CLIENT_ID
	});
	var widget = SC.Widget(iframeElement);

	///////////////////////////////////////////////
	// <controller> searcher
	// controller to search tracks
	app.controller('searcher', function($scope, sharedStateService) {
		$scope.searchResults = [];
		$scope.sharedData = sharedStateService;

		$scope.searchTracks = function() {
	    	$scope.searchResults = [];
			SC.get('/tracks', { q: $scope.keyword }, function(tracks) {
	    		for (var i in tracks) {
	        		$scope.searchResults.push(tracks[i]);
	    		}
				$scope.$apply();
	    	});
		}

		$scope.addToTrackList = function(track) {
			$scope.sharedData.addTrack = angular.copy(track)
		}
	});

	///////////////////////////////////////////////
	// <controller> player
	// controller to controll soundcloud's widget
	app.controller('player', function($scope, sharedStateService) {
		$scope.trackList = [];
		$scope.sharedData = sharedStateService;

		var currentTrackIdx = 0;

		$scope.$watch(function(){
			return sharedStateService.addTrack;
		}, function(){
			var addTrack =  $scope.sharedData.addTrack;
			if ( addTrack != null ) {
				$scope.trackList.push($scope.sharedData.addTrack);
			}
		});

		$scope.play = function() {
			loadTrack();
		}

		$scope.pause = function() {
			widget.pause();
		}

		$scope.prev = function() {
			if ( currentTrackIdx == 0 ) {
		    	currentTrackIdx = $scope.trackList.length - 1;
		    } else {
		      　currentTrackIdx--;
		    }
		    $scope.play();
		  }

		$scope.next = function() {
			if ( currentTrackIdx >= $scope.trackList.length - 1 ) {
				currentTrackIdx = 0;
			} else {
				currentTrackIdx++;
			}
			$scope.play();
		 }

		$scope.removeTrack = function(index) {
			$scope.trackList.splice(index, 1);
    		if ( currentTrackIdx == index ) {
      			if ( currentTrackIdx > 0) {
        			currentTrackIdx--;
				}
      		}
		}

		$scope.isActive = function (index) {
			return currentTrackIdx == index;
		}

		function loadTrack() {
			var playerScope = angular.element('#player').scope();
			widget.load( playerScope.trackList[currentTrackIdx].uri, { auto_play: true,});
		}
	});
}());

///////////////////////////////////////////////
// misc funtion
function addEvent(element, eventName, callback) {
	if (element.addEventListener) {
		element.addEventListener(eventName, callback, false);
	} else {
		element.attachEvent(eventName, callback, false);
	}
}

function updateConsole(value) {
	consoleBox.value = value +"\n" + consoleBox.value;
}
