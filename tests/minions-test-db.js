export var TestMinionDefs = {
    'TST-1-1': {
        'name': 'test',
        'portrait': 'piranha',
        'attack': 1,
        'health': 1,
        'skills': [ ]        
    },
    'TST-2-2': {
        'name': 'test2',
        'portrait': 'piranha',
        'attack': 2,
        'health': 2,
        'skills': [ ]        
    },
    'TST-1-1-SH': {
        'name': 'test1-sh',
        'portrait': 'piranha',
        'attack': 1,
        'health': 1,
        'skills': [ 'shield' ]        
    }, 
    'TST-1-1-PSN': {
        'name': 'test1-psn',
        'portrait': 'piranha',
        'attack': 1,
        'health': 1,
        'skills': [ 'poison' ]        
    },
    'TST-1-3-PSN': {
        'name': 'test1-psn',
        'portrait': 'piranha',
        'attack': 1,
        'health': 3,
        'skills': [ 'poison' ]        
    },    
    'TST-2-2-SUM-1': {
        'name': 'test2-summon-1',
        'portrait': 'piranha',
        'attack': 2,
        'health': 2,
        'skills': [ 'summon:TST-1-1' ]
    },
    'TST-2-2-WAL-SUM-1': {
        'name': 'test2-summon-1',
        'portrait': 'piranha',
        'attack': 2,
        'health': 2,
        'skills': [ 'wall', 'summon:TST-1-1' ]
    },    
    'TST-2-2-SUM-2': {
        'name': 'test2-summon-2',
        'portrait': 'piranha',
        'attack': 2,
        'health': 2,
        'skills': [ 'summon:TST-1-1:2' ]
    }
};
