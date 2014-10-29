var $editor = document.getElementById('editor');
var isFocused = false;
var keyups = Bacon.fromEventTarget(document.body, 'keyup');
var keydowns = Bacon.fromEventTarget(document.body, 'keydown');
var keypresses = Bacon.fromEventTarget(document.body, 'keypress');
var blurWindow = Bacon.fromEventTarget(window, 'blur');
var allKeyEvents = Bacon.mergeAll(keyups, keydowns, blurWindow, keypresses);

var selectionChanges = Bacon.fromEventTarget(document, 'selectionchange');
var caretChanges = selectionChanges.filter('.type', 'Caret');

var filterMappedKeys = function(keys){
    var availableKeys = Object.keys(keyMap);
    if(keys.length > 0){
        // If keycombination is unavailable look for last key 
        // (When typing fast you might have overlapping key events)
        return availableKeys.indexOf(keys.map(function(e){ return e.keyCode; }).join('+')) > -1 ||
               availableKeys.indexOf(keys[keys.length - 1].keyCode.toString()) > -1;
    }
};

caretChanges.assign(function(e){
    var selection = window.getSelection();
    var parentNode = selection.baseNode.parentNode;
    if(selection.type === 'Caret' && parentNode.dataset !== undefined && parentNode.dataset.index !== undefined){
        cursor[0] = parseInt(parentNode.dataset.index);
        cursor[1] = selection.baseOffset;
    }
});

var isEqual = function(a,b){
    return a.keyCode == b.keyCode && a.type == b.type;
};


var preventUnsafeKeys = function(e){
    if(safeKeys.indexOf(e.keyCode) < 0){
        e.preventDefault();
    }
};

var keysPressed = allKeyEvents
.doAction(preventUnsafeKeys)
.scan([], function( keys, e ){
    console.log(e.keyCode);
    var index = keys.map(function(e){ return e.keyCode; }).indexOf(e.keyCode);
    if(e.type === 'keyup' || e.type === 'blur' && index > -1){
        keys = [];
    }else if(e.type === 'keydown' && index === -1){
        keys.push(e);
    }
    return keys;
})
.filter(filterMappedKeys)
.map(function(events){
    return events.map(function(e){ return e.keyCode; });
});


// Don't prevent these keys
var safeKeys = [ 16, 17, 37, 38, 39, 40];

var keyMap = {
    '8': 'backspace',
    '13': 'enter',
    '17': 'ctrl',
    '49': '1',
    '16+49': '!',
    '50': '2',
    '16+50': '"',
    '51': '3',
    '16+51': '£',
    '52': '4',
    '16+52': '$',
    '53': '5',
    '16+53': '%',
    '54': '6',
    '16+54': '^',
    '55': '7',
    '16+55': '&',
    '56': '8',
    '16+56': '*',
    '57': '9',
    '16+57': '(',
    '48': '0',
    '16+48': ')',
    '189': '-',
    '9': 'tab',
    '20': 'capslock',
    '81': 'q',
    '16+81': 'Q',
    '87': 'w',
    '16+87': 'W',
    '69': 'e',
    '16+69': 'E',
    '82': 'r',
    '17+82': 'reload',
    '16+82': 'R',
    '84': 't',
    '16+84': 'T',
    '89': 'y',
    '16+89': 'Y',
    '85': 'u',
    '16+85': 'U',
    '73': 'i',
    '16+73': 'I',
    '79': 'o',
    '16+79': 'O',
    '80': 'p',
    '16+80': 'P',
    '219': '[',
    '16+219': '{',
    '221': ']',
    '16+221': '}',
    '65': 'a',
    '16+65': 'A',
    '83': 's',
    '16+83': 'S',
    '68': 'd',
    '16+68': 'D',
    '70': 'f',
    '16+70': 'F',
    '71': 'g',
    '16+71': 'G',
    '72': 'h',
    '16+72': 'H',
    '74': 'j',
    '16+74': 'J',
    '75': 'k',
    '32': ' ',
    '16+75': 'K',
    '76': 'l',
    '16+76': 'L',
    '186': ';',
    '16+186': ':',
    '192': '\'',
    '16+192': '@',
    '222': '#',
    '16+222': '~',
    '220': '\\',
    '16+220': '|',
    '90': 'z',
    '16+90': 'Z',
    '88': 'x',
    '17+88': 'cut',
    '16+88': 'X',
    '67': 'c',
    '16+67': 'C',
    '86': 'v',
    '16+86': 'V',
    '66': 'b',
    '16+66': 'B',
    '78': 'n',
    '16+78': 'N',
    '77': 'm',
    '16+77': 'M',
    '188': ',',
    '16+188': '<',
    '190': '.',
    '16+190': '>',
    '191': '/',
    '16+191': '?'
};

var nonInput = ['ctrl', 'backspace', 'enter', 'tabslock', 'tab'];

var doc = [];
var cursor = [-1,0];
var clipboard;

var commands = {
    enter: function(){
        this.create();
    },
    reload: function(){ window.location.reload(); },
    cut: function(){
        var userSelection = window.getSelection();
        window.u = userSelection;
        var extentNode = userSelection.extentNode.parentNode;
        var extentIndex = extentNode.dataset.index;
        var baseNode = userSelection.baseNode.parentNode;
        var baseIndex = baseNode.dataset.index;

        var extentOffset = userSelection.extentOffset;
        var baseOffset = userSelection.baseOffset;

        if(baseIndex === extentIndex){
            var range = [baseOffset, extentOffset].sort();
            var cutText = this.cutNodeText(baseIndex, range[0], range[1]);
            console.log(range);
            console.log(cutText);
            //clipboard = doc[baseIndex].split range[0]]
        }else{
        }
//        if(extentIndex > baseIndex){
//            baseRange = userSelection.
//            extentRange =
//        }
        var isReverseSelection = extentIndex > baseIndex ? false : true;

        if(baseIndex === undefined || extentIndex === undefined){
            throw new Error('Invalid selection');
        }

        console.log(baseOffset, extentOffset);
        console.log('cut', userSelection.toString());
        render();
    },

    cutNodeText: function(index, start, end){
        var result = doc[index].textContent.substr(start, end);
        doc[index].textContent = doc[index].textContent.substr(0,start) + doc[index].textContent.substr(end, doc[index].textContent.length-1);
        if(doc[index].textContent.length < 1){
            this.deleteElement(index);
        }
        return result;
    },

    deleteElement: function(row){
        row = row || cursor[0];
        if(doc.length > 0){
            doc.splice(row, 1);
            cursor[0]--;
            cursor[1] = doc[cursor[0]].textContent.length;
        }

    },
    delete: function(){
        this.deleteElement();
    },
    backspace: function(){
        if(cursor[1] > 0){
            doc[cursor[0]].textContent = 
                doc[cursor[0]].textContent.substr(0, cursor[1]-1) + 
                doc[cursor[0]].textContent.substr(cursor[1], doc[cursor[0]].textContent.length-1);
            cursor[1]--;
        }else{
            this.delete();
        }
        render();
    },
    create: function(nodeName){
        cursor[0]++;
        cursor[1] = 0;
        nodeName = nodeName || 'p';
        doc.splice(cursor[0], 0, {nodeName: nodeName, textContent: ''});
        render();
    },
    insert: function(val){
        if(doc.length <= 0){
            this.create();
        }
        var editingItem = doc[cursor[0]];
        console.log('val', val);
        editingItem.textContent = editingItem.textContent.substr(0, cursor[1]) + val + editingItem.textContent.substr(cursor[1], editingItem.textContent.length-1);
        cursor[1]+= val.length;
        render();
    }
};

var mapKey = function(keyCodes){
    var shortcut = keyMap[keyCodes.join('+')];
    if(shortcut)
        return shortcut;
    else
        return keyMap[keyCodes[keyCodes.length-1]];
};

var shortcuts = keysPressed.map(mapKey).filter(function(val){
    return val !== undefined;
});

shortcuts.assign(function(val){
    if(commands.hasOwnProperty(val)){
        commands[val]();
    }else if(nonInput.indexOf(val) < 0){
        commands.insert(val);
    }
});

$editor.addEventListener('focus', function(e){
    isFocused = true;
});

var setCursor = function(el, position){
    var range = document.createRange();
    var sel = window.getSelection();
    var hasTextNode = el.childNodes.length > 0;
    if(hasTextNode){
        range.setStart(el.childNodes[0], position);
    }else{
        el.innerHTML = '&#8203';
        range.setStart(el.childNodes[0], position);
    }
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);

};

var render = function(){
    $editor.innerHTML = '';
    _.each(doc, function(element, i){
        var el = document.createElement(element.nodeName);
        el.textContent = element.textContent;
        el.dataset.index = i;
        var extraEl = document.createElement('div');
        extraEl.textContent = 'unselectable';
        extraEl.contentEditable = false;
        extraEl.className = 'unselectable';
        $editor.appendChild(extraEl);
        $editor.appendChild(el);
        if(i === cursor[0]){
            setCursor(el, cursor[1]);
        }
    });
};

$editor.addEventListener('blur', function(e){
    isFocused = false;
});
