
# Auto Battler

This style of game is where the player sets up the game board and then the game
auto plays it self based upon random numbers.

It comprises of

1. Setup of the board (not part of this codebase)
2. Auto play the game and generate a script of what happened
3. View the script like a movie

The thing that interested me was the game engine, as these types of games
use the _Magic the Gathering_ style of a simple set of base rules that can
be overruled by individual cards.

I also used the DOM and Webanimations API to do the display as I wanted to learn
the technologies.  As usual this is vanilla Javascript that runs in the client.

------

# Notes to be sorted out later

battle comprises of turns

a turn has an attacking player and a defending player
an attacking player minion attacks a defending player minion
resolve combat to where no more minions are attacking
end turn

battle ends when at the end of a turn a player has no minions

separate
- minion
  they have a base set of stats
  they have a base set of traits
  during a battle the stats change for the duration
  during a battle they may lose or aquire traits for the duration
  during a battle the stats or traits may be permanent
- trait
  something effects how the rules are played
  taunt, divine shield, windfury, mega windfury
- hero 
  hero powers may apply at various phases


phases
- begin battle
- player start

combat loop  (turn)
- attacking minion
  choose a minion
  apply effects before a minion attacks
- defending minion
  choose a minion
  apply effects before a minion defends
- stat & trait change
  apply effects when attack, health or traits change
- minion death
  apply effects like deathrattles
- summon minion
  apply effects when mimions are summoned

- player death
  apply effects when a player dies

- end battle

===
implementation

use a fifo for queuing up minions for combat loop
this allows for windfury, mega-windfury, attack immediately, summon and attack immediately

minion
- base
  attack, health, traits map
- battle
  attack, health, traits map

# Effects

## Combat Traits

Minions can have the following traits

- shield
- taunt
- poison
- windfury
- mega-windfury
- cleave
  attack defending minion and the minions next to it
- reborn
- summon
  (count) number of (minions)

- sneaky-hit
  attacks minion with lowest attack

- gain (trait, attack, health) when (type) minion summoned
- gain (trait, attack, health) when (type) minion died
- gain (trait, attack, health) when minion looses (trait)
- on attack something happens (e.g. trigger deathrattle)
- gain deathrattle when another minion dies

## Combat area effect traits
Some traits are not specific to the minions involved in combat.

- taunt gains (amount) when attacked
- minions gain (ammount) when lose shield
- minions gain (attack, health) when (count) minions die
- summon twice as many minions
- trigger deathrattles twice

## Deathrattles
A minion may have a trait that is triggered on it's death. A minion
can have multiple copies of deathrattles.

- (type) minions gain (trait, attack, health)
  "dragons gain shield"
- (count) minions gain (trait, attack, health)
  "1 random minions gain shield/health/attack)
  "2 random minions gain shield/health/attack)
- (amount) damage to (count) minions
  "1 damage to every minion of both players"

## Hero Powers
Hero's can have powers that trigger at certain phases.

- left and right minions attack immediately
- left minion gains shield, taunt & windfury
- one or more Traps
  each trap can trigger in a different phase.
    summon copy of mimion when attacked
    give attacked minion shield
    prevent player death
    summon a poison minion on minion death

# Battle Representation

The battle should be stored as a single file that can be replayed by a client.

- it could contain the entire state of the battle for each turn
- it could contain the delta state for each turn

begin:
  player: object, array
    minion: object, ordered array
      id, health, attack, attributes
    isfirst: boolean

combat: object, array
  phases: object, array
    changes: object, array
      player, minion, new health, new attack, attribute name, 
      
