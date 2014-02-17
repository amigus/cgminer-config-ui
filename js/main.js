function configFileHandler(callback) {
	document.addEventListener('dragover', function (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}, false);

	document.addEventListener('drop', function (evt) {
		evt.stopPropagation();
		evt.preventDefault();

		var reader = new FileReader(), file = evt.dataTransfer.files[0];

		reader.onloadend = function(nestedEvt) {
			if (nestedEvt.target.readyState == FileReader.DONE) {
				callback(nestedEvt.target.result, file.name);
			}
		}
		reader.readAsBinaryString(file);
	}, false);
}

angular.module('cgminerConfigUI',[]).controller('cgminerConfigCtrl',
		function ($scope, $window) {
	$scope.cgminerConfig = { pools: [] };
	$scope.download = 'cgminer.conf';
	$scope.gpus = 1;

	var perGPUSettings = [
		'intensity', 'vectors', 'worksize', 'kernel', 'lookup-gap',
		'thread-concurrency', 'shaders', 'gpu-engine', 'gpu-fan',
		'gpu-memclock', 'gpu-memdiff', 'gpu-powertune', 'gpu-vddc',
		'temp-cutoff', 'temp-overheat', 'temp-target'
	];

	($scope.addPool = function() {
		var pools = $scope.cgminerConfig.pools;

		$scope.cgminerConfig.pools = [];
		for (var i = 0; i < pools.length; i++) {
			if (pools[i].url && pools[i].url != "") {
				$scope.cgminerConfig.pools.push(pools[i]);
			}
		}
		$scope.cgminerConfig.pools.push({
			'url' : '', 'user' : '', 'pass' : ''
		});
	})();

	($scope.gpusChanged = function() {
		function adjust(setting) {
			var value = $scope.cgminerConfig[setting];
			var gpus = $scope.gpus;
			var result = ("" + $scope.cgminerConfig[setting]).split(",");

			if (result.length > gpus) {
				result = result.slice(0, gpus);
			} else {
				for (var i = 0; i < gpus - result.length; i++) {
					result.push(result[result.length - 1]);
				}
			}
			$scope.cgminerConfig[setting] = result.join(',');
		}
		for (var setting in $scope.cgminerConfig)
				if (perGPUSettings.indexOf(setting) > -1)
					adjust(setting);
	})();

	configFileHandler(function (data, filename) {
		$scope.cgminerConfig = angular.fromJson(data);
		$scope.download = filename;
		$scope.gpus = $scope.cgminerConfig['intensity'].match(/,/).length + 1;
		$scope.prePopulated = true;
		$scope.$apply();
	});

	$scope.save = function() {
		var a = document.createElement("a");
		a.download = $scope.download;
		a.href = URL.createObjectURL(new Blob(
			[angular.toJson($scope.cgminerConfig, true)],
			{ name: $scope.download, type: "application/json" }
		));
		a.style = "display:none";
		document.body.appendChild(a);
		a.click();
		URL.revokeObjectURL(a.href);
		a.remove();
	}
});