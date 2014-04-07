function TextFileDrop(callback, document) {
	function preventAndStop(evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}

	document.addEventListener('dragenter', preventAndStop, false);
	document.addEventListener('dragover', preventAndStop, false);
	document.addEventListener('drop', function (evt) {
		preventAndStop(evt);

		var reader = new FileReader(), file = evt.dataTransfer.files[0];

		reader.onloadend = function(nestedEvt) {
			if (nestedEvt.target.readyState == FileReader.DONE) {
				callback(nestedEvt.target.result, file.name);
			}
		}
		reader.readAsText(file);
	}, false);
}

angular.module('cgminerConfigUI',[]).controller('cgminerConfigCtrl',
		function ($scope, $window) {
	var GPUSettings = [
		'intensity', 'vectors', 'worksize', 'kernel', 'lookup-gap',
		'thread-concurrency', 'shaders', 'gpu-engine', 'gpu-fan',
		'gpu-memclock', 'gpu-memdiff', 'gpu-powertune', 'gpu-vddc',
		'temp-cutoff', 'temp-overheat', 'temp-target'
	];

	$scope.config = { pools: [] };
	$scope.download = 'cgminer.conf';
	$scope.gpus = 1;
	$scope.multipools = [
		'failover-only', 'balance', 'load-balance', 'round-robin'];
	($scope.addPool = function() {
		var pools = $scope.config.pools;

		$scope.config.pools = [];
		for (var i = 0; i < pools.length; i++) {
			if (pools[i].url && pools[i].url != "") {
				$scope.config.pools.push(pools[i]);
			}
		}
		$scope.config.pools.push({
			'url' : '', 'user' : '', 'pass' : ''
		});
	})();

	($scope.gpusChanged = function() {
		function adjust(setting) {
			var value = $scope.config[setting];
			var gpus = $scope.gpus;
			var result = ("" + $scope.config[setting]).split(",");

			if (result.length > gpus) {
				result = result.slice(0, gpus);
			} else {
				for (var i = 0; i < gpus - result.length; i++) {
					result.push(result[result.length - 1]);
				}
			}
			$scope.config[setting] = result.join(',');
		}
		for (var setting in $scope.config)
				if (GPUSettings.indexOf(setting) > -1)
					adjust(setting);
	})();

	TextFileDrop(function (data, filename) {
		$scope.config = angular.fromJson(data);
		$scope.download = filename;
		$scope.gpus = 0;
		for (var i = 0; i < GPUSettings.length; i++) {
			var setting = $scope.config[GPUSettings[i]];

			if (typeof setting == 'string') {
				var gpus = setting.match(/,/).length + 1;

				if (gpus > $scope.gpus) {
					$scope.gpus = gpus;
				}
			}
		}
		for (var i = 0; i < $scope.multipools.length; i++) {
			if ($scope.config[$scope.multipools[i]]) {
				$scope.multipool = $scope.config[$scope.multipools[i]];
			}
		}
		$scope.prePopulated = true;
		$scope.$apply();
	}, document);

	$scope.multipoolChanged = function() {
		for (var i = 0; i < $scope.multipools.length; i++) {
			delete $scope.config[$scope.multipools[i]];
		}
		if ($scope.multipool) {
			$scope.config[$scope.multipool] = true;
		}
	};

	$scope.save = function() {
		var a = document.createElement("a");

		a.download = $scope.download;
		a.href = URL.createObjectURL(new Blob(
			[angular.toJson($scope.config, true)],
			{ name: $scope.download, type: "application/json" }
		));
		a.style = "display:none";
		document.body.appendChild(a);
		a.click();
		URL.revokeObjectURL(a.href);
		a.remove();
	}
});