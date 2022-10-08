export var MinionDefs = {
    '001': {
        'name': 'Eric the Hydra',
        'portrait': 'hydra',
        'attack': 1,
        'health': 2,
        'skills': ['wall', 'shield', 'summon:005']
    },
    '002': {
        'name': 'George the Medusa',
        'portrait': 'medusa-head',
        'attack': 2,
        'health': 2,
        'skills': ['summon:004:2']
    },
    '003': {
        'name': 'Harry the Gnome',
        'portrait': 'bad-gnome',
        'attack': 3,
        'health': 4,
        'skills': []
    },
    '004': {
        'name': 'Fish stick',
        'portrait': 'piranha',
        'attack': 1,
        'health': 1,
        'skills': []
    },    
    '005': {
        'name': 'Ears',
        'portrait': 'anubis',
        'attack': 1,
        'health': 2,
        'skills': []
    },
    '006': {
        'name': 'Blob',
        'portrait': 'fleshy-mass',
        'attack': 1,
        'health': 1,
        'skills': [ 'shield', 'poison' ]
    },
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
