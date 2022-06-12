
# Auto Battler

[Play/watch on GitHub here](https://seryckd.github.io/auto-battler/)

This style of game is where the player sets up the game board and then the game
auto plays it self based upon random numbers.

It comprises of

1. Setup of the board (not part of this codebase)
2. Auto play the game and generate a transcript of what happened
3. Play the transcript like a movie

The thing that interested me was the game engine, as these types of games
use the _Magic the Gathering_ style of a simple set of base rules that can
be overruled by individual cards.

I also used the DOM and Webanimations API to do the display as I wanted to learn
the technologies.  As usual this is vanilla Javascript that runs in the client.

------

## Terminology

- board
  The board contains two fields of play
- field of play
  Contains a number of minions in positions
- position
  A place where a minion can be
- turn
  The turn begins when a minion from the field of play is 
  selected to attack and ends when all side effects are finished.
- phase
  Each turn is split into phases
- action
  An action that occurs during the turn, such as a minion attacking.
- player
  A player contains an ever changing set of minions in positions.
- minion
  Something with a defined set of attributes that is used to attack
  and defend.
- skill
  A defined set of rules that a minion may have.

## Base Rules

A player may have 0-7 starting minions.
A player is randomly selected to be the attacker on the first turn.
At the end of the turn the other player becomes the attacker.
Turns continue until there is one or more players with no minions.

A turn begins by selecting an attacking and defending minion.
Combat is resolved by comparing stats.
One or minions may die and be removed.
The turn ends.

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
- skill
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

## Visual Categories

A skill may be associated with a category that has a visual representation. 

| category | description | 
| ---  | --- |
| aftermath | An action occurs on the minions death |
| applied-effect | The minion caused an effect else where |
| many-attacks | The minion makes multiple attacks |
| deadly-damage | The damage caused by this minion can cause death |
| resurrect | The minion will come back to life after dying |
| absorb-damage | This minion will negate some or all damage applied to it |
| block | The minion must be attacked before others |  

## Skills

Skills have an internal name (id), and an optinal public name.  They may also be associated with a visual affect.

| id | name | visual | trigger | description | params |
| ---  | --- | --- | --- | --- | --- |
| frenzy | frenzy | many-attacks | combat resolution | attacks a random target again if it survives combat | number of attacks |
| poison | poison | deadly-damage | on damage | kills anything it damages  | |
| resurect | resurrect | resurrect | on death | comes back to life (once) | |
| shield | shield | absorb-damage | on damage | abosrbs all damage (once) | |
| summon | | aftermath | on death | create more minions in its place | minion type & count |
| wall | wall |block | attack selection | enemies must attack a wall first | |  
| target | | | attack selection | replaces all attack selection rules with its own | rules |
| death2 | | | on aftermath skill | all aftermath skills trigger twice | |
| summon2 | | | on minion summon | summon twice as many minions | |
| shieldflip | | absorb-damage | gains 'shield' when another minion loses 'shield' | |
| summongain | | | gains attack and/or health when a minion is summoned | attack gain, heath gain |
| deathgain | | | gains attack and/or health when a minion dies | attack gain, health gain |
| blockgain | | | gains attack and/or health when a minion with 'block' is attacked | attack gain, health gain |
| triggerdeath | | | causes a random minions aftermath skills to trigger | |  
| shieldgen | | aftermath | on death | give random minions a shield | count |
| blast | | aftermath | on death | cause 1 damage to every minion | |


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
      
engine


context
  has minions

minion
  has skills

skill
  may create actions



# Transcript

The outcome of the battle is written as a script which can be followed (or 'played')
by the viewer.


# Viewer

The viewer doesn't have any game logic, it's job is to read the transcript and 
play the actions that occured.

Animations are used to make the playback visually entertaining. At this point the
player has nothing to do except to watch and guess the outcome so the animations 
do the heavy lifting of keeping engagement.

## Actions

For the viewer, actions are defined as

* Attack
  Animate a minion attacking a defending minion.

* Change
  A change to a minion that should be shown graphically.  This
  could be changes to stats (like health) or the result of gaining
  or losing a skill (such as 'shield').

* Remove
  Animate a minion being removed from the board.

* Add
  Animate a minion being added to the board.

The transcript can give hints to the viewer on how to present the information,
for instance by 'grouping' actions together that should occur at the same time.










