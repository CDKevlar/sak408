var wifiSocket;
var wifiSocketLocation = 'ws://' + window.location.hostname + ':81/';
var command;
var userChangedSettings = false;
var filenameArray = [];

var scaleFactor;
var g1, g2, g3, g4, g5, g6, g7, g8, g9;

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
    console.log("ERROR: " + url + " failed with errorMsg " + errorMsg);
    return false;
}

/* window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");
  preloader.style.display = "none";
}); */
	

//----------------------------------------------------BEGIN of DOM ready--------------------------------------------------------
$(document).ready(function() {										 
	//----Shortcuts-------------------------------------------------------------------------------------
	var byId = function(id){return document.getElementById(id);};// Usage: byId('someID')
	var byCn = function(cn){return document.getElementsByClassName(cn);};// Usage: byCn('someCLASSNAME')
	//--------------------------------------------------------------------------------------------------
	
	$("#testAG").click(function() {								
		command = "TESTAG`";
	    socketSend(command);
	});
	
	function buildRuleDiv(){
		// Vanilla
		var inRulesCnt = document.getElementsByClassName("inRuleContainer").length; // how many do we have?
		// JQuery
		var inRulesCnt = $('.inRuleContainer').length; // how many do we have?
		if(inRulesCnt <= 15){ // Limiting to 16 rules!
			var newInrulenumb = inRulesCnt + 1;
			var newRuleDiv = buildNewInputRuleDiv(newInrulenumb); // Found in newRuleDiv.js
			if(inRulesCnt == 0){
				// Vanilla
				document.getElementById("allTheRules").after(newRuleDiv);
				// JQuery
				$('#allTheRules').after(newRuleDiv);
			}else{
				// Vanilla
				var afterThisDiv = "inRule" + inRulesCnt;
				document.getElementById(afterThisDiv).after(newRuleDiv);
				// JQuery
				var afterThisDiv = "#inRule" + inRulesCnt;
				$(afterThisDiv).after(newRuleDiv);
			}
		}
	}
	
	// Vanilla
	document.getElementById("addInputRule").addEventListener("click", function(){ buildRuleDiv(); });
	// JQuery
	$("#addInputRule").click(function() {
		buildRuleDiv();
	});
	
	function saveRules(){
		// Vanilla
		var inRulesCnt = document.getElementsByClassName("inRuleContainer").length; // how many do we have?
		// JQuery
		var inRulesCnt = $('.inRuleContainer').length; // how many do we have?
		if(inRulesCnt > 0){
			var saveString = "";
			var confirmMsg = "Are you sure you would like to save the following rule";
			if(inRulesCnt == 1){
				confirmMsg += "?<br><br>";
			}else{
				confirmMsg += "s?<br><br>";
			}
			for(let i = 1; i <= inRulesCnt; i++){
				// Vanilla
				var inputNumb = document.getElementById('inRuleInputNumb' + i);//.selected;
				var inputState = document.getElementById('inRuleInputStat' + i);
				var outputFunction = document.getElementById('inRuleOutputFunc' + i);
				// JQuery
				var inputNumb = $('.inRuleInputNumb[data-rulenumb="' + i + '"] option:selected'); //.val();
				var inputState = $('.inRuleInputStat[data-rulenumb="' + i + '"] option:selected'); //.val();
				var outputFunction = $('.inRuleOutputFunc[data-rulenumb="' + i + '"] option:selected'); //.val();
				/*
					Check these fields here
					Bad fields:
					inputNumb == "0"
					inputState == "2"
					outputFunction == "0"
				*/
				// Vanilla
				if(inputNumb.value == "0"){
					document.getElementById('infoModalBody').html('No Input is Selected for Rule #' + i + ' !');
					$("#infoModal").modal('show');
					$('.inRuleInputNumb[data-rulenumb="' + i + '"]').focus();
					return;
				}
				// JQuery
				if(inputNumb.val() == "0"){
					$("#infoModalBody").html('No Input is Selected for Rule #' + i + ' !');
					$("#infoModal").modal('show');
					$('.inRuleInputNumb[data-rulenumb="' + i + '"]').focus();
					return;
				}
				// Vanilla
				if(inputState.value == "2"){
				// JQuery
				if(inputState.val() == "2"){
					$("#infoModalBody").html('No Input State is Selected for Rule #' + i + ' !');
					$("#infoModal").modal('show');
					$('.inRuleInputStat[data-rulenumb="' + i + '"]').focus();
					return;
				}
				// Vanilla
				if(outputFunction.value == "0"){
				// JQuery
				if(outputFunction.val() == "0"){
					$("#infoModalBody").html('No Output Function is Selected for Rule #' + i + ' !');
					$("#infoModal").modal('show');
					$('.inRuleOutputFunc[data-rulenumb="' + i + '"]').focus();
					return;
				}
				confirmMsg += i + ") " + inputNumb.text() + " " + inputState.text() + ":";// + outputFunction.text() + " ";
				saveString += inputNumb.val() + "|" + inputState.val() + "|" + outputFunction.val() + "|";
				var endConfirmMsg;
				if(i == inRulesCnt){
					endConfirmMsg = "<br>";
				}else{
					endConfirmMsg = "<br><hr style='color:var(--blue);'>";
				}
				switch (outputFunction.val()){
					case "1": // Turn ON
						var outputNumb = $('.inRuleOutputNumb[data-rulenumb="' + i + '"] option:selected'); //.val();
						// Check this field here
						// Bad field:
						// outputNumb == "0"
						if(outputNumb.val() == "0"){
							$("#infoModalBody").html('No Output is Selected for Rule #' + i + ' !');
							$("#infoModal").modal('show');
							$('.inRuleOutputNumb[data-rulenumb="' + i + '"]').focus();
							return;
						}
						confirmMsg += "<br>&nbsp&nbsp&nbsp&nbsp" + outputFunction.text() + " " + outputNumb.text() + endConfirmMsg;
						saveString += outputNumb.val() + "|0|x|x|x|0|~"; // End of the rule
						break;
					case "2": // Turn OFF
						var outputNumb = $('.inRuleOutputNumb[data-rulenumb="' + i + '"] option:selected'); //.val();
						// Check this field here
						// Bad field:
						// outputNumb == "0"
						if(outputNumb.val() == "0"){
							$("#infoModalBody").html('No Output is Selected for Rule #' + i + ' !');
							$("#infoModal").modal('show');
							$('.inRuleOutputNumb[data-rulenumb="' + i + '"]').focus();
							return;
						}
						confirmMsg += "<br>&nbsp&nbsp&nbsp&nbsp" + outputFunction.text() + " " + outputNumb.text() + endConfirmMsg;
						saveString += outputNumb.val() + "|0|x|x|x|0|~"; // End of the rule
						break;
					case "3": // Pulse
						var outputNumb = $('.inRuleOutputNumb[data-rulenumb="' + i + '"] option:selected'); //.val();
						var outputHrs = $('.inRuleOutputHrs[data-rulenumb="' + i + '"] option:selected'); //.val();
						var outputMin = $('.inRuleOutputMin[data-rulenumb="' + i + '"] option:selected'); //.val();
						var outputSec = $('.inRuleOutputSec[data-rulenumb="' + i + '"] option:selected'); //.val();
						// Check these fields here
						// Bad fields:
						// outputNumb == "0"
						// outputHrs == "0" && outputMin == "0" && outputSec == "0"
						if(outputNumb.val() == "0"){
							$("#infoModalBody").html('No Output is Selected for Rule #' + i + ' !');
							$("#infoModal").modal('show');
							$('.inRuleOutputNumb[data-rulenumb="' + i + '"]').focus();
							return;
						}
						if(outputHrs.val() == "0" && outputMin.val() == "0" && outputSec.val() == "0"){
							$("#infoModalBody").html('No Output Pulse Times Selected for Rule #' + i + ' !');
							$("#infoModal").modal('show');
							return;
						}
						confirmMsg += "<br>&nbsp&nbsp&nbsp&nbsp" + outputFunction.text() + " " + outputNumb.text() + " for<br>&nbsp&nbsp&nbsp&nbsp" + outputHrs.text() + ", " + outputMin.text() + " and " + outputSec.text() + endConfirmMsg;
						var totalSeconds = (parseInt(outputHrs.val()) * 3600) + (parseInt(outputMin.val()) * 60) + parseInt(outputSec.val());
						saveString += outputNumb.val() + "|" + totalSeconds + "|x|x|x|0|~"; // End of the rule
						break;
					case "4": // Serial
						var serString = $('.inRuleSerString[data-rulenumb="' + i + '"]').val();
						// Check this field here
						// Bad field:
						// serString == ""
						if(serString == ""){
							$("#infoModalBody").html('The Serial String is Blank for Rule #' + i + ' !');
							$("#infoModal").modal('show');
							//$('.inRuleSerString[data-rulenumb="' + i + '"]').focus();
							return;
						}
						confirmMsg += "<br>&nbsp&nbsp&nbsp&nbsp" + outputFunction.text() + ";<br>&nbsp&nbsp&nbsp&nbsp" + serString + endConfirmMsg;
						saveString += "0|0|" + serString + "|x|x|0|~"; // End of the rule
						break;
					case "5": // Wifi post
					case "6": // Eth post
						var postServer = $('.postServer[data-rulenumb="' + i + '"]').val();
						var postPath = $('.postPath[data-rulenumb="' + i + '"]').val();
						var postType = $('.postType[data-rulenumb="' + i + '"]').find(":selected").val();
						var postData = $('.postData[data-rulenumb="' + i + '"]').val();
						if(postServer == ""){
							$("#infoModalBody").html('You must enter a Server for Rule #' + i + ' !');
							$("#infoModal").modal('show');
							return;
						}						
						if(postPath == ""){
							$("#infoModalBody").html('You must enter a Server Path for Rule #' + i + ' !');
							$("#infoModal").modal('show');
							return;
						}						
						if(postType == "0"){
							$("#infoModalBody").html('The Content Type is not selected for Rule #' + i + ' !');
							$("#infoModal").modal('show');
							return;
						}			
						if(postData == ""){
							$("#infoModalBody").html('The Post Data is Blank for Rule #' + i + ' !');
							$("#infoModal").modal('show');
							return;
						}			
						var entirePost = postServer + "|" + postPath + "|" + postType + "|" + postData;
						//alert(entirePost);
						var msgRep = entirePost.replace(/\r\n/g, '<br>&nbsp&nbsp&nbsp&nbsp');
						confirmMsg += "<br>&nbsp&nbsp&nbsp&nbsp" + outputFunction.text() + " To<br>&nbsp&nbsp&nbsp&nbsp" + postServer + postPath;
						confirmMsg += "<br>&nbsp&nbsp&nbsp&nbsp" + postData + endConfirmMsg;
						saveString += "0|0|x|" + entirePost + "~"; // End of the rule
						break;
					default: // Should NEVER get here!
				}
			}
			// All is good and we have at least one rule
			console.log(saveString);
			//alert(saveString);
			//command = "SAVEFILE:inRules.txt:" + saveString;
			command = "SAVEFILE`inRules.txt`" + saveString;
			$("#ynModalBody").html(confirmMsg);
			$("#ynModal").modal('show');
		}
	}
	//----ID inRuleSave click---------------------------------------------------------------------------
	//Vanilla
	document.getElementById("inRuleSave").addEventListener("click", function(){
		saveRules(); 
	});
	//JQuery
	$(document).on("click", ".inRuleSave", function(){ // delegated event handler
		saveRules();
	});	
	//--------------------------------------------------------------------------------------------------
	$(document).on("click", ".inRuleDelete", function(){ // delegated event handler
		var ruleNumb = $(this).data("rulenumb"); // which one are we removing?
		// 
		//$("#ynModalBody").html('Are you sure you would like to delete Rule #' + ruleNumb + '?<br><br>';
		//$("#ynModal").modal('show');
		//
		$('.inRuleContainer[data-rulenumb="' + ruleNumb + '"]').remove(); // remove the target element
		var inRulesCnt = $('.inRuleContainer').length; // how many do we have?
		if(inRulesCnt > 0){
			var inRuleDivs = $('.inRuleContainer');
			inRuleDivs.each(function(index) {
				var newIdx = index + 1;
				$(this).find('[data-rulenumb]').attr('data-rulenumb', newIdx); // change all children data attribute
				$(this).find('.ruleTitle').text('Rule #' + newIdx);
				$(this).attr('data-rulenumb', newIdx); // change this one's data attribute
				$(this).attr('id', 'inRule' + newIdx); // change this one's id
			});
			//
			// All is good and we have at least one rule
			//command = "SAVEFILE:inRules.txt:" + saveString;
			//$("#ynModalBody").html(confirmMsg);
			//$("#ynModal").modal('show');
			saveRules(); // Rewrite the rules file
		}else{
			// Write a blank rules file or delete the rules file
		}
	});	
	
	$(document).on("change", ".inRuleOutputFunc", function(){ // delegated event handler
		var ruleNumb = $(this).data("rulenumb"); // which one did we select?
		//console.log("ruleNumb = " + ruleNumb + ", value = " + $(this).val());
		switch ($(this).val()){
			case "1": // Turn ON
				$('.inRuleOutputFunc3[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc4[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc56[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc123[data-rulenumb="' + ruleNumb + '"]').attr("hidden", false);
				break;
			case "2": // Turn OFF
				$('.inRuleOutputFunc3[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc4[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc56[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc123[data-rulenumb="' + ruleNumb + '"]').attr("hidden", false);
				break;
			case "3": // Pulse
				$('.inRuleOutputFunc4[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc56[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc123[data-rulenumb="' + ruleNumb + '"]').attr("hidden", false);
				$('.inRuleOutputFunc3[data-rulenumb="' + ruleNumb + '"]').attr("hidden", false);
				break;
			case "4": // Serial
				$('.inRuleOutputFunc3[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc123[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc56[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc4[data-rulenumb="' + ruleNumb + '"]').attr("hidden", false);
				break;
			case "5": // Wifi post
				$('.inRuleOutputFunc3[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc123[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc4[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc56[data-rulenumb="' + ruleNumb + '"]').attr("hidden", false);
				break;
			case "6": // Eth post
				$('.inRuleOutputFunc3[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc123[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc4[data-rulenumb="' + ruleNumb + '"]').attr("hidden", true);
				$('.inRuleOutputFunc56[data-rulenumb="' + ruleNumb + '"]').attr("hidden", false);
				break;
		}
	});
	
	$(document).on("change", ".inRuleOutputHrs", function(){ // delegated event handler
		var ruleNumb = $(this).data("rulenumb"); // which one did we select?
		if($(this).val() == "24"){
			$('.inRuleOutputMin[data-rulenumb="' + ruleNumb + '"]').val('0');
			$('.inRuleOutputMin[data-rulenumb="' + ruleNumb + '"]').prop('disabled', 'disabled');
			$('.inRuleOutputSec[data-rulenumb="' + ruleNumb + '"]').val('0');
			$('.inRuleOutputSec[data-rulenumb="' + ruleNumb + '"]').prop('disabled', 'disabled');
		}else{
			$('.inRuleOutputMin[data-rulenumb="' + ruleNumb + '"]').prop('disabled', false);
			$('.inRuleOutputSec[data-rulenumb="' + ruleNumb + '"]').prop('disabled', false);
		}
	});	




	//*****************************This function handles the CLASS CLICK of the "chkOutput" checkboxes*******************************
	$(".chkOutput").click(function() {
		var textStr = "SETOUTPUT`";
	    var outputNumb = this.getAttribute('data-outputnumb');
		textStr += outputNumb;
		if ($(this).is(':checked')) { 
			textStr += "`1";
		}else{
			textStr += "`0";
		}
		/*
		switch(this.id){
	    	case "chkOut1":
				if ($(this).is(':checked')) { 
					textStr = "SETOUTPUT:1:1:";
				}else{
					textStr = "SETOUTPUT:1:0:";
				}
				break;
	    	case "chkOut2":
				if ($(this).is(':checked')) { 
					textStr = "SETOUTPUT:2:1:";
				}else{
					textStr = "SETOUTPUT:2:0:";
				}
				break;
	    	case "chkOut3":
				if ($(this).is(':checked')) { 
					textStr = "SETOUTPUT:3:1:";
				}else{
					textStr = "SETOUTPUT:3:0:";
				}
				break;
	    	case "chkOut4":
				if ($(this).is(':checked')) { 
					textStr = "SETOUTPUT:4:1:";
				}else{
					textStr = "SETOUTPUT:4:0:";
				}
				break;
	    	case "chkOut5":
				if ($(this).is(':checked')) { 
					textStr = "SETOUTPUT:5:1:";
				}else{
					textStr = "SETOUTPUT:5:0:";
				}
				break;
	    	case "chkOut6":
				if ($(this).is(':checked')) { 
					textStr = "SETOUTPUT:6:1:";
				}else{
					textStr = "SETOUTPUT:6:0:";
				}
				break;
	    	case "chkOut7":
				if ($(this).is(':checked')) { 
					textStr = "SETOUTPUT:7:1:";
				}else{
					textStr = "SETOUTPUT:7:0:";
				}
				break;
	    	case "chkOut8":
				if ($(this).is(':checked')) { 
					textStr = "SETOUTPUT:8:1:";
				}else{
					textStr = "SETOUTPUT:8:0:";
				}
				break;

			default:
	    }
		*/
		console.log(textStr);
		socketSend(textStr);
	});
	
	$("#knightRider").click(function() {
		//socketSend("KNIGHTRIDER:50:");
		socketSend("KNIGHTRIDER`50`");
	});
	
	function handleNewMessage(newMessage) {
		var messageContainer = $("#wsNavMsg");

		// Start by sliding the old message out
		messageContainer.css({ animationName: "slide-down" });

		// When the animation ends, update the message and slide it in
		messageContainer.one("animationend", function () {
			messageContainer.text(newMessage); // Update the message text
			messageContainer.css({ animationName: "slide-up" });
		});
	}
	
	$("#changeDebugLabel").click(function(){								
	const colors = ["Red", "Blue", "Green", "Yellow", "Cyan", "Purple", "Pink"];
		var rndm = Math.floor(Math.random() * 6);
		handleNewMessage(colors[rndm]);
	});

 g1 = new JustGage({
          id: "guageGridVoltage",
          value: 0,
          min: 0,
          max: 240,
		  decimals: 2,
          title: "Grid Voltage",
          label: "AC Volts",
		  customSectors: {
          ranges: [{
            color: "#ff0000",
            lo: 0,
            hi: 110
          }, {
            color: "#00ff00",
            lo: 101,
            hi: 240
          }]
        },
        });

        g2 = new JustGage({
          id: "guageGridCurrent",
          value: 0,
          min: 0,
          max: 10,
		  decimals: 2,
          title: "Grid Current",
          label: "AC Amps"
        });

/*         g3 = new JustGage({
          id: "guageGridWattage",
          value: 50,
          min: 0,
          max: 2400,
          title: "Grid Wattage",
          label: "AC Watts"
        }); */

        g4 = new JustGage({
          id: "guageOutputVoltage",
          value: 0,
          min: 0,
          max: 14,
		  decimals: 2,
          title: "Output Voltage",
          label: "DC Volts",
		  customSectors: {
          ranges: [{
            color: "#ff0000",
            lo: 0,
            hi: 11
          }, {
            color: "#00ff00",
            lo: 12,
            hi: 14
          }]
        },
        });
         
		 g5 = new JustGage({
          id: "guageOutputCurrent",
          value: 0,
          min: 0,
          max: 100,
		  decimals: 2,
          title: "Output Current",
          label: "DC Amps"
        });
        
/* 		g6 = new JustGage({
          id: "guageOutputWattage",
          value: 10,
          min: 0,
          max: 1200,
		  decimals: 2,
          title: "Output Wattage",
          label: "DC Watts"
        }); */
        
		g7 = new JustGage({
          id: "guageInternalTemp",
          value: 0,
          min: 0,
          max: 250,
		  //decimals: 2,
          title: "Internal Temp",
          label: "Deg F",
		  customSectors: {
          ranges: [{
            color: "#4C86A8",
            lo: 0,
            hi: 83
          }, {
            color: "#C9B6BE",
            lo: 84,
            hi: 167  
          }, {
            color: "#AD4856",
            lo: 168,
            hi: 250
          }]
        },		  
        });
        
		g8 = new JustGage({
          id: "guageActualRPM",
          value: 0,
          min: 0,
          max: 18000,
		  levelColors: ["#405AA1"],
		  //decimals: 2,
          title: "Fan Actual",
          label: "Fan RPM"
        });
        
		g9 = new JustGage({
          id: "guageCommandedRPM",
          value: 0,
          min: 0,
          max: 18000,
		  levelColors: ["#405AA1"],
		  //decimals: 2,
          title: "Fan Commanded",
          label: "Target Fan RPM"
       });
		
$('.navbar-nav .nav-link').click(function(){
    //$('#nav li.active').removeClass('active');
	$('.navbar-nav .nav-item').removeClass('active');
    $(this).addClass('active');
})

	for (var i = 1000; i <= 18000; i+=500) {
		var option = $('<option>', {
			value: i,
			text: i,
		});
		$('#selFanRPM').append(option);
	}

	$("#getParam").click(function(){								
		//var address = parseInt($("#PMBAddress").val(), 16);
		var address = parseInt($("#addrToTest").val(), 16);
		command = parseInt($("#PMBCommand").val(), 16);
		scaleFactor = $("#PMBCommand").find(':selected').data('scale');
		//var textStr = "I2CREADWORD:" + address + ":" + command + ":";
		var textStr = "I2CREADWORD`" + address + "`" + command + "`";
		socketSend(textStr);
	});
	
	$("#setFanRPM").click(function(){								
		var address = parseInt($('#addrToTest').val(),16);
		var rpm = $("#selFanRPM").val();
		//var textStr = "SETFAN:" + address + ":" + rpm + ":";
		var textStr = "SETFAN`" + address + "`" + rpm + "`";
		socketSend(textStr);
	});
	
	$("#i2cReadAll").click(function(){								
		var address = parseInt($('#addrToTest').val(),16);
		//var textStr = "I2CREADALL:" + address + ":";
		var textStr = "I2CREADALL`" + address + "`";
		socketSend(textStr);
	});
	
	$('#I2CAutoUpdate').click(function() { 
		var address = parseInt($('#addrToTest').val(),16);
		//var textStr = "I2CAUTOUPDATE:" + address + ":";
		var textStr = "I2CAUTOUPDATE`" + address + "`";
		if (!$(this).is(':checked')) { 
			//textStr += "0:";
			textStr += "`0`";
		}else{
			//textStr += "1:";
			textStr += "`1`";
		}	
		socketSend(textStr);
	 });
  
	$("#SCANI2CADDRESS").click(function(){								
		//socketSend("SCANI2CADDRESS:");
		socketSend("SCANI2CADDRESS`");
	});
	
	/*
	for (var i = 0; i < 128; i++) {
		var d2h = (+i).toString(16).toUpperCase();
		if(d2h.length < 2) {
			d2h = '0' + d2h;
		}
		var option = $('<option>', {
			value: i,
			text: d2h,
			'data-foo': 'extra data!' // Set the data attribute here
		});
		$('#PMBAddress').append(option);
	}
	$('#PMBAddress').val('5F').prop('selected', true);
	//$('#PMBAddress').val("5F");

	$("#genPMBCommand").click(function(){								
		var address = $("#PMBAddress").val();
		command = parseInt($("#PMBCommand").val(), 16);
		
		var textStr = "PMBREADDATA:" + address + ":" + command + ":" + bytes;
		$("#resultReadPMBusByte").val(textStr);
	});
	
	$("#sendPMBCommand").click(function(){								
		if($("#resultReadPMBusByte").val() != ""){
			socketSend($("#resultReadPMBusByte").val());
		}
	});

	
	$("#TESTI2CSCL").click(function(){								
		socketSend("TESTI2CSCL:");
	});

	$("#TESTI2CSDA").click(function(){								
		socketSend("TESTI2CSDA:");
	});

	$("#SCANI2CREGS").click(function(){
		var decaddr = parseInt($('#addrToTest').val(),16);
		var decregister = parseInt($('#regToTest').val(),16);
		var bytes2r = $('#bytesToRead').val();
		if(bytes2r == 1){
			socketSend("I2CREADBYTE:" + decaddr + ":" + decregister + ":");
		}else if(bytes2r == 2){
			socketSend("I2CREADWORD:" + decaddr + ":" + decregister + ":");
		}else{
			socketSend("SCANI2CREGS:" + decaddr + ":" + decregister + ":" + bytes2r + ":");
		}
		
	});


	for (var i = 1000; i < 66000; i += 1000) {
		$('#selTimeout').append($('<option>', {
			value: i,
			text: i
		}));
	}
	$('#selTimeout').val("50");

	$("#setTimeout").click(function(){								
		var timeout = $("#selTimeout").val();
		var textStr = "WIRESETTIMEOUT:" + timeout + ":";
		socketSend(textStr);
	});
	*/
	
	$('#dsxLocation').val("1");
		for (var i = 1; i < 128; i++) {
		$('#dsxLocation').append($('<option>', {
			value: i,
			text: i
		}));
	}
	$('#dsxLocation').val("1");
	
	for (var i = 0; i < 129; i++) {
		$('#dsxAddress').append($('<option>', {
			value: i,
			text: i
		}));
	}
	$('#dsxAddress').val("0");
	
	for (var i = 1; i < 9; i++) {
		$('#dsxOutput').append($('<option>', {
			value: i,
			text: i
		}));
	}
	$('#dsxOutput').val("1");
	
	
	//Fill the seconds, minutes, hours select boxes
	for (var i = 0; i < 60; i++) {
		$('#selInputSeconds').append($('<option>', {
			value: i,
			text: i
		}));
	}	
	for (var i = 0; i < 60; i++) {
		$('#selInputMinutes').append($('<option>', {
			value: i,
			text: i
		}));
	}
	for (var i = 0; i < 25; i++) {
		$('#selInputHours').append($('<option>', {
			value: i,
			text: i
		}));
	}
	
	$("#genDSXCommand").click(function(){								
		var location = $("#dsxLocation").val();         // This is the LOCATION (Don't enter 0, error...)
		var address = $("#dsxAddress").val();          	// This is the DOOR address (ZERO is the Master)
		var output = $("#dsxOutput").val();           	// This is the OUTPUT (Don't enter 0, we'll take care of that...)
		var outputFunction = $("#dsxFunction").val();	// This is the FUNCTION (1 = Unlock 2=Lock 3=Timezone 4=Grant Access)
		
		var locHex = (location).toString(16);
		if(locHex.length == 1){
			locHex = "0" + locHex;
		}
		output--;
		var textStr = ("0F" + locHex + "00FFIO " + address + " " + output + " " + outputFunction + " ").toUpperCase();
		let length = textStr.length;
		var subTot = 0;
		for (let i = 0; i < length; i++) {
		  subTot += textStr.charCodeAt(i);
		}
		var checksum = ((subTot % 256).toString(16)).toUpperCase();
		command;
		
		
		if ($(".radUDPHostConn:checked").val() == 'useWifiUDP') {
			//command = "HTTP://" + $("#txtWifiIP").val() + "/serial?string=SERIAL:>";
			command = "HTTP://" + $("#txtWifiIP").val() + "/serial?string=SERIAL`>";
		}else{
			//command = "HTTP://" + $("#txtEthIP").val() + "/serial?string=SERIAL:>";
			command = "HTTP://" + $("#txtEthIP").val() + "/serial?string=SERIAL`>";
		}
		command += textStr + "03" + checksum;
		//command = "SERIAL:>" + textStr + "03" + checksum;
		$("#resultDSXCommand").val(command);
		$("#runDSXCommand").attr("href", command);
		if($('#divResultDSXCommand').hasClass("d-none")){
			$('#divResultDSXCommand').toggleClass('d-block d-none');		
		}
		//console.log("Copy the following command to inject it into DSX");
		//console.log(command);
	});

	$("#copyDSXCommand").click(function(){								
		const element = document.querySelector("#resultDSXCommand");
		//window.clipboardData.setData("Text", copyText.innerText);
		element.focus();
		element.select();
		element.setSelectionRange(0, 99999); // For mobile devices	
		try {
			var successful = document.execCommand('copy');
			var msg = successful ? 'successful' : 'unsuccessful';
				console.log('Copying text command was ' + msg);
			} catch (err) {
			console.log('Oops, unable to copy');
		}
		//navigator.clipboard.writeText(copyText.value);
		$("#infoModalBody").html('The DSX Command has been copied to the clipboard.');
		$('#infoModal').modal('show');
	});
	
	$("#runDSXCommand").click(function(){								
		/*
		var copyText = document.getElementById("resultDSXCommand");
		copyText.select();
		copyText.setSelectionRange(0, 99999); // For mobile devices	
		navigator.clipboard.writeText(copyText.value);
		$("#infoModalBody").html('The DSX Command has been copied to the clipboard.');
		$('#infoModal').modal('show');
		*/
	});
	
	/*
	$("#selInputHours").change(function(){								
		if ($(this).val() === "24") {
			$("#selInputSeconds").val('0');
			$("#selInputMinutes").val('0');
		}
	});	
	
	$("#selInputMinutes").change(function(){								
		if ($("#selInputHours").val() === "24") {
			$("#selInputSeconds").val('0');
			$("#selInputMinutes").val('0');
		}
	});		
	
	$("#selInputSeconds").change(function(){								
		if ($("#selInputHours").val() === "24") {
			$("#selInputSeconds").val('0');
			$("#selInputMinutes").val('0');
		}
	});
	
	//*****************************This function handles the ID UPDATE INPUT CLICK button************************************
	$("#updateInput").click(function() {								
		var hoursValue = $("#selInputHours").val();
		var minutesValue = $("#selInputMinutes").val();
		var secondsValue = $("#selInputSeconds").val();
		var totalMilliseconds = ((hoursValue * 60 * 60) + (minutesValue * 60) + secondsValue) * 1000;
		if(totalMilliseconds == 0){
			$("#defInputSet").prop('checked', false);
			$("#selInputHours").prop('disabled', true);
			$("#selInputMinutes").prop('disabled', true);
			$("#selInputSeconds").prop('disabled', true);			
		}
		//command = "SETDEFINPUT:" + totalMilliseconds + "\n:";
		command = "SETDEFINPUT`" + totalMilliseconds + "\n:";
	    socketSend(command);
	});

	$("#defInputSet").change(function() {								
		if ($(this).is(":checked")) {
			$("#selInputHours").prop('disabled', false);
			$("#selInputMinutes").prop('disabled', false);
			$("#selInputSeconds").prop('disabled', false);
		} else {
			$("#selInputSeconds").val('0');
			$("#selInputMinutes").val('0');
			$("#selInputHours").val('0');
			$("#selInputHours").prop('disabled', true);
			$("#selInputMinutes").prop('disabled', true);
			$("#selInputSeconds").prop('disabled', true);
		}
	});
	*/
	
  document.getElementById('btnDownload').addEventListener('click', () => {
	if ($("#lblFilename").text() != "Select a file"){
		document.getElementById('frmDLFile').submit();
	}else{
		$("#infoModalBody").html('No file selected.');
		$("#infoModal").modal('show');
		return;
	}
  });
  
	const actualBtn = document.getElementById('actual-btn');
	const fileChosen = document.getElementById('file-chosen');
	actualBtn.addEventListener('change', function(){
		fileChosen.textContent = this.files[0].name;
	});
	
	$('.custom-file-input').on('change', function() { 
		let fileName = $(this).val().split('\\').pop(); 
		$(this).next('.custom-file-label').addClass("selected").html(fileName); 
   	});

	//*****************************This function handles automatic collapsing of the navbar after clicking a link**************
	$('.navbar-nav>li>a').on('click', function(){
	    $('.navbar-collapse').collapse('hide');
	});
    
	$(document).on('click', '.fileButton', function()
	{
	    $('.fileList li button').removeClass('selected btn-dark'); // removes the "selected" class from all tabs
	    $('.fileList li button').addClass('btn-outline-dark'); // removes the "selected" class from all tabs
	    $(this).removeClass('btn-outline-dark'); // adds it to the one that's just been clicked
	    $(this).addClass('selected btn-dark'); // adds it to the one that's just been clicked
	   $("#lblFilename").text($(this).text());
	   $("#download").val($(this).text());
	   //$("#DLFileName").val($(this).text());
	   $("#download").val($(this).text());
	});


	//*****************************This function handles the CLASS "clsDeleteFile" CLICK button************************************
	$(".clsDeleteFile").click(function() {								
		if ($("#lblFilename").text() != "Select a file"){
	    	//socketSend('DELETEFILE:' + $("#lblFilename").text());
	    	socketSend('DELETEFILE`' + $("#lblFilename").text());
	    }else{
			$("#infoModalBody").html('No file selected.');
			$("#infoModal").modal('show');
			return;
	    }
	});


	//*****************************This function handles the CLASS "clsDloadFile" CLICK button************************************
	//-------------This function needs late binding, hence NOT defined as $(".clsDloadFile").click(function()---------------------
	$(document).on('click', '.clsDloadFile', function () {								
		if ($("#lblFilename").text() != "Select a file"){
			console.log('DOWNLOADFILE:' + $("#lblFilename").text());
	    	socketSend('DOWNLOADFILE:' + $("#lblFilename").text());
	    }else{
			$("#infoModalBody").html('No file selected.');
			$("#infoModal").modal('show');
			return;
	    }
	});

	$("#cancelFilelist").click(function() {								
	    $('.fileList li button').removeClass('selected btn-danger'); // removes the "selected" class from all tabs
	    $('.fileList li button').addClass('btn-outline-dark'); // removes the "selected" class from all tabs
	    $("#lblFilename").text('Select a file');
	});

	$("#listSpiffsFile").click(function() {
		$("#closeFilelist").css("display", "");
		$("#okFilename").css("display", "none");
		$("#cancelFilelist").css("display", "none");
		$("#btnDownload").css("display", "none");
		
		$("#lblFilename").css("display", "none");
		$("#filelist-modal-title").text('File Listing');
		$('#fileList').empty();
		filenameArray.length = 0;
		//socketSend("LISTFILES:");
		socketSend("LISTFILES`");
	});

	$("#dloadSpiffsFile").click(function() {
		$("#cancelFilelist").css("display", "");
		$("#btnDownload").css("display", "");
		$("#okFilename").css("display", "none");
		$("#closeFilelist").css("display", "none");
		
		$("#frmDownload").css("display", "block");		
		$("#lblFilename").css("display", "block");
		$("#filelist-modal-title").text('Download File');								
		$('#fileList').empty();
		filenameArray.length = 0;
		//socketSend("LISTFILES:");
		socketSend("LISTFILES`");
	});
	
	$("#delSpiffsFile").click(function() {
		$("#cancelFilelist").css("display", "");
		$("#okFilename").css("display", "");
		$("#frmDownload").css("display", "none");
		$("#btnDownload").css("display", "none");
		
		$("#closeFilelist").css("display", "none");		
		$("#lblFilename").css("display", "block");
		$("#filelist-modal-title").text('Delete File');								
		$('#fileList').empty();
		filenameArray.length = 0;
		//socketSend("LISTFILES:");
		socketSend("LISTFILES`");
	});


	//*****************************This function handles the ID "Update WiFi Settings" CLICK ************************************
	$("#updateWifi").click(function() {								
		if ($("#txtwifiSSID").val() != ""){
			//command = "SETSSIDPASS:" + $("#txtwifiSSID").val() + "\n" + $("#txtwifiPass").val() + "\n";	//SETSSIDPASS:WiFiSSID\nWiFiPassword\n
			command = "SETSSIDPASS`" + $("#txtwifiSSID").val() + "\n" + $("#txtwifiPass").val() + "\n";	//SETSSIDPASS:WiFiSSID\nWiFiPassword\n
			$("#ynModalBody").html('Are you sure you would like to join the ' + $("#txtwifiSSID").val() + ' network?');
			//$("#ynModalOK").data('cmd', 'updateWifi');
			$("#ynModal").modal('show');
	    }else{
			$("#infoModalBody").html('The WiFi SSID cannot be blank.');
			$("#infoModal").modal('show');
	    }
	});
	
	//*****************************This function handles the ID "Delete WiFi Settings" CLICK ************************************
	$("#deleteWifi").click(function() {								
		//command = "DELETEWIFI:";
		command = "DELETEWIFI`";
		$("#ynModalBody").html('Are you sure you would like to delete the WiFi Network Settings?<br>NOTE: All WiFi IP Address Settings will also be deleted.');
		$("#ynModalOK").data('cmd', 'deleteWifi');
		$("#ynModal").modal('show');
	});
	
	//*****************************This function handles the ID "Update Network Settings" (WiFi) CLICK ************************************
	$("#updateWifiNetwork").click(function() {								
		if (ValidateIPaddress($("#txtWifiIP").val()) == false){ //Returned false
			$("#infoModalBody").html('The Static IP Address cannot be blank or is not formatted correctly.');
			$("#infoModal").modal('show');
			$("#txtWifiIP").focus();
			return;
		}
		if (ValidateIPaddress($("#txtWifiGateway").val()) == false){ //Returned false
			$("#infoModalBody").html('The Gateway IP Address cannot be blank or is not formatted correctly.');
			$("#infoModal").modal('show');
			$("#txtWifiGateway").focus();
			return;
		}
		if (ValidateIPaddress($("#txtWifiSubnet").val()) == false){ //Returned false
			$("#infoModalBody").html('The Subnet Mask cannot be blank or is not formatted correctly.');
			$("#infoModal").modal('show');
			$("#txtWifiSubnet").focus();
			return;
		}
		if (ValidateIPaddress($("#txtWifiDNS").val()) == false){ //Returned false
			$("#infoModalBody").html('The DNS IP Address cannot be blank or is not formatted correctly.');
			$("#infoModal").modal('show');
			$("#txtWifiDNS").focus();
			return;
		}
		//command = "SETWIFIIP:" + 
		command = "SETWIFIIP`" + 
			$("#txtWifiIP").val() + "\n" +
			$("#txtWifiGateway").val() + "\n" +
			$("#txtWifiSubnet").val() + "\n" +
			$("#txtWifiDNS").val() + "\n";
					
		$("#ynModalBody").html('Are you sure you would like to update the <b>WiFi</b> IP Address Settings to the following?<br><br>' + 
								'IP Address: ' + $("#txtWifiIP").val() + '<br>' +
								'Gateway: ' + $("#txtWifiGateway").val() + '<br>' +
								'Subnet: ' + $("#txtWifiSubnet").val() + '<br>' +
								'DNS: ' + $("#txtWifiDNS").val());
		//$("#ynModalOK").data('cmd', 'updateWifiIp');
		$("#ynModal").modal('show');	
	});
	
	//*****************************This function handles the ID "Set Network To DHCP" CLICK ************************************
	$("#updateWifiDHCP").click(function() {								
		//command = "DELETEFILE:wifiIP.txt";
		command = "DELETEFILE`wifiIP.txt";
		$("#ynModalBody").html('Are you sure you would like to set the <b>WiFi</b> to DHCP?');
		$("#ynModalOK").data('cmd', 'wifiDHCP');
		$("#ynModal").modal('show');
	});

	//*****************************This function handles the ID "Update Network Settings" (Eth) CLICK ************************************
	$("#updateEthNetwork").click(function() {								
		if (ValidateIPaddress($("#txtEthIP").val()) == false){ //Returned false
			$("#infoModalBody").html('The Static IP Address cannot be blank or is not formatted correctly.');
			$("#infoModal").modal('show');
			$("#txtEthIP").focus();
			return;
		}
		if (ValidateIPaddress($("#txtEthGateway").val()) == false){ //Returned false
			$("#infoModalBody").html('The Gateway IP Address cannot be blank or is not formatted correctly.');
			$("#infoModal").modal('show');
			$("#txtEthGateway").focus();
			return;
		}
		if (ValidateIPaddress($("#txtEthSubnet").val()) == false){ //Returned false
			$("#infoModalBody").html('The Subnet Mask cannot be blank or is not formatted correctly.');
			$("#infoModal").modal('show');
			$("#txtEthSubnet").focus();
			return;
		}
		if (ValidateIPaddress($("#txtEthDNS").val()) == false){ //Returned false
			$("#infoModalBody").html('The DNS IP Address cannot be blank or is not formatted correctly.');
			$("#infoModal").modal('show');
			$("#txtEthDNS").focus();
			return;
		}
		//command = "SETETHIP:" + 
		command = "SETETHIP`" + 
			$("#txtEthIP").val() + "\n" +
			$("#txtEthGateway").val() + "\n" +
			$("#txtEthSubnet").val() + "\n" +
			$("#txtEthDNS").val() + "\n";
		/*
		command = "SETETHIP:" + 
			"41:43:53:30:30:31\n" +
			$("#txtEthIP").val() + "\n" +
			$("#txtEthGateway").val() + "\n" +
			$("#txtEthSubnet").val() + "\n" +
			$("#txtEthDNS").val() + "\n";
		*/		
		$("#ynModalBody").html('Are you sure you would like to update the <b>Ethernet</b> IP Address Settings to the following?<br><br>' + 
								'IP Address: ' + $("#txtEthIP").val() + '<br>' +
								'Gateway: ' + $("#txtEthGateway").val() + '<br>' +
								'Subnet: ' + $("#txtEthSubnet").val() + '<br>' +
								'DNS: ' + $("#txtEthDNS").val());
		//$("#ynModalOK").data('cmd', 'updateEthIp');
		$("#ynModal").modal('show');	
	});
	
	//*****************************This function handles the ID "Set Network To DHCP" CLICK ************************************
	$("#updateEthDHCP").click(function() {								
		//command = "DELETEFILE:ethIP.txt";
		command = "DELETEFILE`ethIP.txt";
		$("#ynModalBody").html('Are you sure you would like to set the <b>Ethernet</b> to DHCP?');
		$("#ynModalOK").data('cmd', 'ethDHCP');
		$("#ynModal").modal('show');
	});
	
	$("#ynModalOK").click(function() {								
		var cmd = $("#ynModalOK").data('cmd'); //getter
		switch(cmd){
			case "disableUDP":
				$("#txtudpIP").val('');
				$("#txtRemoteHost").val('');
				$("#txtRemotePort").val('');
				break;
			case "deleteWifi":
				$("#txtwifiSSID").val("");
				$("#txtwifiPass").val("");
				$("#txtWifiIP").val("");
				$("#txtWifiGateway").val("");
				$("#txtWifiSubnet").val("");
				$("#txtWifiDNS").val("");
				break;
			default:
		}
		console.log(command);
		socketSend(command);
	});

	//*****************************This function handles the ID UPDATE SERIAL CLICK button************************************
	$("#updateSerPort").click(function() {								
		var br = parseInt($("#baudrate").val()); // This one doesn't need any math
		var db = parseInt($("#dataBits").val());
		var pb = parseInt($("#parityBit").val());
		var sb = parseInt($("#stopBits").val());
		var sum = db + pb + sb;
		// This code added for ESP32
		// The sum is equal to the arrSerConfigs[index]
		sum /= 2;
		var txtBR = $("#baudrate option:selected").text();
		var txtDB = $("#dataBits option:selected").text();
		var txtPB = $("#parityBit option:selected").text();
		var txtSB = $("#stopBits option:selected").text();
		
	    //command = "SETSERIAL:" + br + "\n" + sum + "\n";	//SETSERIAL:#\n#\n
	    command = "SETSERIAL`" + br + "\n" + sum + "\n";	//SETSERIAL:#\n#\n
		
		$("#ynModalBody").html('Are you sure you would like to set the Serial Port Settings to the following?<br><br>' + 
							'Baudrate: ' + txtBR + '<br>' +
							'Data Bits: ' + txtDB + '<br>' +
							'Parity Bit: ' + txtPB + '<br>' +
							'Stop Bit(s): ' + txtSB);
		$("#ynModal").modal('show');
		//socketSend(command);
	});

	//*****************************This function handles the ID UPDATE RELAY CLICK button************************************
	/*
	$("#updateRelay").click(function() {								
		if ($("#defRelayStat").is(":checked")) {
			command = "SETDEFOUT:1\n:";
		} else {
			command = "SETDEFOUT:0\n:";
		}
	    socketSend(command);
	});
	*/
	
	//*****************************This function handles the ID UPDATE SERIAL CLICK button************************************
	var udpHostString;
	var udpConnection;
	var adapter;
	var udpMethod;
	var udpPort;
		
	$("#updateUDP").click(function() {								
        if ($('#enableUDP').is(":checked")) {
			var udpIP = $("#txtRemoteIP").val();
			var udpHostName = $("#txtRemoteHost").val();
			udpPort = $("#txtRemotePort").val();
		  if ($(".radUDPHostMethod:checked").val() == 'ipHost') {
			var checkIP = ValidateIPaddress(udpIP);// Validate IP
			if(!checkIP){
				$("#infoModalBody").html('The "Remote IP Address" cannot be blank or is not formatted correctly.');
				$('#infoModal').modal('show');
				$("#txtRemoteIP").focus();				
				//$('#enableUDP').prop('checked', false);
				return;
			}
          }else{
              if (!validateURL(udpHostName)) {
				$("#infoModalBody").html('The "Remote Host URL" cannot be blank or is not formatted correctly.');
				$('#infoModal').modal('show');
				$("#txtRemoteHost").focus();				
				//$('#enableUDP').prop('checked', false);
				return;
            }          
          }
			var checkPort = Validate16bit(udpPort);
			if(!checkPort){
 				$("#infoModalBody").html("UDP Port must be between 1 and 65535.");
				$('#infoModal').modal('show');
				$("#txtudpPort").focus();
				//$('#enableUDP').prop('checked', false);
				return;
			}
			if ($(".radUDPHostConn:checked").val() == 'useWifiUDP') {
				UDPConnection = 'WIFI';
				adapter = 'WiFi';
			}else{
				UDPConnection = 'ETH';
				adapter = 'Ethernet';
			}
			if ($(".radUDPHostMethod:checked").val() == 'ipHost') {
				udpMethod = 'IP';
				udpHostString = udpIP;
				$("#txtRemoteHost").val("");
			}else{
				udpMethod = 'URL';
				udpHostString = udpHostName;
				$("#txtRemoteIP").val("");
			}
			//command = "SETUDP:" + udpMethod + "\n" + udpHostString + "\n" + udpPort + "\n" + UDPConnection + "\n";
			command = "SETUDP`" + udpMethod + "\n" + udpHostString + "\n" + udpPort + "\n" + UDPConnection + "\n";
			$("#ynModalBody").html('Are you sure you would like to <b>enable</b> the Remote UDP Connection with the following?<br><br>' + 
								'Remote Host: ' + udpHostString + '<br>' +
								'Remote Port: ' + udpPort + '<br>' +
								'Using Adapter: ' + adapter);
			$("#ynModalOK").data('cmd', 'enableUDP');
			$("#ynModal").modal('show');
			//command = "SETUDP:" + udpMethod + "\n" + udpHostString + "\n" + udpPort + "\n" + UDPConnection + "\n";
		} else {
			//command = 'DELETEFILE:udpSettings.txt';
			command = 'DELETEFILE`udpSettings.txt';
			$("#ynModalBody").html('Are you sure you would like to <b>disable</b> the Remote UDP Connection?'); 
			$("#ynModalOK").data('cmd', 'disableUDP');
			$("#ynModal").modal('show');
		}
	});
	
	/*
	$("#useWifiUDP").click(function() {								
		var udpIP = $("#udpIP").val();
		var udpPort = $("#udpPort").val();
		if ($('#useWifiUDP').is(":checked")) {
			// Validate IP and Port
			var checkIP = ValidateIPaddress(udpIP);
			if(!checkIP){
				$("#infoModalBody").html('The "Remote IP Address" cannot be blank or is not formatted correctly.');
				$('#infoModal').modal('show');
				$("#udpIP").focus();				
				$('#useWifiUDP').prop('checked', false);
				return;
			}
			var checkPort = Validate16bit(udpPort);
			if(!checkPort){
 				$("#infoModalBody").html("UDP Port must be between 1 and 65535.");
				$('#infoModal').modal('show');
				$("#udpPort").focus();
				$('#useWifiUDP').prop('checked', false);
				return;
			}
			useUDP = "1";
			// Lock the inputs
			$("#udpIP").attr("disabled", true);
			$("#udpPort").attr("disabled", true);
		} else {
			useUDP = "0";
			$("#udpIP").attr("disabled", false);
			$("#udpPort").attr("disabled", false);
		}
		//alert("USEUDP:" + useUDP + "\n");
		command = "SETUDP:" + udpIP + "\n" + udpPort + "\n" + useUDP + "\n";
	    socketSend(command);
	});	
	*/
	
	$("#chkLogAllSerial").change(function() {								
		//command = "LOGALLSERIAL:";
		command = "LOGALLSERIAL`";
		if (this.checked) {
			command += "1";
		} else {
			command += "0";
		}
		//command += ":";
		command += "`";
	    socketSend(command);
	});
	
	$('input[type=radio][name=radRemoteHost]').change(function() {
    	if (this.value == 'ipHost') {
        	// txtRemoteHost
			$("#txtRemoteIP").prop("disabled", false);
			$("#txtRemoteHost").prop("disabled", true);
    	}else{
        	// ...
			$("#txtRemoteIP").prop("disabled", true);
			$("#txtRemoteHost").prop("disabled", false);
    	}
	});
	
	$('#timeout').on('change', function() {
		//socketSend("SERTIMEOUT:" + this.value + ":");
		socketSend("SERTIMEOUT`" + this.value + ":");
	});
	

	$("#btnTest").click(function() {								
		$('#passModal').modal('show');
	});
	
	$("#txtWSOldPass").keyup(function(){
		if($(this).val() == ""){
			$("#txtWSNewPass1").prop("disabled", true);
		}else{
			$("#txtWSNewPass1").prop("disabled", false);
		}
	});
	
	$("#txtWSNewPass1").keyup(function(){
		CheckPassword1();
	});
	
	function CheckPassword1(){
		var myInput = $("#txtWSNewPass1").val();
		// Validate lowercase letters
		var lowerCaseLetters = /[a-z]/g;
		if (lowerCaseLetters.test(myInput)) {
		//if(myInput.value.match(lowerCaseLetters)) {
			$("#letter").removeClass("invalid");
			$("#letter").addClass("valid");
		} else {
			$("#letter").removeClass("valid");
			$("#letter").addClass("invalid");
		}
		// Validate capital letters
		var upperCaseLetters = /[A-Z]/g;
		if (upperCaseLetters.test(myInput)) {
		//if(myInput.value.match(upperCaseLetters)) {
			$("#capital").removeClass("invalid");
			$("#capital").addClass("valid");
		} else {
			$("#capital").removeClass("valid");
			$("#capital").addClass("invalid");
		}
		// Validate numbers
		var numbers = /[0-9]/g;
		if (numbers.test(myInput)) {
		//if(myInput.value.match(numbers)) {
			$("#number").removeClass("invalid");
			$("#number").addClass("valid");
		} else {
			$("#number").removeClass("valid");
			$("#number").addClass("invalid");
		}
		// Validate special
		var special = /[!?.@#$%^&*_-]/g;
		if (special.test(myInput)) {
		//if(myInput.value.match(numbers)) {
			$("#special").removeClass("invalid");
			$("#special").addClass("valid");
		} else {
			$("#special").removeClass("valid");
			$("#special").addClass("invalid");
		}
		// Validate length
		if(myInput.length >= 7) {
			$("#length").removeClass("invalid");
			$("#length").addClass("valid");
		} else {
			$("#length").removeClass("valid");
			$("#length").addClass("invalid");
		}
		if($("#letter").hasClass("invalid")||$("#capital").hasClass("invalid")||$("#number").hasClass("invalid")||$("#special").hasClass("invalid")||$("#length").hasClass("invalid")){
			$("#txtWSNewPass2").prop("disabled", true);
			$("#valContainsDiv").css("display", "block");	
			$("#valErrorDiv").css("display", "none");
		}else{
			$("#txtWSNewPass2").prop("disabled", false);
			$("#valContainsDiv").css("display", "none");
			$("#valErrorDiv").css("display", "block");
		}	
	}
	
	$("#txtWSNewPass1").focus(function(){
		$("#valErrorLbl").text('The passwords do not match');
		CheckPassword1();
		$("#txtWSNewPass2").val(""); // Clear Password 2
		$("#btnSetWSPassword").prop("disabled", true);
	});

	$("#txtWSNewPass2").focus(function(){
		checkMatch();
	});

	$("#txtWSNewPass2").keyup(function(){
		checkMatch();
	});
    
	function checkMatch() {
		$("#valErrorLbl").text('The passwords do not match');
		password1 = $("#txtWSNewPass1").val();
		password2 = $("#txtWSNewPass2").val();
		if (password1 == password2) {
			$("#valErrorDiv").css("display", "none");
			$("#btnSetWSPassword").prop("disabled", false);
		}else{
			$("#valErrorDiv").css("display", "block");
			$("#btnSetWSPassword").prop("disabled", true);			
		}
	}	
	
	$("#btnCancelWSPassword").click(function() {
		$("#txtWSOldPass").val(""); // Clear Old Password
		$("#txtWSNewPass1").val(""); // Clear Password 1
		$("#txtWSNewPass1").prop("disabled", true);
		$("#txtWSNewPass2").val(""); // Clear Password 2
		$("#txtWSNewPass2").prop("disabled", true);
	}); 
	
	$("#btnSetWSPassword").click(function() {
		// First, let's send the Old password to the server for verification
		if($("#txtWSOldPass").val() == ""){
			//command = "CHKWSPASS: :";
			command = "CHKWSPASS` `";
		}else{
			//command = "CHKWSPASS:" + $("#txtWSOldPass").val() + ":";
			command = "CHKWSPASS`" + $("#txtWSOldPass").val() + "`";
		}
	    socketSend(command);		
		// If the server sent back "PWD:0" then
		// 		the txtWSOldPass DID NOT match the existing server password so:
		//		keep the passModal OPEN and do the following:
		//		$("#valErrorLbl").text('The "Existing Password" did not match. Please try again.');
		//		$("#valErrorDiv").css("display", "block");
		//		$("#txtWSOldPass").focus();
		// else the server sent back "PWD:1"
		// 		the txtWSOldPass MATCHED the existing server password so:
		//		close the modal
		//		$("#passModal").modal("toggle");
		//		prepare the command
		//		command = "MODWSPASS:" + $("#txtWSNewPass1").val();
		//		send the command
		//		socketSend(command);
		//		wait for a websocket response
	}); 

   function CheckPassword(inputtxt) {
      var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{7,15}$/;
      //var re = /^(?=.*\d)(?=.*[!@#$%^&*_-])(?=.*[a-z])(?=.*[A-Z]).{7,}$/;
	  return passw.test(inputtxt);
   }

	
function validateURL(textval) {
  var urlregex = /^((www\.)|[a-zA-Z0-9]+)(\.[a-zA-Z0-9]{2,})(\.[a-zA-Z]{2,3})(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return urlregex.test(textval);
}

	/*
	$("#upEthConn").click(function() {
		ethSocket = new WebSocket(ethSocketLocation);
	});
	*/
	
	function ValidateIPaddress(ipaddress) {  
		if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
			return (true);  
		}  
		return (false);
		}
	
    function Validate16bit(numbToValidate) {
        //event.preventDefault();
        if (isNaN(numbToValidate)||numbToValidate.trim()==""||numbToValidate=="0"||parseInt(numbToValidate)>65535) {
		  	return false;
       }
        	return true;
    }


	//*****************************This function handles the CLASS CLICK of the "HelpBtn" buttons*******************************
	$(".HelpBtn").click(function() {								
	    switch(this.id){
	    	case "wifiSSIDHelp":
	    		$("#helpModalBody").html("If you would like the Module to join a wireless network, enter the WiFi network SSID.");
	    		break;
	    	case "wifiPassHelp":
	    		$("#helpModalBody").html("Enter the WiFi network password for the SSID provided.");
	    		break;
	    	case "UDPRemoteIPHelp":
	    		$("#helpModalBody").html("If you would like all serial port data to be sent to a remote UDP host, enter the <b>IP Address</b> of the remote host.");
	    		break;
	    	case "UDPRemoteHostHelp":
 	    		$("#helpModalBody").html("If you would like all serial port data to be sent to a remote UDP host, enter the <b>URL</b> of the remote host.");               
                break;
            case "UDPRemotePortHelp":
	    		$("#helpModalBody").html("Enter the Port Number to be used by the UDP connection.");
	    		break;
	    	case "wifiIPHelp":
	    		$("#helpModalBody").html("Enter the Static IP Address you would like the <b>WiFi</b> to use.<br>Use the form of: ###.###.###.###");
	    		break;
	    	case "wifiGatewayHelp":
	    		$("#helpModalBody").html("Enter the Gateway IP Address you would like the <b>WiFi</b> to use.<br>Use the form of: ###.###.###.###");
	    		break;
	    	case "wifiSubnetHelp":
	    		$("#helpModalBody").html("Enter the Subnet Mask you would like the <b>WiFi</b> to use.<br>Use the form of: ###.###.###.###");
	    		break;
	    	case "wifiDNSHelp":
	    		$("#helpModalBody").html("Enter the DNS IP Address you would like the <b>WiFi</b> to use.<br>Use the form of: ###.###.###.###");
	    		break;
	    	case "ethIPHelp":
	    		$("#helpModalBody").html("Enter the Static IP Address you would like the <b>Ethernet</b> to use.<br>Use the form of: ###.###.###.###");
	    		break;
	    	case "ethGatewayHelp":
	    		$("#helpModalBody").html("Enter the Gateway IP Address you would like the <b>Ethernet</b> to use.<br>Use the form of: ###.###.###.###");
	    		break;
	    	case "ethSubnetHelp":
	    		$("#helpModalBody").html("Enter the Subnet Mask you would like the <b>Ethernet</b> to use.<br>Use the form of: ###.###.###.###");
	    		break;
	    	case "ethDNSHelp":
	    		$("#helpModalBody").html("Enter the DNS IP Address you would like the <b>Ethernet</b> to use.<br>Use the form of: ###.###.###.###");
	    		break;
	    	case "InputTimingSHelp":
	    		$("#helpModalBody").html("Select the total Seconds you would like relay to follow.");
	    		break;
	    	case "InputTimingMHelp":
	    		$("#helpModalBody").html("Select the total Minutes you would like relay to follow.");
	    		break;
	    	case "InputTimingHHelp":
	    		$("#helpModalBody").html("Select the total Hours you would like relay to follow.");
	    		break;
			default:
	    }
	});

	//console.log("$(document).ready(function() is finished");
	
var escapable = /[\x00-\x1f\ud800-\udfff\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufff0-\uffff]/g;

function filterUnicode(quoted){

	escapable.lastIndex = 0;
	if( !escapable.test(quoted)) return quoted;
  
	return quoted.replace( escapable, function(a){
	  return '';
	});
  }

String.prototype.escapeSpecialChars = function() {
    return this.replace(/\\n/g, "\\n")
               .replace(/\\'/g, "\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\r")
               .replace(/\\t/g, "\\t")
               .replace(/\\b/g, "\\b")
               .replace(/\\f/g, "\\f")
               .replace(/\\0/g, "\\0")
			   .replace(/ /g,"_")
			   ;
};

// Initialize WebSocket connections

wifiSocket = new WebSocket(wifiSocketLocation);

	console.log("window.location.hostname = " + window.location.hostname);
	
	
	wifiSocket.onerror = function (error) {    
		console.log('WebSocket Error ', error);
	}

	wifiSocket.onopen = function() {
		console.log('WiFi WebSocket connection opened');
	}

	wifiSocket.onclose = function(event) {
		console.log('WebSocket Closed: Event (' + event.reason + ')');
	}
	
	const scaleFactors = [0, .032, 0.0078125, 2, 0.00390625, 0.0078125, 2, 0.03125, 1, 1];

	wifiSocket.onmessage = function(event){
		
		//var inboundMsg = filterUnicode(event.data);
		var inboundMsg = event.data;
		
		//var msgArray = inboundMsg.split(":");
		var msgArray = inboundMsg.split("`");
		var $txtArea = $('#from2420Relays'); 
		
		
		//if(msgArray[0] != "WiFiPASS"){
		//	$txtArea.val($txtArea.val() +'\n' + inboundMsg);
		//	console.log(inboundMsg);
		//}else{
		//	$txtArea.val($txtArea.val() +'\nWiFiPASS:**********');
		//	console.log("WiFiPASS:**********");
		//}
		
		
		if(msgArray[0] == "WiFiNetSettings"){
			$txtArea.val($txtArea.val() +'\nWiFiNetSettings`' + msgArray[1] + '`**********');
			//handleNewMessage('WiFiNetSettings:' + msgArray[1] + ':**********');
			console.log('WiFiNetSettings`' + msgArray[1] + '`**********');
		}else{
			$txtArea.val($txtArea.val() +'\n' + inboundMsg);
			//handleNewMessage(inboundMsg);
			console.log(inboundMsg);
		}

		$txtArea.scrollTop($txtArea[0].scrollHeight);
		
		switch(msgArray[0]){
			
			case "InputRules":
				// InputRules:1|0|1|1~1|1|2|1~
				var inRulesArray = msgArray[1].split("~"); // 1|0|1|1
				for(var cnt = 0; cnt < inRulesArray.length-1; cnt++){
					// Create the new rule div here
					buildRuleDiv();
					var inc = cnt + 1;
					var ruleItems = inRulesArray[cnt].split("|");
					// ruleItems[0] = Input
					$('.inRuleInputNumb[data-rulenumb="' + inc + '"]').val(ruleItems[0]);
					// ruleItems[1] = Input State (ON or OFF) (0 or 1) ***Yes, backwards. Due to the opto-isolator***
					$('.inRuleInputStat[data-rulenumb="' + inc + '"]').val(ruleItems[1]);
					// ruleItems[2] = Output Function (ON, OFF, PULSE, SERIAL, WiFiPOST, EthPOST) (1-6)
					$('.inRuleOutputFunc[data-rulenumb="' + inc + '"]').val(ruleItems[2]);					
					// We need the Output function before we can proceed
					switch(ruleItems[2]){ 
						case "1": // ON
							// ruleItems[3] = Output Number (1-8)
							$('.inRuleOutputNumb[data-rulenumb="' + inc + '"]').val(ruleItems[3]);
							// Show the div
							$('.inRuleOutputFunc123[data-rulenumb="' + inc + '"]').attr("hidden", false);
							break;
						case "2": // OFF
							// ruleItems[3] = Output Number (1-8)
							$('.inRuleOutputNumb[data-rulenumb="' + inc + '"]').val(ruleItems[3]);					
							$('.inRuleOutputFunc123[data-rulenumb="' + inc + '"]').attr("hidden", false);
							break;
						case "3": // PULSE
							// ruleItems[3] = Output Number (1-8)
							$('.inRuleOutputNumb[data-rulenumb="' + inc + '"]').val(ruleItems[3]);					
							// ruleItems[4] = Output Pulse Time (seconds) Fuck, need to do some math here...
							var pHrs = Math.floor(parseInt(ruleItems[4]) / 3600);
							var pSecMod = parseInt(ruleItems[4]) % 3600;
							var pMin = Math.floor(pSecMod / 60);
							var pSec = pSecMod % 60;
							$('.inRuleOutputHrs[data-rulenumb="' + inc + '"]').val(pHrs.toString());					
							$('.inRuleOutputMin[data-rulenumb="' + inc + '"]').val(pMin.toString());					
							$('.inRuleOutputSec[data-rulenumb="' + inc + '"]').val(pSec.toString());					
							$('.inRuleOutputFunc123[data-rulenumb="' + inc + '"]').attr("hidden", false);
							$('.inRuleOutputFunc3[data-rulenumb="' + inc + '"]').attr("hidden", false);
							break;
						case "4": // SERIAL
							// ruleItems[3] = Serial String
							$('.inRuleSerString[data-rulenumb="' + inc + '"]').val(ruleItems[3]);					
							$('.inRuleOutputFunc4[data-rulenumb="' + inc + '"]').attr("hidden", false);
							break;
						case "5": // WiFiPOST
						case "6": // EthPOST
							// Need to tear the POST Request apart...
							//console.log(ruleItems[3]);
							$('.postServer[data-rulenumb="' + inc + '"]').val(ruleItems[6]);					
							$('.postPath[data-rulenumb="' + inc + '"]').val(ruleItems[7]);					
							$('.postType[data-rulenumb="' + inc + '"]').val(ruleItems[8]);					
							$('.postData[data-rulenumb="' + inc + '"]').val(ruleItems[9]);					
							//$('#remServer[data-rulenumb="' + inc + '"]').val();					
							//$('#remPath[data-rulenumb="' + inc + '"]').val();					
							//$('#remPostData[data-rulenumb="' + inc + '"]').val();					
							$('.inRuleOutputFunc56[data-rulenumb="' + inc + '"]').attr("hidden", false);
							break;
					}
					// Load up the next DIV
				}
				break;
			
			case "OutputStatus":
				var outputArray = msgArray[1].split(",");
				// chkOut1
				var chkOut = 0;
				for(var outCnt = 0; outCnt < 8; outCnt++){
					chkOut++;
					if(outputArray[outCnt].charAt(2) == "1"){
						$("#chkOut" + chkOut).prop( "checked", true );
					}else{
						$("#chkOut" + chkOut).prop( "checked", false );
					}					
				}
				break;
			
			case "PMBAllRegs":
				for(var ctrlCnt = 1; ctrlCnt < 10; ctrlCnt++){	// 1 to 9
					if(ctrlCnt != 3 || ctrlCnt != 6){
						var ctrl = window["g" + ctrlCnt];
						//var ctrl = "g" + ctrlCnt;
						if (ctrl && typeof ctrl.refresh === 'function') {
							var scaledVal = msgArray[ctrlCnt] * scaleFactors[ctrlCnt];
							ctrl.refresh(scaledVal);
						}
					}
				}
				break;
				
			case "PMBParam":
				// "PMBParam:%i:Address:0x%02X:register:0x%02X",wordRes,address,command
				var scaledParam = msgArray[1] * scaleFactor;
				var register = msgArray[5];
				switch(register){
					case "0x08":
						g1.refresh(scaledParam);
						break;
					case "0x0A":
						g2.refresh(scaledParam);
						break;
					case "0x0C":
						g3.refresh(scaledParam);
						break;
					case "0x0E":
						g4.refresh(scaledParam);
						break;
				}
				console.log($( "#PMBCommand option:selected" ).text() + " = " + scaledParam);
				break;
			case "WiFiNetSettings":	// "WiFiNet:%s:%s", wifiSsid, wifiPass
				$("#txtwifiSSID").val(msgArray[1]);
				$("#txtwifiPass").val(msgArray[2]);
				break;
			
			case "WifiIPSettings":
				if(msgArray[1] == "0.0.0.0"){
					$("#txtWifiIP").val("");
				}else{
					$("#txtWifiIP").val(msgArray[1]);
				}
				if(msgArray[2] == "0.0.0.0"){
					$("#txtWifiGateway").val("");
				}else{
					$("#txtWifiGateway").val(msgArray[2]);
				}
				if(msgArray[3] == "0.0.0.0"){
					$("#txtWifiSubnet").val("");
				}else{
					$("#txtWifiSubnet").val(msgArray[3]);
				}
				if(msgArray[4] == "0.0.0.0"){
					$("#txtWifiDNS").val("");
				}else{
					$("#txtWifiDNS").val(msgArray[4]);
				}
				break;
				
			case "EthIPSettings":
				if(msgArray[1] == "0.0.0.0"){
					$("#txtEthIP").val("");
				}else{
					$("#txtEthIP").val(msgArray[1]);
				}
				if(msgArray[2] == "0.0.0.0"){
					$("#txtEthGateway").val("");
				}else{
					$("#txtEthGateway").val(msgArray[2]);
				}
				if(msgArray[3] == "0.0.0.0"){
					$("#txtEthSubnet").val("");
				}else{
					$("#txtEthSubnet").val(msgArray[3]);
				}
				if(msgArray[4] == "0.0.0.0"){
					$("#txtEthDNS").val("");
				}else{
					$("#txtEthDNS").val(msgArray[4]);
				}
				break;
				
			//sprintf(charBuffer, "UDPRemoteSettings:%c:%s:%u.%u.%u.%u:%d:%s:%d",
            //IP_or_URL,udpHostname,remUdpIp[0],remUdpIp[1],remUdpIp[2],remUdpIp[3],remUdpPort,udpAdapter,useUdp);
			case "UDPRemoteSettings":
				if(msgArray[1] != "U"){
					$("#txtRemoteIP").prop("disabled", false);
					$("#txtRemoteHost").prop("disabled", true);
					$("#radIP").prop( "checked", true );	
				}else{
					$("#txtRemoteIP").prop("disabled", true);
					$("#txtRemoteHost").prop("disabled", false);
					$("#radHN").prop( "checked", true );
				}
				if(msgArray[2] != ""){
					$("#txtRemoteHost").val(msgArray[1]);
				}else{
					$("#txtRemoteHost").val("");
				}
				if(msgArray[3] != "0.0.0.0"){
					$("#txtRemoteIP").val(msgArray[1]);
				}else{
					$("#txtRemoteIP").val("");
				}				
				if(msgArray[4] != "0"){
					$("#txtRemotePort").val(msgArray[1]);
				}else{
					$("#txtRemotePort").val("");
				}
				if(msgArray[5] == "WIFI"){
					$("#useWifiUDP").prop( "checked", true );	
				}else{
					$("#useEthUDP").prop( "checked", true );
				}				
				if(msgArray[6] == "1"){
					$("#enableUDP").prop( "checked", true );
				}else{
					$("#enableUDP").prop( "checked", false );
				}
				break;
				
			case "wifiCurrentIp":
				$('#lblWifiCurrentIP').text(msgArray[1]);
				if($('#divWifiCurrentIP').hasClass("d-none")){
					$('#divWifiCurrentIP').toggleClass('d-block d-none');		
				}
				break;
				
			case "ethCurrentIp":
				if(msgArray[1] != "0.0.0.0"){
					$('#lblEthCurrentIP').text(msgArray[1]);
					$('#lblEthCurrentIP').removeClass("text-danger");
					
					//if($('#divEthCurrentIP').hasClass("d-none")){
					//	$('#divEthCurrentIP').toggleClass('d-block d-none');		
					//}
					
				}else{
					$('#lblEthCurrentIP').addClass("text-danger");
					$('#lblEthCurrentIP').text("IP Address Unavailable");
					
					//if($('#divEthCurrentIP').hasClass("d-block")){
					//	$('#divEthCurrentIP').toggleClass('d-none d-block');		
					//}
					
				}
				break;
			
			case "MSG":
				break;
			
/*			
			case "UDPRemoteMethod":	// I or U
				if(msgArray[1] != "U"){
					$("#txtRemoteIP").prop("disabled", false);
					$("#txtRemoteHost").prop("disabled", true);
					$("#radIP").prop( "checked", true );	
				}else{
					$("#txtRemoteIP").prop("disabled", true);
					$("#txtRemoteHost").prop("disabled", false);
					$("#radHN").prop( "checked", true );
				}				
				break;
			case "UDPAdapter":	// ETH or WIFI
				if(msgArray[1] == "WIFI"){
					$("#useWifiUDP").prop( "checked", true );	
				}else{
					$("#useEthUDP").prop( "checked", true );
				}				
				break;
			case "UDPRemoteHostName":
				if(msgArray[1] != ""){
					$("#txtRemoteHost").val(msgArray[1]);
				}else{
					$("#txtRemoteHost").val("");
				}
				break;
			case "UDPRemoteIPAddress":
				if(msgArray[1] != "0.0.0.0"){
					$("#txtRemoteIP").val(msgArray[1]);
				}else{
					$("#txtRemoteIP").val("");
				}				
				break;
			case "UDPPort":
				if(msgArray[1] != "0"){
					$("#txtRemotePort").val(msgArray[1]);
				}else{
					$("#txtRemotePort").val("");
				}
				break;				
			case "SerialOverUDP":
				if(msgArray[1] == "1"){
					$("#enableUDP").prop( "checked", true );
				}else{
					$("#enableUDP").prop( "checked", false );
				}
				break;
			
			*/
			case "logAllSerial":
				if(msgArray[1] == "0"){
					$("#chkLogAllSerial").prop( "checked", false );	
				}else{
					$("#chkLogAllSerial").prop( "checked", true );
				}
				break;
			case "PWD":
				if(msgArray[1] == "0"){
					$("#valErrorLbl").text('The "Existing Password" did not match. Please try again.');
					$("#valErrorDiv").css("display", "block");
					$("#txtWSOldPass").focus();					
				}else{
					$("#passModal").modal("toggle");
					command = "MODWSPASS:" + $("#txtWSNewPass1").val();
					socketSend(command);
				}
				break;
			case "softAPSSID":
				$("#softAPSSID").html(msgArray[1]);
				break;
			case "FIRMWARE":
				$("#lblFirmware").html("Firmware: " + msgArray[1]);
				break;
				
			/*
			case "WiFiSSID":
				$("#txtwifiSSID").val(msgArray[1]);
				if($("#txtwifiSSID").val() != ""){
					$("#deleteWiFi").prop("disabled", false);
				}else{
					$("#deleteWiFi").prop("disabled", true);
				}
				break;			
			case "WiFiPASS":
				$("#txtwifiPass").val(msgArray[1]);
				break;
			*/
			
			case "defInputSettings":
				//Holy Shit, here we go with some Math
				//msgArray[1] holds the unsigned long, we limit it to 24 hours, which is 3600000
				//The msgArray[1] is in milliSeconds so here we go...
				//if it's toggle, it'll be 0
				var seconds = Math.floor((msgArray[1] / 1000) % 60);
				var minutes = Math.floor((msgArray[1] / (1000*60)) % 60);
				var hours   = Math.floor((msgArray[1] / (1000*60*60)) % 24);
				$("#selInputSeconds").val(seconds);
				$("#selInputMinutes").val(minutes);
				$("#selInputHours").val(hours);
				if(msgArray[1] > 0){
					$("#defInputSet").prop('checked', true);
					$("#selInputHours").prop('disabled', false);
					$("#selInputMinutes").prop('disabled', false);
					$("#selInputSeconds").prop('disabled', false);
				}else{
					$("#defInputSet").prop('checked', false);
					$("#selInputHours").prop('disabled', true);
					$("#selInputMinutes").prop('disabled', true);
					$("#selInputSeconds").prop('disabled', true);
				}
				break;
			case "defRelayStat":
				if(msgArray[1] == "1"){
                    $("#defRelayStat").prop("checked", true);
				}else{
                    $("#defRelayStat").prop("checked", false);
				} 
				break;
			
			/*	
			case "WifiIP":
				if(msgArray[1] == "0.0.0.0"){
					$("#txtWifiIP").val("");
				}else{
					$("#txtWifiIP").val(msgArray[1]);
				}
				break;
			case "WifiGateway":
				if(msgArray[1] == "0.0.0.0"){
					$("#txtWifiGateway").val("");
				}else{
					$("#txtWifiGateway").val(msgArray[1]);
				}
				break;
			case "WifiSubnet":
				if(msgArray[1] == "0.0.0.0"){
					$("#txtWifiSubnet").val("");
				}else{
					$("#txtWifiSubnet").val(msgArray[1]);
				}
				break;
			case "WifiDNS":
				if(msgArray[1] == "0.0.0.0"){
					$("#txtWifiDNS").val("");
				}else{
					$("#txtWifiDNS").val(msgArray[1]);
				}
				break;
			case "EthIP":
				if(msgArray[1] == "0.0.0.0"){
					$("#txtEthIP").val("");
				}else{
					$("#txtEthIP").val(msgArray[1]);
				}
				break;
			case "EthGateway":
				if(msgArray[1] == "0.0.0.0"){
					$("#txtEthGateway").val("");
				}else{
					$("#txtEthGateway").val(msgArray[1]);
				}
				break;
			case "EthSubnet":
				if(msgArray[1] == "0.0.0.0"){
					$("#txtEthSubnet").val("");
				}else{
					$("#txtEthSubnet").val(msgArray[1]);
				}
				break;
			case "EthDNS":
				if(msgArray[1] == "0.0.0.0"){
					$("#txtEthDNS").val("");
				}else{
					$("#txtEthDNS").val(msgArray[1]);
				}
				break;
			*/
			
			case "Success":
				str = msgArray[1].replace("/", "");
				$('#successModalBody').html(str);
				$('#successModal').modal('show');
				break;

			case "Error":
				str = msgArray[1].replace("/", "");
				$('#errorModalBody').html(str);
				$('#errorModal').modal('show');
				break;			

			case "DLOK":
				$("#filelistModal").modal('hide');
				break;
			case "FILE":
				// FILE: filename.xxx
				str = msgArray[1].replace("/", "");
				if(str != "wsPassword.txt"){
					var cnt = filenameArray.length;
					filenameArray[cnt] = str;
				}
				//filenameArray.push(str);
				//$("#fileList").append('<li class="list-unstyled text-center my-1"><button type="button" class="btn btn-sm btn-outline-dark w-80 fileButton">' + str + '</button></li>');
				//$("#fileListing").append('<li class="list-unstyled text-center my-1"><button type="button" class="btn btn-sm btn-outline-dark w-80 fileButton">' + str + '</button></li>');
				break;			
			case "LFCOMPLETE":
				filenameArray.sort();
				let i = 0;
				while (i < filenameArray.length) {
					$("#fileList").append('<li class="list-unstyled text-center my-1"><button type="button" class="btn btn-sm btn-outline-dark w-80 fileButton">' + filenameArray[i] + '</button></li>');
					$("#fileListing").append('<li class="list-unstyled text-center my-1"><button type="button" class="btn btn-sm btn-outline-dark w-80 fileButton">' + filenameArray[i] + '</button></li>');
					i++;
				}
				break;
			case "SerialPortSettings":
				var serArray = msgArray[1].split(",");
				//serArray[0] holds the baudrate
				$("#baudrate").val(serArray[0]);
				//serArray[1] holds the mode
				var intTemp = parseInt(serArray[1]);
				switch(intTemp){
					case (intTemp < 4):
						$("#dataBits").val(intTemp * 2);
						$("#parityBit").val("0");
						$("#stopBits").val("0");
						break;
					case (intTemp < 8):
						$("#dataBits").val((intTemp * 2) - 8);
						$("#parityBit").val("0");
						$("#stopBits").val("8");
						break;
					case (intTemp < 12):
						$("#dataBits").val((intTemp * 2) - 16);
						$("#parityBit").val("16");
						$("#stopBits").val("0");
						break;
					case (intTemp < 16):
						$("#dataBits").val((intTemp * 2) - 24);
						$("#parityBit").val("16");
						$("#stopBits").val("8");
						break;
					case (intTemp < 20):
						$("#dataBits").val((intTemp * 2) - 32);
						$("#parityBit").val("32");
						$("#stopBits").val("0");
						break;
					case (intTemp < 24):
						$("#dataBits").val((intTemp * 2) - 40);
						$("#parityBit").val("32");
						$("#stopBits").val("8");
						break;
				}
				break;
			default:
		}
	}	
	
 	
});
//----------------------------------------------------END of DOM ready--------------------------------------------------------    



function validateULForm() {
	const spanValue = document.getElementById("file-chosen").innerHTML;
	if (spanValue == "No file chosen") {
		$("#infoModalBody").html('Select a file to upload.');
		$("#infoModal").modal('show');
		return false;
	}
}

	//*****************************This function sends the specified command to the ESP*****************************************
	function socketSend(msgString){
		console.log(msgString);										// DEBUG output
		wifiSocket.send(msgString);										// Send the command over the websocket connection
	}




//*****************************This function handles Digit Padding**********************************************************
function padNum(num, padlen, padchar) {
    var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
    var pad = new Array(1 + padlen).join(pad_char);
    return (pad + num).slice(-pad.length);
}


