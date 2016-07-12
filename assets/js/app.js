(function() {
	// initialize applictaion
	var app = angular.module("SC Player", ['ui.sortable']);
	app.factory("sharedStateService", function () {
		return {
			addTrack : null,
			addPlaylist : null
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
		$scope.searchTrackResults = [];
		$scope.searchPlaylistResults = [];
		$scope.sharedData = sharedStateService;
		$scope.searchMode = "Track";

		$scope.searchTracks = function() {
			$scope.searchTrackResults = [];
			$scope.searchPlaylistResults = [];
			var searchModeStr;
			var resultLimit;
			if ( $scope.searchMode == "PlayList" ) {
				searchModeStr = "/playlists";
				resultLimit = 50;
			} else {
				searchModeStr = "/tracks";
				resultLimit = 50;
			}

			SC.get( searchModeStr, { q: $scope.keyword, limit: resultLimit　}, function(result, error) {
				if( result ) {
					for (　var i = 0; i < result.length; i++　) {
						if ( $scope.searchMode == "PlayList" ) {
							$scope.searchPlaylistResults.push( result[i] );
						} else {
							$scope.searchTrackResults.push( result[i] );
						}
					}
					$scope.$apply();
				}
	    	});
		}

		$scope.addTrack = function(track) {
			$scope.sharedData.addTrack = angular.copy(track)
		}

		$scope.addPlaylist = function(playlist) {
			$scope.sharedData.addPlaylist = angular.copy(playlist)
		}
	});

	///////////////////////////////////////////////
	// <controller> player
	// controller to controll soundcloud's widget
	app.controller('player', function($scope, sharedStateService) {
		$scope.trackList = [];
		$scope.sharedData = sharedStateService;

		var currentTrackIdx = 0;
		var isPlay = false;

		$scope.$watch(function(){
			return sharedStateService.addTrack;
		}, function(){
			var addTrack =  $scope.sharedData.addTrack;
			if ( addTrack != null ) {
				$scope.trackList.push(　addTrack　);
			}
		});

		$scope.$watch(function(){
			return sharedStateService.addPlaylist;
		}, function(){
			var addPlaylist =  $scope.sharedData.addPlaylist;
			if ( addPlaylist != null ) {
				for ( var i = 0; i < addPlaylist.tracks.length; i++ ) {
					$scope.trackList.push( addPlaylist.tracks[ i ] );
				}
			}
		});

		widget.bind(　SC.Widget.Events.FINISH, function() {
			$scope.next();
		});

		$scope.play = function() {
			isPlay = true;
			loadTrack();
		}

		$scope.stop = function() {
			if ( isPlay ) {
				isPlay = false;
				widget.pause();
			}
		}

		$scope.prev = function() {
			if ( currentTrackIdx == 0 ) {
		    	currentTrackIdx = $scope.trackList.length - 1;
		    } else {
		      　currentTrackIdx--;
		    }
			if ( isPlay ) {
		    	$scope.play();
			}
		  }

		$scope.next = function() {
			if ( currentTrackIdx >= $scope.trackList.length - 1 ) {
				currentTrackIdx = 0;
			} else {
				currentTrackIdx++;
			}
			if ( isPlay ) {
				$scope.play();
			}
		 }

		$scope.removeTrack = function(index) {
			$scope.trackList.splice(index, 1);
    		if ( currentTrackIdx == index ) {
      			if ( currentTrackIdx > 0) {
        			currentTrackIdx--;
				}
      		}
		}

		$scope.trackSelect = function (index) {
			currentTrackIdx = index;
			$scope.play();
		}

		$scope.isActive = function (index) {
			return currentTrackIdx == index;
		}

		function loadTrack() {
			widget.load($scope.trackList[currentTrackIdx].uri, { auto_play: true,});
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
