/*
GET THE MOD: javascript:(function(){Game.LoadMod('https://raw.githack.com/xyntercept/finnless-destroyer/main/finnless-destroyer.js')})()

v1.0
2026-05-23
- Checks for number of GFD FtHoFs within a range in the lookahead
- All 3 variables can be freely changed in options
- Nothing good takes more than a day to make

v1.1
2026-05-24
- Added the ability to display the result again
- Fixed a bug where it freezes upon reincarnation if a save with the mod's save data is imported
- Made the final list display the start of the combo, rather than the end
- Added an option to show a notification even when the search fails

v1.2
2026-05-25
- Added an option to skip SE successes and RAs

v1.3
2026-05-26
- Rewrote how the spell random values are obtained
- Added an option to only add GFD FtHoFs is they could realistically resolve on a BS
- Fixed a bug where only the first result would be successfully logged to the console

v1.3.1
2026-05-28
- Tweaked how FtHoF results are collected, improving efficiency nearly twofold

v1.4
2026-05-30
- Fixed a bug where 7x offset could not be tracked
- Improved efficiency again by changing how random values are collected
- Reorganized the mod's options and added a heading and description
- Added a button to export save with correct number of spells

v1.4.1
2026-06-02
- Blocked bad-faith rehosts such as cookieclicker.ee from loading the mod

v1.4.2
2026-06-08
- Made the result notification smaller to make the mod easier to use legally

v1.4.3
2026-06-16
- Fixed a bug where the Export FD Save button would not work if there was a collision
- Rewrote some of the offset detection code

v1.4.4
2026-06-23
- Fixed a bug where the Export FD Save wouldn't work if bakery name contained a space

v1.4.5
2026-08-06
- Rewrote code to be more organized and readable, such as how FtHoF results are found
- Changed some functions so they could work while being run outside the game
*/

// Used for the Export FD Save button, stores the spellcount of the first result found
let firstComboLoc = 0;

// These are for changing settings that have a textbox as an input
function setLookahead() {
  Game.Prompt('<id ImportSave><h3>'+"Input value"+'</h3><div class="block">'+loc("Input to modify the variable.")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;">'+'</textarea></div>',[[loc("Confirm"),';Game.ClosePrompt(); Game.prefs.lookahead=Number((l(\'textareaPrompt\').value));'],loc("Cancel")]);
  l('textareaPrompt').focus();
}

function setGFthofRange() {
  Game.Prompt('<id ImportSave><h3>'+"Input value"+'</h3><div class="block">'+loc("Input to modify the variable.")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;">'+'</textarea></div>',[[loc("Confirm"),';Game.ClosePrompt(); Game.prefs.gFthofRange=Number((l(\'textareaPrompt\').value));'],loc("Cancel")]);
  l('textareaPrompt').focus();
}

function setGFthofNeeded() {
  Game.Prompt('<id ImportSave><h3>'+"Input value"+'</h3><div class="block">'+loc("Input to modify the variable.")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;">'+'</textarea></div>',[[loc("Confirm"),';Game.ClosePrompt(); Game.prefs.gFthofNeeded=Number((l(\'textareaPrompt\').value));'],loc("Cancel")]);
  l('textareaPrompt').focus();
}

// Resets mod settings to default values
function resetPrefs() {
  Game.prefs.lookahead = 10000;
  Game.prefs.gFthofRange = 14;
  Game.prefs.gFthofNeeded = 8;
  Game.prefs.notifyFailure = 0;
  Game.prefs.useSkips = 1;
  Game.prefs.checkResolve = 1;
}

// Finds the location of alltime spells cast, and replaces it with the location of the first result
function WriteSaveFD(spellLoc) {
	let name = Game.bakeryName;
	let spaces = 0;
	while (name.indexOf(" ") >= 0) {spaces++; name = name.substring(name.indexOf(" ")+1)};
  let spl = Game.WriteSave(2).split(" ");
  spl[9+spaces] = spellLoc;
  return Base64.encode(spl.join(" "));
}

// Exports the save with alltime spells cast matching that of the first result
function ExportSaveFD() {
	Game.Prompt('<id ExportSave><h3>'+loc("Export save")+'</h3><div class="block">'+loc("This is your modified save code.<br>Copy it and put it in FtHoF Planner!")+'</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;" readonly>'+WriteSaveFD(firstComboLoc)+'</textarea></div>',[loc("All done!")]);
	l('textareaPrompt').focus();l('textareaPrompt').select();
}

// If Grimoire has not been loaded, the mod will not finish initializing
function checkGrimoire() {
  let loadedFD = false;
  if (!Game.Objects["Wizard tower"].minigameLoaded) {
    Game.Notify("Grimoire not loaded","Finnless Destroyer will only initialize once Grimoire has been loaded.",[0,7]);
    Game.registerHook('logic',function(){if (Game.Objects["Wizard tower"].minigameLoaded && !loadedFD) {initFD(); loadedFD = true;}})
  }
  else {
	loadedFD = true;
    initFD();
  }
}

// Creates menu and initializes the mod
function initFD() {
  Game.Notify("Finnless destroyer","Open options menu to configure mod settings. If a desired seed is found, you will be notified upon reincarnation.",[17,2]);
  resetPrefs();

  // Settings buttons
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="checkSpells();">'+loc("Check with current settings")+'</a><label>('+loc("Run the Finnless Destroyer again with the current settings. Shortcut: shift+F")+')</label></div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing">'+Game.WritePrefButton('notifyFailure','notifyFailureButton',loc("Notify on failure ")+ON,loc("Notify on failure ")+OFF)+'<label>('+loc("when reincarnating, notify even if no results were found")+')</label><br>'+'</div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing">'+Game.WritePrefButton('useSkips','useSkipsButton',loc("Skip SE success & RA ")+ON,loc("Skip SE success & RA ")+OFF)+'<label>('+loc("skip GFD casts of Spontaneous Edifice success and Resurrect Abomination when counting combo length")+')</label><br>'+'</div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing">'+Game.WritePrefButton('checkResolve','checkResolveButton',loc("Check G!FtHoF resolve ")+ON,loc("Check G!FtHoF resolve ")+OFF)+'<label>('+loc("look for nearby building specials that GFD FtHoFs could resolve on, including offset abuse")+')</label><br>'+'</div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="setGFthofRange();">'+loc("Set range for G!FtHoFs")+'</a><label>('+loc("set the range within which the GFD FtHoFs must lie; current value: <b>" + Game.prefs.gFthofRange + "</b>")+')</label></div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="setGFthofNeeded();">'+loc("Set desired G!FtHoFs")+'</a><label>('+loc("set how many GFD FtHoFs near each other to search for; current value: <b>" + Game.prefs.gFthofNeeded + "</b>")+')</label></div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="setLookahead();">'+loc("Set lookahead")+'</a><label>('+loc("set the maximum amount of casts to search; current value: <b>" + Game.prefs.lookahead + "</b>")+')</label></div>'+`));

  // FD heading and description
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing">'+loc("Finnless Destroyer is a mod designed for the Finnless ruleset, similar to the combo finder but implemented into the game. It's designed for very large finnless combos (decacasts or higher).<br><br>For more information and a tutorial about this mod, see <a href='//tinyurl.com/FinnlessDestroyer' target='_blank'>this guide</a>.")+'</div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="title">'+loc("Finnless Destroyer")+'</div>'+`));

	// Export FD Save button
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`import: ctrl+O)")+'</label></div>'+`,`import: ctrl+O)")+'</label></div>'+
    '<div class="listing"><a class="option smallFancyButton" '+Game.clickStr+'="ExportSaveFD();PlaySound(\`snd/tick.mp3\`);">'+loc("Export FD save")+'</a><label>'+loc("Create a modified save file where the number of spells cast matches the first result found by Finnless Destroyer")+'</label></div>'+`));
  
  // shift+F to check spells again
  AddEvent(window,'keydown',function(e) {
    if (e.shiftKey && e.keyCode==70) showResults(checkSpells(Game.seed,Game.Objects["Wizard tower"].minigame.spellsCastTotal,Game.prefs.lookahead,Game.prefs.gFthofNeeded,Game.prefs.gFthofRange,Game.prefs.useSkips,Game.prefs.checkResolve));
  })

  // Checks spells upon reincarnation, resets settings upon savewipe
  Game.registerHook('reincarnate',function(){showResults(checkSpells(Game.seed,Game.Objects["Wizard tower"].minigame.spellsCastTotal,Game.prefs.lookahead,Game.prefs.gFthofNeeded,Game.prefs.gFthofRange,Game.prefs.useSkips,Game.prefs.checkResolve))});
  Game.registerHook('reset',function(wipe){if (wipe) resetPrefs()});
}

// Determines if a G!FtHoF could reasonably resolve on a BS
function isResolvable(index,spellsList) {
  if (spellsList[index][0] > 0.125 && spellsList[index][0] < 0.25) {
	// For spells that are G!FtHoF with a full pool, free skips give 1 point while non-free skips give 2 points
	// If a spell has accumulated 3 points, or checked past 7 spells, it is marked as uncastable
	let points = 0;
    for (let i = 1; i <= 7; i++) { 
      if (index+i >= spellsList.length) return 0;    
      if (spellsList[index+i][1] == 1 || spellsList[index+i][2] == 1) return 1;
      else if (i == 7) break;
      else if ((spellsList[index+i][0] > 0.375 && spellsList[index+i][0] < 0.5) || (spellsList[index+i][0] > 0.75 && spellsList[index+i][0] < 0.875) || (spellsList[index+i][0] > 0.25 && spellsList[index+i][0] < 2/7)) points += 1;
      else if (!(spellsList[index+i][0] > 0.125 && spellsList[index+i][0] < 0.25)) points += 2;
      if (points > 3) return 0;
    }
  }
		
  else {
		// For spells that aren't G!FtHoF with a full pool, a BS must be found within 2 spells
    if (index+1 >= spellsList.length) return 0;
    else if ((spellsList[index+1][1] == 1 || spellsList[index+1][2] == 1)) return 1;
		else if (index+2 >= spellsList.length) return 0;
    else if ((spellsList[index+2][1] == 1 || spellsList[index+2][2] == 1)) return 1;
  }
	
  return 0;
}

// Returns FtHoF result of a given spell as a string
function getFthofResult(backfire,seed="aaaaa",spell=-1,DF=0) {
	if (spell>-1) {Math.seedrandom(seed+"/"+spell); Math.random();};
	Math.random();
	Math.random();
	let results = [ ];
	
	let calls = [ ]
	if (backfire == 0) calls = [Math.random(),Math.random(),Math.random(),Math.random(),Math.random(),Math.random()];
	else calls = [Math.random(),Math.random(),Math.random(),Math.random()];
	
	for (let change = 0; change <= 1; change++) {
		if (backfire == 0) {
			let pool = [ ]
			pool.push("frenzy","lucky");
			if (DF == 0) pool.push("click frenzy");
			if (calls[0+change] < 0.1) pool.push("storm","storm","blab");
			if (calls[1+change] < 0.25) pool.push("building special");
			if (calls[2+change] < 0.15) pool = ["cookie storm drop"];
			if (calls[3+change] < 0.0001) pool.push("sweet");
			results.push(pool[Math.floor(calls[4+change]*pool.length)]);
		}
		else {
			let calls = [Math.random(),Math.random(),Math.random(),Math.random()];
			let pool = [ ];
			pool.push("clot","ruin");
			if (calls[0+change] < 0.1) pool.push ("cursed finger","elder frenzy");
			if (calls[1+change] < 0.003) pool.push ("sweet");
			if (calls[2+change] < 0.1) pool = ["blab"];
			results.push(pool[Math.floor(calls[3+change]*pool.length)]);
		}
	}

	return results;
}

// Check spells to find desired combos
function checkSpells(seed,startSpells,lookahead,gFthofNeeded,gFthofRange,useSkips,checkResolve) {
  let startTime = Date.now();
  let gFthofs = [ ];
  let skips = [ ];
  let comboLocs = [ ];
  let maxLength = gFthofRange;

  // Get all results in an array before analyzing
  let spellsList = [ ];
  let checkFthof = 0;
  for (let i = startSpells; i < startSpells+lookahead; i++) {
    let spellRes = [0,0,0];
    Math.seedrandom(seed+'/'+i);
    spellRes[0] = Math.random();

		// If there was a G!FtHoF recently, find if there was a BS
    if (checkFthof > 0 && spellRes[0] < 0.5) {
      let fthofResult = getFthofResult(0);
			if (fthofResult[0] == "building special") spellRes[1] = 1;
			else if (fthofResult[1] == "building special") spellRes[2] = 1;
      if (spellRes[1]+spellRes[2] > 0) checkFthof = 0;
    }
		
    if (checkFthof > 0) checkFthof--;
    if (spellRes[0] > 0.125 && spellRes[0] < 0.25) checkFthof = 7;
    else if (spellRes[0] > 0.25 && spellRes[0] < 2/7) checkFthof = Math.max(checkFthof,2);
		
    spellsList.push(spellRes);
  }

	// Check for combos
  for (let i = 0; i < lookahead; i++) {
    // Add g!fthofs to array
    if (spellsList[i][0] > 0.125 && spellsList[i][0] < 0.25 && checkResolve == 0) gFthofs.push(i);
    if (spellsList[i][0] > 0.125 && spellsList[i][0] < 2/7 && isResolvable(i,spellsList) == 1 && checkResolve == 1) gFthofs.push(i);

    if (useSkips == 1) {
      // RA
      if (spellsList[i][0] > 0.75 && spellsList[i][0] < 0.875) {
        skips.push(i);
        maxLength++;
      }
      // SE success
      else if (spellsList[i][0] > 0.375 && spellsList[i][0] < 0.5 && i+1 < lookahead) {
        if (spellsList[i+1][0] < 0.5) {
          skips.push(i)
          maxLength++;
        }
      }
      // Calculate current number of skips
      while (skips[0] <= i-maxLength) {
        skips.shift();
        maxLength--;
      }
    }

    while (gFthofs[0] <= i-maxLength) gFthofs.shift();

    if (gFthofs.length >= gFthofNeeded && comboLocs.length > 0) {
      if (comboLocs[comboLocs.length-1][0]-1 < i+startSpells-maxLength) comboLocs.push([i+1+startSpells,maxLength]);
    }
    else if (gFthofs.length >= gFthofNeeded) comboLocs.push([i+1+startSpells,maxLength]);
  }

  // Unseed to prevent CMUM 2.0
  Math.seedrandom();
	const elapsedTime = Date.now()-startTime;
	console.log("Runtime: " + elapsedTime + " ms");
	console.log((lookahead/elapsedTime) + " spells/ms");
	return comboLocs;
}

// Presents the results of checkSpells.
// Combos are stored in a 2D arrary such as [[l1,n1][l2,n2]] where l is the location of the end of the combo and n is its toal length in spells.
function showResults(comboLocs) {
	if (comboLocs.length > 0) {
    PlaySound('snd/spell.mp3');

    // Make combos start at the beginning rather than the end
    for (let i = 0; i < comboLocs.length; i++) {
      comboLocs[i] = comboLocs[i][0]-comboLocs[i][1];
    }
    firstComboLoc = comboLocs[0];
    console.log(comboLocs);
    Game.Notify(comboLocs.length + " locations found","The first is at spell no. <b>" + comboLocs[0] + "</b>.",[17,2]);
  }
  else {
    firstComboLoc = Game.Objects["Wizard tower"].minigame.spellsCastTotal;
    if (Game.prefs.notifyFailure == 1) {
			PlaySound('snd/spellFail.mp3');
    	Game.Notify("Failure...","No locations with specified settings were found.",[17,15]);
		}
  }
}

Game.registerMod("Finnless Destroyer", {
  init:function(){
		// Does not initialize the mod if a bad-faith rehost is detected
		if (l("topbarFrenzy")) {Game.Notify(loc("Fake Cookie Clicker detected"),loc("This is a fake version that is trying to scam you. Use a good-faith rehost or play the real game."),[10,6]); return;};
    checkGrimoire();
  },

  save:function(){
    const str = Game.prefs.lookahead +"|"+ Game.prefs.gFthofRange +"|"+ Game.prefs.gFthofNeeded +"|"+ Game.prefs.notifyFailure +"|"+ Game.prefs.useSkips +"|"+ Game.prefs.checkResolve;
    return str;
  },

  load:function(str){
    const prefs = str.split("|");
    Game.prefs.lookahead = parseInt(prefs[0]);
    Game.prefs.gFthofRange = parseInt(prefs[1]);
    Game.prefs.gFthofNeeded = parseInt(prefs[2]);
    Game.prefs.notifyFailure = parseInt(prefs[3]);
    Game.prefs.useSkips = parseInt(prefs[4]);
    Game.prefs.checkResolve = parseInt(prefs[5]);
  }
});
