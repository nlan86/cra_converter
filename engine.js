		
			var craHexRegex = /0x[a-f0-9]{2}/gi;
			var craHexRegexParse = /[a-f0-9]{2}/gi;
			var craHexRegexPacketOpen = /char\s+peer\d+_\d+\[\]\s*=\s*\{/gi;
			var craHexRegexPacketNumbering = /\d_\d/i;
			var craHexRegexPacketClose = /\}\s*;/gi;
			var craOpenDelim = /{/gi;
			var craCloseDelim = /};/gi;
			var craSyntax = /^\s*(char\s+peer\d+_\d+\[\]\s*=\s*\{\s*(0x[a-f0-9]{2}\s*,\s*)*(0x[a-f0-9]{2})\s*\}\s*;\s*)+$/gmi;
			var craStrClose = " }; \n";
			var craStrOpenPart1 = "char peer";
			var craStrOpenPart2 = "[] = { ";
			var craStrBytePrefix="0x";
			var craStrByteSeparator = ", ";
			
			var normalHexRegex = /\x5cx[a-f0-9]{2}/gi;
			var normalHexRegexParse = /[a-f0-9]{2}/gi;
			var normalHexRegexPacketOpen = /char\s+peer\d+_\d+\[\]\s*=\s*\{/gi;
			var normalHexRegexPacketNumbering = /\d_\d/i;
			var normalHexRegexPacketClose = /}/gi;
			var normalHexSyntax = /^(char\s+peer\d+_\d+\[\]\s*=\s*\{(\s*\\x[a-f0-9]{2}\s*)+\}\s*)+$/gmi;
			var normalHexStrOpenerPart1="char peer";
			var normalHexStrOpenerPart2="[] = { \n";
			var normalHexStrClose="\n} \n";
			var normalHexStrBytePrefix="\\x";
			
			var asciiRepDivTagOpen = "<div contenteditable='true' class='";
			
			var absoluteRep=new Array();
			var absoluteRepSeparators=new Array();
			var absoluteDirectionsArr=new Array();
			
			var globalSeparator="\x00";
			
			var colorNeutral="#FFFFFF";
			var colorOK = '#DFF5E2';
			var colorNOTOK = '#F5E4DF';
			
			function log(str) {
				$("#log").append("\n" + str);
			}
			
			function absToCRA() {
				var retstr="";
				var packetnum=0;
				var dirCounts=new Array(0,0);
				var curdir;
				
				for (var i=0; i<absoluteRep.length; i++) {
					if (i==absoluteRepSeparators[packetnum]) {
						if (i!=0) retstr+="\n";
						retstr += craStrOpenPart1;
						curdir=absoluteDirectionsArr[packetnum];
						retstr += curdir + "_" + (dirCounts[curdir]++);
						retstr += craStrOpenPart2;
						packetnum++;
					}
			
					retstr += craStrBytePrefix + absoluteRep[i];
					
					if 
						(i+1<absoluteRep.length && i!=absoluteRepSeparators[packetnum]-1) retstr += craStrByteSeparator;
					else 
						retstr+=craStrClose;
				}
				return retstr;
			}
			
			function absToNormalHex() {
				var retstr="";
				var packetnum=0;
				var dirCounts=new Array(0,0);
				var curdir;
				
				for (var i=0; i<absoluteRep.length; i++) {
				if (absoluteRepSeparators[packetnum]==i) {
					if (packetnum!=0) retstr+="\n";
					retstr += normalHexStrOpenerPart1;
					curdir=absoluteDirectionsArr[packetnum];
					retstr += curdir + "_" + (dirCounts[curdir]++);
					retstr += normalHexStrOpenerPart2;
					packetnum++;
				}
					retstr += normalHexStrBytePrefix + absoluteRep[i];
					if (i<absoluteRep.length-1 && i!=absoluteRepSeparators[packetnum]-1) 
						retstr += "";
					else 
						retstr += normalHexStrClose;
					
				}
				return retstr;
			}
			
			function generateAsciiHTMLs(textsArr) {
				var retstr="";
				for (var packetnum=0; packetnum<textsArr.length; packetnum++) {
					log("<br>" + absoluteDirectionsArr[packetnum] + "<br>");
					retstr += asciiRepDivTagOpen + (absoluteDirectionsArr[packetnum] ? "asciieditable blue" : "asciieditable red") + "'>";
					retstr += htmlForTextWithEmbeddedNewlines(textsArr[packetnum]);
					retstr += "</div>";
				}
				return retstr;
			}
			
			function htmlForTextWithEmbeddedNewlines(text) {
				var htmls = [];
				
				var lines = text.split(/\n/);
				var tmpDiv = jQuery(document.createElement('div'));
				for (var i = 0 ; i < lines.length ; i++) {
					htmls.push(tmpDiv.text(lines[i]).html());
				}
				return htmls.join("<br>");
			}
			
			function absToAscii() {
				var retstr="";
				var curchr;
				var packetnum=1;
				var packetsTexts=new Array();
				var curtxt="";
				
				for (var i=0; i<absoluteRep.length; i++) {
					
					if (absoluteRepSeparators[packetnum]==i) {
							packetsTexts.push(curtxt);
							curtxt="";
							packetnum++;
					}
					
					curchr=parseInt(absoluteRep[i], 16);
					if (curchr==13 || curchr==10) {
						curtxt+="\n";
						if (curchr==13 && (i+1<absoluteRep.length) && (parseInt(absoluteRep[i+1], 16)==10)) //0d0a
							{
								i++;
							}
					}
					
					else {
						((curchr>=32 && curchr<=126) || (curchr<=15 && curchr>=10)) ? curtxt += String.fromCharCode(curchr) : curtxt+=".";
						}
					if (i<absoluteRep.length-1) curtxt += "";
				}
				packetsTexts.push(curtxt);
				return packetsTexts;
				
				
			}
			
			function updateAllReps(except) {
				if (except!="left") 
					$("#textleft").val(absToCRA());
				if (except!="center") 
					$("#textcenter").val(absToNormalHex());
				if (except!="right")
					$("#textright").html(generateAsciiHTMLs(absToAscii())); 
			}
			
			function updateAbsoluteArr(parseRegExStr, resultsArr) {
				absoluteRep=new Array();
				for (var i=0; i< resultsArr.length; i++) 
				{
					var regex=new RegExp(parseRegExStr);
					var res=regex.exec(resultsArr[i]);
					absoluteRep.push(res);
				}
			}
			
			function cleanNewLines(str) {
				var newstr = str.replace(/(\r\n|\n|\r)/gm," ");
				return newstr;
			}
			
			function verifySyntax(formatSyntaxRegex, str) {
				var regex=new RegExp(formatSyntaxRegex);
				var isok=regex.test(cleanNewLines(str));
				return isok;
			}
			
			
			//returns array with indexes of first byte in each packet
			function updateFirstOffsetInPackets(openDelimRegex, closeDelimRegex, normalCharRegex, numberingRegex, str) {
				var retArr=new Array();
				var regexOpen=new RegExp(openDelimRegex);
				var regexNormal=new RegExp(normalCharRegex);
				var regexClose=new RegExp(closeDelimRegex);
				

				var mode=0;
				
				var arrOpeners=new Array();
				var arrNormals=new Array();
				var arrClosers=new Array();
				var arrDirections=new Array();
				var match;
				var numberingMatch;
				
				while ((match = regexOpen.exec(str)) != null) {
					var regexNumbering=new RegExp(numberingRegex);
					arrOpeners.push(match.index);

					numberingMatch=regexNumbering.exec(match);
					//log("\n\nmatch = " + match);
					//log("\n\nnumbmatch = " + numberingMatch);
					
					arrDirections.push(numberingMatch);
				}

				while ((match = regexNormal.exec(str)) != null) {
					arrNormals.push(match.index);
				}
				
				while ((match = regexClose.exec(str)) != null) {
					arrClosers.push(match.index);
				}
				
				var o=0; //openers index
				var c=0; //closers index
				//{ n n n n n } { n n n n n }
				for (var n=0; n<arrNormals.length; n++) { 
					if (arrNormals[n] > arrOpeners[o]) {
						retArr.push(n);
						o++;
					}
					if (arrNormals[n] > arrClosers[c]) {
						//retArr.push(n-1); //NOT SURE NEEDED
						c++;
					}
				}
				absoluteRepSeparators=retArr;
				updateAbsoluteDirections(arrDirections, numberingRegex);
				
				log("\n\n SEPARATORS: " + absoluteRepSeparators.toString() + "\n\n");
			}
			
			function updateAbsoluteDirections(strArr, numberingRegex) {
				var regexNumDir=new RegExp(/\d/i);
				var match;
				var n;
				var retArr=new Array();
				
				for (var i=0; i<strArr.length; i++) {
					match = regexNumDir.exec(strArr[i]);
					n=parseInt(match);
					retArr.push(n);
				}
				absoluteDirectionsArr=retArr;
				log("\n\n DIRECTIONS: " + absoluteDirectionsArr.toString() + "\n\n");
			}
			
			function runRegexOverStr(regexStr, str) {
				var regex=new RegExp(regexStr);
				var res="";
				var retArr=new Array();
				var res=regex.exec(str);
				while (res!=null) {
					retArr.push(res);
					res=regex.exec(str);	
				}
				return retArr;
			}
			
			function setColorOK(ok, box) {
					
				$("#textleft").css('background-color', colorNeutral);
				$("#textcenter").css('background-color', colorNeutral);
				
				var color;
				
				if (ok) color=colorOK; 
				else color=colorNOTOK;
				
				if (box=="left")  
					$("#textleft").css('background-color', color);
				if (box=="center")  
					$("#textcenter").css('background-color', color);
				
			}
			
			function cleanReps() {
				absoluteRep=null;
				absoluteRepSeparators=null;
				absoluteDirectionsArr=null;
			}
			
			function textleftchange() {
				var leftText=$("#textleft").val();
				var syntaxOK=verifySyntax(craSyntax, leftText);
				if (syntaxOK) {
					var parseArr=runRegexOverStr(craHexRegex, leftText);
					updateAbsoluteArr(craHexRegexParse, parseArr);
					updateFirstOffsetInPackets(craHexRegexPacketOpen, craHexRegexPacketClose, craHexRegex, craHexRegexPacketNumbering, leftText);
					setColorOK(1, "left"); 
					updateAllReps("left");
					cleanReps();
				}
				else {
					setColorOK(0, "left"); 
				}

			}
			
			function textcenterchange() {
				var centerText=$("#textcenter").val();
				var syntaxOK=verifySyntax(normalHexSyntax, centerText);
				
				if (syntaxOK) {
					var parseArr=runRegexOverStr(normalHexRegex, centerText);
					updateAbsoluteArr(normalHexRegexParse, parseArr);
					updateFirstOffsetInPackets(normalHexRegexPacketOpen, normalHexRegexPacketClose, normalHexRegex, normalHexRegexPacketNumbering, centerText);
					setColorOK(1, "center"); 
					updateAllReps("center");
					cleanReps();
				}
				else {
					setColorOK(0, "center"); 
				}

			}
			
			//TODO
			function textrightchange() {
				var curstr="";
				var arr= $("#textright").text().split('').map (function (c) { 
					var hex=c.charCodeAt(0).toString(16); 
					if (hex.length == 1) {
						hex="0" + hex;
					}
					return hex;
				});
				updateAbsoluteArr(normalHexRegexParse, arr);
				
			}

			function onload() {
				$("#textleft").bind('input propertychange', function() { textleftchange(); });
				$("#textcenter").bind('input propertychange', function() { textcenterchange(); });
				$("#textright").bind('input propertychange', function() { textrightchange(); });
				
				absoluteRepSeparators=new Array();
				absoluteRepSeparators.push(0);
				absoluteRepSeparators.push(63);
				absoluteDirectionsArr=new Array();
				absoluteDirectionsArr.push(0);
				absoluteDirectionsArr.push(1);
				textrightchange();
				updateAllReps("all");
			}
		