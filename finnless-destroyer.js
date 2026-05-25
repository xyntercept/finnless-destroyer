/*
v1.0
2026-05-23
- Checks for number of GFDs within a range in the lookahead
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
*/

// Will this actually destroy finnless? Remains to be seen
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

// will not load the mod until grimoire has been loaded
function checkGrimoire() {
  var loadedFD = false;
  if (!Game.Objects["Wizard tower"].minigameLoaded) {
    Game.Notify("Grimoire not loaded","Finnless cannot be destroyed if Grimoire is not loaded.",[0,7]);
    Game.registerHook('logic',function(){if (Game.Objects["Wizard tower"].minigameLoaded && !loadedFD) {initFD(); loadedFD = true;}})
  }
  else {
    initFD();
  }
}

function initFD() {
  Game.Notify("Finnless destroyer","Open options menu to configure mod settings. If a desired seed is found, you will be notified upon reincarnation.",[17,2]);
  resetPrefs();

  // Thanks Mr. Lander
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`Autosave OFF')+'</div>'+`,`Autosave OFF')+'</div>'+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="checkSpells();">'+loc("Check with current settings")+'</a><label>('+loc("Run the Finnless Destroyer again with the current settings. Shortcut: shift+F")+')</label></div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`game will reload")+')</label><br>'+`,`game will reload")+')</label><br>'+
    Game.WritePrefButton('notifyFailure','notifyFailureButton',loc("Notify on failure ")+ON,loc("Notify on failure ")+OFF)+'<label>('+loc("when reincarnating, notify even if no results were found")+')</label><br>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`game will reload")+')</label><br>'+`,`game will reload")+')</label><br>'+
    Game.WritePrefButton('useSkips','useSkipsButton',loc("Skip SE success & RA ")+ON,loc("Skip SE success & RA ")+OFF)+'<label>('+loc("skip GFD casts of Spontaneous Edifice success and Resurrect Abomination when counting combo length")+')</label><br>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`Autosave OFF')+'</div>'+`,`Autosave OFF')+'</div>'+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="setFthofNeeded();">'+loc("Set desired G!FtHoFs")+'</a><label>('+loc("set how many GFD FtHoFs near each other to search for; current value: <b>" + Game.prefs.fthofNeeded + "</b>")+')</label></div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`Autosave OFF')+'</div>'+`,`Autosave OFF')+'</div>'+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="setFthofRange();">'+loc("Set range for G!FtHoFs")+'</a><label>('+loc("set the range within which the GFD FtHoFs must lie; current value: <b>" + Game.prefs.fthofRange + "</b>")+')</label></div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`Autosave OFF')+'</div>'+`,`Autosave OFF')+'</div>'+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="setLookahead();">'+loc("Set lookahead")+'</a><label>('+loc("set the maximum amount of casts to search; current value: <b>" + Game.prefs.lookahead + "</b>")+')</label></div>'+`));

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
}

function checkSpells() {
  let fthofs = [ ];
  let skips = [ ];
  let neededFthofsLocs = [ ];
  let spells = Game.Objects["Wizard tower"].minigame.spellsCastTotal;
  let maxLength = Game.prefs.fthofRange;
  
  for (let i = spells; i < spells + Game.prefs.lookahead; i++)
  {
    // add g!fthofs to array
    Math.seedrandom(Game.seed+'/'+i);
    let spell = Math.random();
    if (spell > 0.125 && spell < 0.25) fthofs.push(i);

    if (Game.prefs.useSkips == 1) {
      // ra
      if (spell > 0.75 && spell < 0.875) {
        skips.push(i);
        maxLength++;
      }
      // se success
      else if (spell > 0.375 && spell < 0.5) {
        Math.seedrandom(Game.seed+'/'+(i+1));
        if (Math.random() < 0.5) {
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

    if (fthofs.length >= Game.prefs.fthofNeeded && (neededFthofsLocs[neededFthofsLocs.length-1]-1 < i-maxLength || neededFthofsLocs.length == 0)) {
      neededFthofsLocs.push([i+1,maxLength]);
    }
  }

  // don't wanna pull an orteil
  Math.seedrandom();
    
  if (neededFthofsLocs.length > 0) {
    PlaySound('snd/spell.mp3');

    // make combos start at the beginning rather than the end
    for (let i = 0; i < neededFthofsLocs.length; i++) {
      neededFthofsLocs[i] = neededFthofsLocs[i][0]-neededFthofsLocs[i][1];
    }
    console.log(neededFthofsLocs);
    Game.Notify("Success!","Total of " + neededFthofsLocs.length + " locations found.<br><br>The first is at spell no. <b>" + neededFthofsLocs[0] + "</b>.<br><br> Go to the console to see them all!",[17,2]);
  }
  else if (Game.prefs.notifyFailure == 1) {
    PlaySound('snd/spellFail.mp3');
    Game.Notify("Failure...","No locations with specified settings were found.",[17,15]);
  }
}

Game.registerMod("Finnless Destroyer", {
  init:function(){
    checkGrimoire();
  },

  save:function(){
    let str = Game.prefs.lookahead +"|"+ Game.prefs.fthofRange +"|"+ Game.prefs.fthofNeeded +"|"+ Game.prefs.notifyFailure +"|"+ Game.prefs.useSkips;
    return str;
  },

  load:function(str){
    let prefs = str.split("|");
    Game.prefs.lookahead = parseInt(prefs[0]);
    Game.prefs.fthofRange = parseInt(prefs[1]);
    Game.prefs.fthofNeeded = parseInt(prefs[2]);
    Game.prefs.notifyFailure = parseInt(prefs[3]);
    Game.prefs.useSkips = parseInt(prefs[4]);
  }
});
