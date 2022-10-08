export var UnitTests = [

    // ------------------------------------------------------------------------
    // Attack/Health tests
    // ------------------------------------------------------------------------

    {
        'id': '1-001',
        'desc': 'kill each other - 1 of each',
        'start': {
            'p1': [ 'TST-1-1' ],
            'p2': [ 'TST-1-1' ]
        },
        'end': {
            'p1': [ ],
            'p2': [ ]
        }
    },
    {
        'id': '1-002',
        'desc': 'kill each other - 2 of each',
        'start': {
            'p1': [ 'TST-1-1', 'TST-1-1' ],
            'p2': [ 'TST-1-1', 'TST-1-1' ]
        },
        'turns': 2,
        'end': {
            'p1': [ ],
            'p2': [ ]
        }
    },
    {
        'id': '1-003',
        'desc': 'only attacker - 1 of',
        'start': {
            'p1': [ 'TST-1-1' ],
            'p2': [ ]
        },
        'end': {
            'p1': [ { 'health': 1 } ],
            'p2': [ ]
        }
    },
    {
        'id': '1-004',
        'desc': 'only attacker - 2 of',
        'start': {
            'p1': [ 'TST-1-1', 'TST-1-1' ],
            'p2': [ ]
        },
        'end': {
            'p1': [ { 'health': 1 }, { 'health': 1 } ],
            'p2': [ ]
        }
    },
    {
        'id': '1-005',
        'desc': 'only defender - 1 of',
        'start': {
            'p1': [ ],
            'p2': [ 'TST-1-1' ]
        },
        'end': {
            'p1': [ ],
            'p2': [ { 'health': 1 } ]
        }
    },
    {
        'id': '1-006',
        'desc': 'only defender - 2 of',
        'start': {
            'p1': [ ],
            'p2': [ 'TST-1-1', 'TST-1-1' ]
        },
        'end': {
            'p1': [ ],
            'p2': [ { 'health': 1 }, { 'health': 1 } ]
        }
    },
    {
        'id': '1-007',
        'desc': 'damage',
        'start': {
            'p1': [ 'TST-1-1' ],
            'p2': [ 'TST-2-2' ]
        },
        'end': {
            'p1': [ ],
            'p2': [ { 'health': 1} ]
        }
    },
    {
        'id': '1-008',
        'desc': '2 kill 1',
        'start': {
            'p1': [ 'TST-1-1', 'TST-1-1' ],
            'p2': [ 'TST-2-2' ]
        },
        'turns': 2,
        'end': {
            'p1': [ ],
            'p2': [ ]
        }
    },

    // ------------------------------------------------------------------------
    // Shield Skill
    // ------------------------------------------------------------------------

    {
        'id': '10-001',
        'desc': 'loose attack shield',
        'start': {
            'p1': [ 'TST-1-1-SH' ],
            'p2': [ 'TST-1-1' ]
        },
        'turns': 1,
        'end': {
            'p1': [ { 'health': 1 } ],
            'p2': [ ]
        }
    },
    {
        'id': '10-002',
        'desc': 'loose defend shield',
        'start': {
            'p1': [ 'TST-1-1' ],
            'p2': [ 'TST-1-1-SH' ]
        },
        'turns': 1,
        'end': {
            'p1': [  ],
            'p2': [ { 'health': 1 } ]
        }
    },
    {
        'id': '10-003',
        'desc': 'shield on shield',
        'start': {
            'p1': [ 'TST-1-1-SH' ],
            'p2': [ 'TST-1-1-SH' ]
        },
        'turns': 1,
        'end': {
            'p1': [ { 'health': 1 } ],
            'p2': [ { 'health': 1 } ]
        }
    },

    // ------------------------------------------------------------------------
    // Poison Skill
    // ------------------------------------------------------------------------

    {
        'id': '11-001',
        'desc': 'poison on larger',
        'start': {
            'p1': [ 'TST-1-1-PSN' ],
            'p2': [ 'TST-2-2' ]
        },
        'turns': 1,
        'end': {
            'p1': [ ],
            'p2': [ ]
        }
    },
    {
        'id': '11-002',
        'desc': 'larger on poison',
        'start': {
            'p1': [ 'TST-2-2' ],
            'p2': [ 'TST-1-1-PSN' ]
        },
        'turns': 1,
        'end': {
            'p1': [  ],
            'p2': [  ]
        }
    },
    {
        'id': '11-003',
        'desc': 'attack poison with more health',
        'start': {
            'p1': [ 'TST-1-3-PSN' ],
            'p2': [ 'TST-2-2' ]
        },
        'turns': 1,
        'end': {
            'p1': [ { 'health': 1 } ],
            'p2': [  ]
        }
    },
    {
        'id': '11-004',
        'desc': 'defend poison with more health',
        'start': {
            'p1': [ 'TST-2-2' ],
            'p2': [ 'TST-1-3-PSN' ]
        },
        'turns': 1,
        'end': {
            'p1': [  ],
            'p2': [ { 'health': 1 } ]
        }
    },
    {
        'id': '11-005',
        'desc': 'attack poison against shield',
        'start': {
            'p1': [ 'TST-1-1-PSN' ],
            'p2': [ 'TST-1-1-SH' ]
        },
        'turns': 1,
        'end': {
            'p1': [  ],
            'p2': [ { 'health': 1 } ]
        }
    },
    {
        'id': '11-006',
        'desc': 'shield attacks defend poison',
        'start': {
            'p1': [ 'TST-1-1-SH' ],
            'p2': [ 'TST-1-1-PSN' ]
        },
        'turns': 1,
        'end': {
            'p1': [ { 'health': 1 } ],
            'p2': [  ]
        }
    },

    // ------------------------------------------------------------------------
    // Summon Skill
    // ------------------------------------------------------------------------

    {
        'id': '12-001',
        'desc': 'summon doesnt die',
        'start': {
            'p1': [ 'TST-1-1' ],
            'p2': [ 'TST-2-2-SUM-1' ]
        },
        'turns': 1,
        'end': {
            'p1': [ ],
            'p2': [ { 'health': 1 }  ]
        }
    },
    {
        'id': '12-002',
        'desc': 'summon 1',
        'start': {
            'p1': [ 'TST-2-2' ],
            'p2': [ 'TST-2-2-SUM-1' ]
        },
        'turns': 1,
        'end': {
            'p1': [ ],
            'p2': [ { 'health': 1 }  ]
        }
    },
    {
        'id': '12-003',
        'desc': 'summon 2',
        'start': {
            'p1': [ 'TST-2-2' ],
            'p2': [ 'TST-2-2-SUM-2' ]
        },
        'turns': 1,
        'end': {
            'p1': [ ],
            'p2': [ { 'health': 1 }, { 'health': 1 }  ]
        }
    },
    {
        'id': '12-004',
        'desc': 'summon 1 verify slot (middle)',
        'start': {
            'p1': [ 'TST-2-2' ],
            'p2': [ 'TST-2-2', 'TST-2-2-WAL-SUM-1', 'TST-2-2' ]
        },
        'turns': 1,
        'end': {
            'p1': [ ],
            'p2': [ { 'health': 2 }, { 'health': 1 }, { 'health': 2 }  ]
        }
    },
    {
        'id': '12-005',
        'desc': 'summon 1 verify slot (left)',
        'start': {
            'p1': [ 'TST-2-2' ],
            'p2': [ 'TST-2-2-WAL-SUM-1', 'TST-2-2', 'TST-2-2' ]
        },
        'turns': 1,
        'end': {
            'p1': [ ],
            'p2': [ { 'health': 1 }, { 'health': 2 }, { 'health': 2 }  ]
        }
    },
    {
        'id': '12-006',
        'desc': 'summon 1 verify slot (right)',
        'start': {
            'p1': [ 'TST-2-2' ],
            'p2': [ 'TST-2-2', 'TST-2-2', 'TST-2-2-WAL-SUM-1' ]
        },
        'turns': 1,
        'end': {
            'p1': [ ],
            'p2': [ { 'health': 2 }, { 'health': 2 }, { 'health': 1 }  ]
        }
    }    
]
