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
*/

// Will this actually destroy finnless? Remains to be seen

let firstComboLoc = 0;

// I also love stealing code from sisisem
function setLookahead() {
  Game.Prompt('<id ImportSave><h3>'+"Input value"+'</h3><div class="block">'+loc("Input to modify the variable.")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;">'+'</textarea></div>',[[loc("Confirm"),';Game.ClosePrompt(); Game.prefs.lookahead=Number((l(\'textareaPrompt\').value));'],loc("Cancel")]);
  l('textareaPrompt').focus();
}

function setFthofRange() {
  Game.Prompt('<id ImportSave><h3>'+"Input value"+'</h3><div class="block">'+loc("Input to modify the variable.")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;">'+'</textarea></div>',[[loc("Confirm"),';Game.ClosePrompt(); Game.prefs.fthofRange=Number((l(\'textareaPrompt\').value));'],loc("Cancel")]);
  l('textareaPrompt').focus();
}

function setFthofNeeded() {
  Game.Prompt('<id ImportSave><h3>'+"Input value"+'</h3><div class="block">'+loc("Input to modify the variable.")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;">'+'</textarea></div>',[[loc("Confirm"),';Game.ClosePrompt(); Game.prefs.fthofNeeded=Number((l(\'textareaPrompt\').value));'],loc("Cancel")]);
  l('textareaPrompt').focus();
}

function isResolvable(index,spellsList,spells) {
  let points = 0;

  if (spellsList[index][0] > 0.125 && spellsList[index][0] < 0.25) {
    for (let i = 1; i <= 7; i++) { 
      if (index+i >= spellsList.length) return 0;    
      if (spellsList[index+i][1] == 1 || spellsList[index+i][2] == 1) return 1;
      else if (i == 7) break;
      else if (spellsList[index+i][0] > 0.125 && spellsList[index+i][0] < 0.25) points += 0;
      else if ((spellsList[index+i][0] > 0.375 && spellsList[index+i][0] < 0.5) || (spellsList[index+i][0] > 0.75 && spellsList[index+i][0] < 0.875) || (spellsList[index+i][0] > 0.25 && spellsList[index+i][0] < 2/7)) points += 1;
      else points += 2;
      if (points > 3) return 0;
    }
  }
  else {
    for (let i = 1; i <= 2; i++) {
      if (index+i >= spellsList.length) return 0;
      if ((spellsList[index+i][1] == 1 || spellsList[index+i][2] == 1)) return 1;
      else if (i == 2) break;
      else if (spellsList[index+i][0] > 1/7 && spellsList[index+i][0] < 2/7) points += 0;
      else points += 1;
      if (points > 1) return 0;
    }
  }
  return 0;
}

// will not load the mod until grimoire has been loaded
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

function WriteSaveFD(spellLoc) {
  const str = Game.WriteSave(2);
  const spells = String(Game.Objects["Wizard tower"].minigame.spellsCastTotal);
  const pre = str.substring(0,str.indexOf(" "+spells+" "));
  const post = str.substring(str.indexOf(" "+spells+" ")+spells.length+2);

  return Base64.encode(pre+" "+spellLoc+" "+post);
}

function ExportSaveFD()
{
	Game.Prompt('<id ExportSave><h3>'+loc("Export save")+'</h3><div class="block">'+loc("This is your modified save code.<br>Copy it and put it in FtHoF Planner!")+'</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;" readonly>'+WriteSaveFD(firstComboLoc)+'</textarea></div>',[loc("All done!")]);
	l('textareaPrompt').focus();l('textareaPrompt').select();
}

function initFD() {
  Game.Notify("Finnless destroyer","Open options menu to configure mod settings. If a desired seed is found, you will be notified upon reincarnation.",[17,2]);
  resetPrefs();

  // Thanks Mr. Lander
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="checkSpells();">'+loc("Check with current settings")+'</a><label>('+loc("Run the Finnless Destroyer again with the current settings. Shortcut: shift+F")+')</label></div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing">'+Game.WritePrefButton('notifyFailure','notifyFailureButton',loc("Notify on failure ")+ON,loc("Notify on failure ")+OFF)+'<label>('+loc("when reincarnating, notify even if no results were found")+')</label><br>'+'</div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing">'+Game.WritePrefButton('useSkips','useSkipsButton',loc("Skip SE success & RA ")+ON,loc("Skip SE success & RA ")+OFF)+'<label>('+loc("skip GFD casts of Spontaneous Edifice success and Resurrect Abomination when counting combo length")+')</label><br>'+'</div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing">'+Game.WritePrefButton('checkResolve','checkResolveButton',loc("Check G!FtHoF resolve ")+ON,loc("Check G!FtHoF resolve ")+OFF)+'<label>('+loc("look for nearby building specials that GFD FtHoFs could resolve on, including offset abuse")+')</label><br>'+'</div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="setFthofRange();">'+loc("Set range for G!FtHoFs")+'</a><label>('+loc("set the range within which the GFD FtHoFs must lie; current value: <b>" + Game.prefs.fthofRange + "</b>")+')</label></div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="setFthofNeeded();">'+loc("Set desired G!FtHoFs")+'</a><label>('+loc("set how many GFD FtHoFs near each other to search for; current value: <b>" + Game.prefs.fthofNeeded + "</b>")+')</label></div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="setLookahead();">'+loc("Set lookahead")+'</a><label>('+loc("set the maximum amount of casts to search; current value: <b>" + Game.prefs.lookahead + "</b>")+')</label></div>'+`));

  // FD heading+desc
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing">'+loc("Finnless Destroyer is a mod designed for the Finnless ruleset, similar to the combo finder but implemented into the game. It's designed for very large finnless combos (decacasts or higher).<br><br>For more information and a tutorial about this mod, see <a href='//tinyurl.com/FinnlessDestroyer' target='_blank'>this guide</a>.")+'</div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="title">'+loc("Finnless Destroyer")+'</div>'+`));

	// modified export save
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`import: ctrl+O)")+'</label></div>'+`,`import: ctrl+O)")+'</label></div>'+
    '<div class="listing"><a class="option smallFancyButton" '+Game.clickStr+'="ExportSaveFD();PlaySound(\`snd/tick.mp3\`);">'+loc("Export FD save")+'</a><label>'+loc("Create a modified save file where the number of spells cast matches the first result found by Finnless Destroyer")+'</label></div>'+`));
  
  // shift+F to check spells again
  AddEvent(window,'keydown',function(e) {
    if (e.shiftKey && e.keyCode==70) checkSpells();
  })

  // check spells upon reincarnation, reset settings upon savewipe
  Game.registerHook('reincarnate',function(){checkSpells()});
  Game.registerHook('reset',function(wipe){if (wipe) resetPrefs()});
}

// mod preferences' default values
function resetPrefs() {
  Game.prefs.lookahead = 10000;
  Game.prefs.fthofRange = 12;
  Game.prefs.fthofNeeded = 8;
  Game.prefs.notifyFailure = 0;
  Game.prefs.useSkips = 1;
  Game.prefs.checkResolve = 1;
}

function checkSpells() {
  //let startTime = Date.now();
  let fthofs = [ ];
  let skips = [ ];
  let neededFthofsLocs = [ ];
  const spells = Game.Objects["Wizard tower"].minigame.spellsCastTotal;
  let maxLength = Game.prefs.fthofRange;

  // get all results in an array before analyzing
  let spellsList = [ ];
  let checkFthof = 0;
  for (let i = spells; i < spells + Game.prefs.lookahead; i++) {
    let spellRes = [0,0,0];
    Math.seedrandom(Game.seed+'/'+i);
    spellRes[0] = Math.random();

    if (checkFthof > 0 && spellRes[0] < 0.5) {
      Math.random();
      Math.random();
      const call0 = Math.random();
      const call1 = Math.random();
      const call2 = Math.random();
      const call3 = Math.random();
      const call4 = Math.random();
      const call5 = Math.random();

      if (call1 < 0.25 && call2 > 0.15) {
        let numElements = 3;
        if (call0 < 0.1) numElements+=3;
        const bsIndex = numElements;
        numElements++;
        if (call3 < 0.0001) numElements++;
        if (call4 > bsIndex/numElements && call4 < (bsIndex+1)/numElements) spellRes[1] = 1;
      }
      if (spellRes[1] == 0 && call2 < 0.25 && call3 > 0.15) {
        let numElements = 3;
        if (call1 < 0.1) numElements+=3;
        const bsIndex = numElements;
        numElements++;
        if (call4 < 0.0001) numElements++;
        if (call5 > bsIndex/numElements && call5 < (bsIndex+1)/numElements) spellRes[2] = 1;
      }

      if (spellRes[1]+spellRes[2] > 0) checkFthof = 0;
    }
    if (checkFthof > 0) checkFthof--;
    
    if (spellRes[0] > 0.125 && spellRes[0] < 0.25) checkFthof = 7;
    else if (spellRes[0] > 0.25 && spellRes[0] < 2/7) checkFthof = Math.max(checkFthof,2);
    spellsList.push(spellRes);
  }
  
  for (let i = 0; i < Game.prefs.lookahead; i++)
  {
    // add g!fthofs to array
    if (spellsList[i][0] > 0.125 && spellsList[i][0] < 0.25 && Game.prefs.checkResolve == 0) fthofs.push(i);
    if (spellsList[i][0] > 0.125 && spellsList[i][0] < 2/7 && isResolvable(i,spellsList,spells) == 1 && Game.prefs.checkResolve == 1) fthofs.push(i);

    if (Game.prefs.useSkips == 1) {
      // ra
      if (spellsList[i][0] > 0.75 && spellsList[i][0] < 0.875) {
        skips.push(i);
        maxLength++;
      }
      // se success
      else if (spellsList[i][0] > 0.375 && spellsList[i][0] < 0.5 && i+1 < Game.prefs.lookahead) {
        if (spellsList[i+1][0] < 0.5) {
          skips.push(i)
          maxLength++;
        }
      }
      // calculate current number of skips
      while (skips[0] <= i-maxLength) {
        skips.shift();
        maxLength--;
      }
    }

    while (fthofs[0] <= i-maxLength) fthofs.shift();

    if (fthofs.length >= Game.prefs.fthofNeeded && neededFthofsLocs.length > 0) {
      if (neededFthofsLocs[neededFthofsLocs.length-1][0]-1 < i+spells-maxLength) neededFthofsLocs.push([i+1+spells,maxLength]);
    }
    else if (fthofs.length >= Game.prefs.fthofNeeded) neededFthofsLocs.push([i+1+spells,maxLength]);
  }

  // don't wanna pull an orteil
  Math.seedrandom();
    
  if (neededFthofsLocs.length > 0) {
    PlaySound('snd/spell.mp3');

    // make combos start at the beginning rather than the end
    for (let i = 0; i < neededFthofsLocs.length; i++) {
      neededFthofsLocs[i] = neededFthofsLocs[i][0]-neededFthofsLocs[i][1];
    }
    firstComboLoc = neededFthofsLocs[0];
    console.log(neededFthofsLocs);
    Game.Notify(neededFthofsLocs.length + " locations found","The first is at spell no. <b>" + neededFthofsLocs[0] + "</b>.",[17,2]);
  }
  else if (Game.prefs.notifyFailure == 1) {
    firstComboLoc = spells;
    PlaySound('snd/spellFail.mp3');
    Game.Notify("Failure...","No locations with specified settings were found.",[17,15]);
  }
  //console.log(Date.now()-startTime);
}

Game.registerMod("Finnless Destroyer", {
  init:function(){
	if (l("topbarFrenzy")) {Game.Notify(loc("Fake Cookie Clicker detected"),loc("This is a fake version that is trying to scam you. Use a good-faith rehost or play the real game."),[10,6]); return;};
    checkGrimoire();
  },

  save:function(){
    const str = Game.prefs.lookahead +"|"+ Game.prefs.fthofRange +"|"+ Game.prefs.fthofNeeded +"|"+ Game.prefs.notifyFailure +"|"+ Game.prefs.useSkips +"|"+ Game.prefs.checkResolve;
    return str;
  },

  load:function(str){
    const prefs = str.split("|");
    Game.prefs.lookahead = parseInt(prefs[0]);
    Game.prefs.fthofRange = parseInt(prefs[1]);
    Game.prefs.fthofNeeded = parseInt(prefs[2]);
    Game.prefs.notifyFailure = parseInt(prefs[3]);
    Game.prefs.useSkips = parseInt(prefs[4]);
    Game.prefs.checkResolve = parseInt(prefs[5]);
  }
});
