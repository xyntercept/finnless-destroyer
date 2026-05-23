// Will this actually destroy finnless? Remains to be seen

// I also love stealing code from sisisem
function getLookahead() {
    Game.Prompt('<id ImportSave><h3>'+"Input value"+'</h3><div class="block">'+loc("Input to modify the variable.")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;">'+'</textarea></div>',[[loc("Confirm"),';Game.ClosePrompt(); Game.prefs.lookahead=Number((l(\'textareaPrompt\').value));'],loc("Cancel")]);
    l('textareaPrompt').focus();
}

function getFthofRange() {
    Game.Prompt('<id ImportSave><h3>'+"Input value"+'</h3><div class="block">'+loc("Input to modify the variable.")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;">'+'</textarea></div>',[[loc("Confirm"),';Game.ClosePrompt(); Game.prefs.fthofRange=Number((l(\'textareaPrompt\').value));'],loc("Cancel")]);
    l('textareaPrompt').focus();
}

function getFthofNeeded() {
    Game.Prompt('<id ImportSave><h3>'+"Input value"+'</h3><div class="block">'+loc("Input to modify the variable.")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;">'+'</textarea></div>',[[loc("Confirm"),';Game.ClosePrompt(); Game.prefs.fthofNeeded=Number((l(\'textareaPrompt\').value));'],loc("Cancel")]);
    l('textareaPrompt').focus();
}

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
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="getFthofNeeded();">'+loc("Set desired G!FtHoFs")+'</a><label>('+loc("set how many GFD FtHoFs near each other to search for; current value: <b>" + Game.prefs.fthofNeeded + "</b>")+')</label></div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="getFthofRange();">'+loc("Set range for G!FtHoFs")+'</a><label>('+loc("set the range within which the GFD FtHoFs must lie; current value: <b>" + Game.prefs.fthofRange + "</b>")+')</label></div>'+`));
  eval('Game.UpdateMenu='+Game.UpdateMenu.toString().replace(`created by mods")+')</label></div>':'')+`,`created by mods")+')</label></div>':'')+
    '<div class="listing"><a class="option smallFancyButton"'+Game.clickStr+'="getLookahead();">'+loc("Set lookahead")+'</a><label>('+loc("set the maximum amount of casts to search; current value: <b>" + Game.prefs.lookahead + "</b>")+')</label></div>'+`));
  
  Game.registerHook('reincarnate',function(){checkSpells()});
  Game.registerHook('reset',function(wipe){if (wipe) resetPrefs()});
}

function resetPrefs() {
  Game.prefs.lookahead = 10000;
  Game.prefs.fthofRange = 15;
  Game.prefs.fthofNeeded = 10;
}

function checkSpells() {
  let fthofs = [ ];
  let neededFthofsLocs = [ ];
  let spells = Game.Objects["Wizard tower"].minigame.spellsCastTotal;
  
  for (let i = spells; i < spells + Game.prefs.lookahead; i++)
  {
    Math.seedrandom(Game.seed+'/'+i);
    let spell = Math.random();
    if (spell > 0.125 && spell < 0.25) fthofs.push(i);

    while (fthofs[0] <= i-Game.prefs.fthofRange) fthofs.shift();

    if (fthofs.length >= Game.prefs.fthofNeeded && (neededFthofsLocs[neededFthofsLocs.length-1]-1 < i-Game.prefs.fthofRange || neededFthofsLocs.length == 0)) {
      neededFthofsLocs.push(i+1);
    }
  }
  Math.seedrandom();
  if (neededFthofsLocs.length > 0) {
    PlaySound('snd/spell.mp3');
    console.log(neededFthofsLocs);
    Game.Notify("Success!","Total of " + neededFthofsLocs.length + " locations found.<br><br>The first is at spell no. <b>" + neededFthofsLocs[0] + "</b>.<br><br> Go to the console to see them all!",[17,2]);
  }
}

Game.registerMod("Finnless Destroyer", {
  init:function(){
    checkGrimoire();
  },

  save:function(){
    let str = Game.prefs.lookahead +"|"+ Game.prefs.fthofRange +"|"+ Game.prefs.fthofNeeded;
    return str;
  },

  load:function(str){
    let prefs = str.split("|");
    Game.prefs.lookahead = prefs[0];
    Game.prefs.fthofRange = prefs[1];
    Game.prefs.fthofNeeded = prefs[2];
  }
});
